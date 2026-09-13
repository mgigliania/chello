/**
 * Where the thinking happens.
 *
 * Two of these are free to use and one is paid. They are interchangeable
 * because the app only ever asks a provider for text, so the choice is a
 * setting rather than a rewrite — and if a free tier changes its terms, the
 * answer is to switch provider, not to ship new code.
 */

export type ProviderID = "google" | "groq" | "anthropic";

export interface Provider {
  id: ProviderID;
  label: string;
  /** One line, written for someone choosing rather than someone integrating. */
  blurb: string;
  cost: "free" | "paid";
  /** Which request shape to speak. */
  transport: "openai" | "anthropic";
  baseURL: string;
  /** Model IDs get retired — Groq withdrew its Llama models in August 2026 —
   *  so these are defaults, and Settings lets anyone type a newer one. */
  defaultModel: string;
  /** The deeper option where the provider has one worth the wait. */
  deepModel: string;
  keyURL: string;
  keyHint: string;
  /** Server-side key, for an operator who would rather pay for everyone. */
  envVar: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "google",
    label: "Google Gemini",
    blurb: "Free, no card needed. The easiest way to start.",
    cost: "free",
    transport: "openai",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.5-flash",
    deepModel: "gemini-2.5-pro",
    keyURL: "https://aistudio.google.com/apikey",
    keyHint: "AIza…",
    envVar: "GOOGLE_API_KEY",
  },
  {
    id: "groq",
    label: "Groq",
    blurb: "Free and very fast — replies land almost instantly.",
    cost: "free",
    transport: "openai",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "openai/gpt-oss-120b",
    deepModel: "openai/gpt-oss-120b",
    keyURL: "https://console.groq.com/keys",
    keyHint: "gsk_…",
    envVar: "GROQ_API_KEY",
  },
  {
    id: "anthropic",
    label: "Claude",
    blurb: "Paid, and the best teacher of the three.",
    cost: "paid",
    transport: "anthropic",
    baseURL: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-5",
    deepModel: "claude-opus-5",
    keyURL: "https://console.anthropic.com/settings/keys",
    keyHint: "sk-ant-…",
    envVar: "ANTHROPIC_API_KEY",
  },
];

export const DEFAULT_PROVIDER: ProviderID = "google";

export function providerFor(id: string): Provider {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

/** The model to use, honouring an override typed in Settings. */
export function modelFor(
  provider: Provider,
  quality: string,
  override?: string,
): string {
  const trimmed = override?.trim();
  if (trimmed) return trimmed;
  return quality === "best" ? provider.deepModel : provider.defaultModel;
}
