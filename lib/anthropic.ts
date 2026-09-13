import "server-only";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

/** Conversation is latency-critical, so the default is the fast capable model.
 *  Learners can opt into the deeper one in Settings. */
export const MODELS = {
  balanced: "claude-sonnet-5",
  best: "claude-opus-5",
} as const;

export type Quality = keyof typeof MODELS;

export function modelFor(quality: string | undefined): string {
  return quality === "best" ? MODELS.best : MODELS.balanced;
}

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
 * operator nothing; `ANTHROPIC_API_KEY` is the opt-in for someone who would
 * rather pay for their friends. The key is never logged or persisted.
 */
export function resolveKey(request: Request): string {
  const supplied = request.headers.get("x-chello-key")?.trim();
  if (supplied) return supplied;
  const server = process.env.ANTHROPIC_API_KEY?.trim();
  if (server) return server;
  throw new UpstreamError("No API key. Add one in Settings.", 401);
}

interface CallOptions {
  key: string;
  model: string;
  system: string;
  messages: Message[];
  maxTokens: number;
  temperature?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

async function call(options: CallOptions): Promise<Response> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": options.key,
      "anthropic-version": API_VERSION,
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
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new UpstreamError(readableError(response.status, detail), response.status);
  }
  return response;
}

/** Upstream errors reach a learner mid-conversation, so they are translated
 *  into something a person can act on rather than a raw JSON blob. */
function readableError(status: number, detail: string): string {
  if (status === 401) return "That API key was not accepted. Check it in Settings.";
  if (status === 402 || status === 403)
    return "That API key has no credit or lacks access to this model.";
  if (status === 429) return "Too many requests just now. Wait a moment and try again.";
  if (status >= 500) return "The model is briefly unavailable. Try again.";
  try {
    const parsed = JSON.parse(detail) as { error?: { message?: string } };
    if (parsed.error?.message) return parsed.error.message;
  } catch {
    // Fall through to the generic message.
  }
  return "The request was rejected.";
}

/** Non-streaming call returning the concatenated text blocks. */
export async function complete(options: CallOptions): Promise<string> {
  const response = await call({ ...options, stream: false });
  const body = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return (body.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("");
}

/** Streaming call, re-emitted as plain UTF-8 text so the client can render
 *  tokens without an SSE parser of its own. */
export async function streamText(options: CallOptions): Promise<ReadableStream<Uint8Array>> {
  const response = await call({ ...options, stream: true });
  const upstream = response.body;
  if (!upstream) throw new UpstreamError("Empty response from the model.", 502);

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

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
            try {
              const event = JSON.parse(payload) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta" &&
                event.delta.text
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            } catch {
              // Partial frame; the next chunk completes it.
            }
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
