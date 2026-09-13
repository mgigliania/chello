import type { ConversationTheme } from "@/lib/themes";

/** A target language's content and teaching policy.
 *  `id` is a stable storage key — never rename one in place. */
export interface LanguageModule {
  id: string;
  name: string;
  nativeName: string;
  /** The variety the voice and guidance aim at, e.g. "Spain". */
  variety: string;
  /** BCP-47 tag used for speech recognition and synthesis. */
  locale: string;
  /** Fallback locales if the device has no voice for `locale`. */
  voiceFallbacks: string[];
  greeting: string;
  greetingWord: string;
  flag: string;
  speechGuidance: string;
  writingGuidance: string;
  lemmaGuidance: string;
  /** Six ascending bands of communicative demand, indexed by challenge 0–5. */
  teachingFocus: string[];
  interestsPlaceholder: string;
  themeOverrides: Record<string, Partial<ConversationTheme>>;
}
