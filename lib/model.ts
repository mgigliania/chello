import "server-only";
import { modelFor, providerFor, type Provider } from "@/lib/providers";

const ANTHROPIC_VERSION = "2023-06-01";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

/**
 * Resolve the key for one request.
 *
 * A key supplied by the browser wins, so the common deployment costs the
 * operator nothing; the provider's env var is the opt-in for someone who would
 * rather pay for everyone. The key is never logged or persisted.
 */
export function resolveKey(request: Request, provider: Provider): string {
  const supplied = request.headers.get("x-pancho-key")?.trim();
  if (supplied) return supplied;
  const server = process.env[provider.envVar]?.trim();
  if (server) return server;
  throw new UpstreamError("No API key. Add one in Settings.", 401);
}

export function providerFromRequest(body: { provider?: string }): Provider {
  return providerFor(String(body.provider ?? ""));
}

interface CallOptions {
  provider: Provider;
  key: string;
  model: string;
  system: string;
  messages: Message[];
  maxTokens: number;
  temperature?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

/** The two request shapes, behind one call. */
function buildRequest(options: CallOptions): { url: string; init: RequestInit } {
  const { provider } = options;

  if (provider.transport === "anthropic") {
    return {
      url: `${provider.baseURL}/messages`,
      init: {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": options.key,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: options.maxTokens,
          temperature: options.temperature ?? 1,
          system: options.system,
          messages: options.messages,
          stream: options.stream ?? false,
        }),
        signal: options.signal,
      },
    };
  }

  // OpenAI-compatible: the system prompt is the first message, not a field.
  return {
    url: `${provider.baseURL}/chat/completions`,
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${options.key}`,
      },
      body: JSON.stringify({
        model: options.model,
        max_tokens: options.maxTokens,
        temperature: options.temperature ?? 1,
        messages: [
          ...(options.system
            ? [{ role: "system" as const, content: options.system }]
            : []),
          ...options.messages,
        ],
        stream: options.stream ?? false,
      }),
      signal: options.signal,
    },
  };
}

/** Longest pause worth taking before giving the learner an answer either way. */
const MAX_RETRY_MS = 5000;

async function call(options: CallOptions, retried = false): Promise<Response> {
  const { url, init } = buildRequest(options);
  const response = await fetch(url, init);
  if (response.ok) return response;

  // Free tiers meter by the minute, so a burst of quick turns can trip a limit
  // that clears seconds later. One wait-and-retry turns most of those from a
  // dead stop into a slightly slow reply; a second failure is a real limit.
  if (response.status === 429 && !retried) {
    const wait = retryDelay(response.headers.get("retry-after"));
    if (wait !== null) {
      await new Promise((resolve) => setTimeout(resolve, wait));
      return call(options, true);
    }
  }

  const detail = await response.text().catch(() => "");
  throw new UpstreamError(
    readableError(response.status, detail, options.provider),
    response.status,
  );
}

/** How long to wait, or null when the provider says it is longer than a
 *  learner should be left staring at the orb. */
function retryDelay(header: string | null): number | null {
  if (!header) return 2500;
  const seconds = Number(header);
  if (!Number.isFinite(seconds)) return 2500;
  const ms = seconds * 1000;
  return ms > MAX_RETRY_MS ? null : Math.max(500, ms);
}

/** Upstream errors reach a learner mid-conversation, so they are translated
 *  into something a person can act on rather than a raw JSON blob. */
function readableError(status: number, detail: string, provider: Provider): string {
  if (status === 401 || status === 403) {
    return `That ${provider.label} key was not accepted. Check it in Settings.`;
  }
  if (status === 402) {
    return `That ${provider.label} account has no credit left.`;
  }
  if (status === 429) {
    return provider.cost === "free"
      ? `${provider.label}'s free allowance is used up for now. Wait a little, or switch provider in Settings.`
      : "Too many requests just now. Wait a moment and try again.";
  }
  if (status === 404) {
    return `${provider.label} does not know that model name. Check it in Settings.`;
  }
  if (status >= 500) return `${provider.label} is briefly unavailable. Try again.`;

  const upstream = upstreamMessage(detail);
  // Google answers a bad key with 400 "Please pass a valid API key" rather
  // than a 401, so the status alone does not identify the problem.
  if (upstream && /api[ _-]?key/i.test(upstream)) {
    return `That ${provider.label} key was not accepted. Check it in Settings.`;
  }
  if (upstream && /quota|rate limit|resource[ _-]?exhausted/i.test(upstream)) {
    return `${provider.label}'s free allowance is used up for now. Wait a little, or switch provider in Settings.`;
  }
  if (upstream && /model/i.test(upstream) && /not found|not supported|unknown/i.test(upstream)) {
    return `${provider.label} does not know that model name. Check it in Settings.`;
  }
  return upstream ?? "The request was rejected.";
}

/** Providers disagree on the envelope: Anthropic and Groq return an object,
 *  Google returns a single-element array wrapping the same shape. */
function upstreamMessage(detail: string): string | null {
  try {
    const parsed = JSON.parse(detail) as unknown;
    const first = Array.isArray(parsed) ? parsed[0] : parsed;
    const error = (first as { error?: { message?: string } } | null)?.error;
    return error?.message ?? null;
  } catch {
    return null;
  }
}

/** Non-streaming call returning the concatenated text. */
export async function complete(options: CallOptions): Promise<string> {
  const response = await call({ ...options, stream: false });
  const body = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (options.provider.transport === "anthropic") {
    return (body.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("");
  }
  return body.choices?.[0]?.message?.content ?? "";
}

/** Streaming call, re-emitted as plain UTF-8 text so the client can render
 *  tokens without an SSE parser of its own. */
export async function streamText(
  options: CallOptions,
): Promise<ReadableStream<Uint8Array>> {
  const response = await call({ ...options, stream: true });
  const upstream = response.body;
  if (!upstream) throw new UpstreamError("Empty response from the model.", 502);

  const anthropic = options.provider.transport === "anthropic";
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  /** Pull the text delta out of one SSE frame, whichever dialect it is. */
  const deltaOf = (payload: string): string | null => {
    try {
      const event = JSON.parse(payload) as {
        type?: string;
        delta?: { type?: string; text?: string };
        choices?: Array<{ delta?: { content?: string } }>;
      };
      if (anthropic) {
        return event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
          ? (event.delta.text ?? null)
          : null;
      }
      return event.choices?.[0]?.delta?.content ?? null;
    } catch {
      // Partial frame; the next chunk completes it.
      return null;
    }
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            const text = deltaOf(payload);
            if (text) controller.enqueue(encoder.encode(text));
          }
        }
      } catch (error) {
        controller.error(error);
        return;
      } finally {
        reader.releaseLock();
      }
      controller.close();
    },
  });
}

/** Models sometimes wrap JSON in prose or a code fence. Take the outermost
 *  object and let the caller's validation reject anything malformed. */
export function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Common request preamble: which provider, which key, which model. */
export interface CallSetup {
  provider: Provider;
  key: string;
  model: string;
}

export function setup(
  request: Request,
  body: { provider?: string; model?: string; quality?: string },
): CallSetup {
  const provider = providerFor(String(body.provider ?? ""));
  const model = modelFor(provider, String(body.quality ?? ""), body.model);
  // Providers whose free roster rotates ship no default, so the choice is the
  // learner's and an empty one is a setup step rather than a silent failure.
  if (!model) {
    // Phrased to sidestep a/an: provider names vary.
    throw new UpstreamError(
      `Choose a model for ${provider.label} in Settings.`,
      400,
    );
  }
  return { provider, key: resolveKey(request, provider), model };
}

export function failure(error: unknown): { message: string; status: number } {
  return {
    status: error instanceof UpstreamError ? error.status : 500,
    message:
      error instanceof Error ? error.message : "The request was rejected.",
  };
}
