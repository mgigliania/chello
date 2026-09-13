import { NextResponse } from "next/server";
import { providerFor, type Provider } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Listing {
  id: string;
  name: string;
  free: boolean;
}

interface Entry {
  id?: string;
  name?: string;
  display_name?: string;
  pricing?: { prompt?: string; completion?: string };
}

/** Models that cannot hold a conversation, by the naming every provider uses. */
const NOT_CONVERSATIONAL =
  /embed|embedding|aqa|imagen|veo|tts|whisper|rerank|moderation|guard|vision-only/i;

const isFree = (entry: Entry): boolean => {
  if (entry.id?.endsWith(":free")) return true;
  if (!entry.pricing) return false;
  return Number(entry.pricing.prompt) === 0 && Number(entry.pricing.completion) === 0;
};

function request(provider: Provider, key: string): { url: string; headers: HeadersInit } {
  if (provider.transport === "anthropic") {
    return {
      url: `${provider.baseURL}/models`,
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
    };
  }
  return {
    url: `${provider.baseURL}/models`,
    headers: { authorization: `Bearer ${key}` },
  };
}

/**
 * Which models this key can actually call.
 *
 * Model IDs are the most perishable thing in this app — Groq retired its Llama
 * models, Google's Flash line moves every few months — so nothing here is
 * hard-coded. Asked with the learner's own key, the answer is not a guess: it
 * is what that account may call, today.
 */
export async function GET(request_: Request) {
  const url = new URL(request_.url);
  const provider = providerFor(url.searchParams.get("provider") ?? "");
  const key = request_.headers.get("x-pancho-key")?.trim() ?? "";

  // With no key, only a provider that publishes a public catalogue can answer.
  const target = key
    ? request(provider, key)
    : provider.catalogueURL
      ? { url: provider.catalogueURL, headers: {} as HeadersInit }
      : null;
  if (!target) return NextResponse.json({ models: [] });

  try {
    const response = await fetch(target.url, {
      headers: { accept: "application/json", ...target.headers },
    });
    if (!response.ok) return NextResponse.json({ models: [] });

    const body = (await response.json()) as { data?: Entry[]; models?: Entry[] };
    const entries = body.data ?? body.models ?? [];

    const models: Listing[] = entries
      .map((entry) => {
        // Google returns "models/gemini-…"; the chat call wants the bare name.
        const id = (entry.id ?? "").replace(/^models\//, "");
        return {
          id,
          name: entry.display_name ?? entry.name ?? id,
          free: isFree(entry),
        };
      })
      .filter((model) => model.id && !NOT_CONVERSATIONAL.test(model.id))
      .sort((a, b) => Number(b.free) - Number(a.free) || a.id.localeCompare(b.id))
      .slice(0, 60);

    return NextResponse.json({ models });
  } catch {
    // A catalogue we cannot reach is not an error the learner can act on.
    return NextResponse.json({ models: [] });
  }
}
