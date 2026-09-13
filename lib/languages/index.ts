import type { LanguageModule } from "./module";
import { spanish } from "./spanish";
import { portuguese } from "./portuguese";
import { italian } from "./italian";
import { french } from "./french";
import { english } from "./english";

export type { LanguageModule };

export const LANGUAGES: LanguageModule[] = [
  spanish,
  portuguese,
  italian,
  french,
  english,
];

export const DEFAULT_LANGUAGE_ID = "es";

export function moduleFor(id: string): LanguageModule | undefined {
  return LANGUAGES.find((language) => language.id === id);
}

/** Never returns undefined — callers render a screen either way. */
export function moduleOrDefault(id: string): LanguageModule {
  return moduleFor(id) ?? spanish;
}

/** Languages offered for meaning subtitles. Learners read these, so the list
 *  is wider than the set we teach. */
export const MEANING_LANGUAGES = [
  "English",
  "Spanish",
  "Portuguese",
  "Italian",
  "French",
  "German",
  "Dutch",
  "Polish",
  "Arabic",
  "Ukrainian",
] as const;

const MEANING_GREETINGS: Record<string, string> = {
  English: "Hi!",
  Spanish: "¡Hola!",
  Portuguese: "Oi!",
  Italian: "Ciao!",
  French: "Salut !",
  German: "Hallo!",
  Dutch: "Hoi!",
  Polish: "Cześć!",
  Arabic: "مرحبًا!",
  Ukrainian: "Привіт!",
};

export function meaningGreeting(language: string): string {
  return MEANING_GREETINGS[language] ?? "Hi!";
}
