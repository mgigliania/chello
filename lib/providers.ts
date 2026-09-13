/**
 * Where the thinking happens.
 *
 * Two of these are free to use and one is paid. They are interchangeable
 * because the app only ever asks a provider for text, so the choice is a
 * setting rather than a rewrite — and if a free tier changes its terms, the
 * answer is to switch provider, not to ship new code.
 */

export type ProviderID = "google" | "groq" | "openrouter" | "anthropic";

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
  /** Loose prefix check, so a wrong paste is caught before it costs a request.
   *  Deliberately permissive: a false warning is worse than a missed one. */
  keyPattern: RegExp;
  /** Server-side key, for an operator who would rather pay for everyone. */
  envVar: string;
  /** A public catalogue of this provider's models, where one exists. Used to
   *  offer whatever is free today rather than a guess baked in at build time. */
  catalogueURL?: string;
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
    // Google moved to "auth keys" (AQ.Ab…) during 2026 and is retiring the
    // older AIza "standard keys"; both are accepted as Bearer tokens on the
    // OpenAI-compatible endpoint, so both are allowed here.
    keyHint: "AQ.Ab…",
    keyPattern: /^(AQ\.|AIza)/,
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
    keyPattern: /^gsk_/,
    envVar: "GROQ_API_KEY",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    blurb: "One key, many free models — including Llama when it is free.",
    cost: "free",
    transport: "openai",
    baseURL: "https://openrouter.ai/api/v1",
    // Deliberately blank: which models are free rotates, so the app asks
    // OpenRouter what is free today instead of shipping a stale guess.
    defaultModel: "",
    deepModel: "",
    keyURL: "https://openrouter.ai/keys",
    keyHint: "sk-or-v1-…",
    keyPattern: /^sk-or-/,
    envVar: "OPENROUTER_API_KEY",
    catalogueURL: "https://openrouter.ai/api/v1/models",
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
    keyPattern: /^sk-ant-/,
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
