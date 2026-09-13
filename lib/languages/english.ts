import type { LanguageModule } from "./module";

export const english: LanguageModule = {
  id: "en",
  name: "English",
  nativeName: "English",
  variety: "International",
  locale: "en-GB",
  voiceFallbacks: ["en-US", "en"],
  greeting: "Hi!",
  greetingWord: "hi",
  flag: "🌍",
  speechGuidance:
    "Use clear, natural international English at a friendly pace. Accept British, American, Irish, Indian, African, Caribbean and other valid varieties from the learner without marking them wrong. Do not imitate a regional caricature.",
  writingGuidance:
    "Use consistent standard English spelling and punctuation. Do not switch between British and American spelling within one reply.",
  lemmaGuidance:
    "Give verbs in the base form such as to arrive, nouns in the singular, and keep multi-word verbs such as look after together as one entry.",
  teachingFocus: [
    "Greetings, introductions and short useful chunks such as my name is and I'd like.",
    "Everyday questions, present simple and continuous, articles and countable nouns.",
    "Connected stories, past simple and present perfect in context, and familiar situations.",
    "Reasons and opinions, conditionals, modal verbs for politeness and degrees of certainty.",
    "Nuance, hypothetical situations, register, phrasal verbs and idiomatic phrasing.",
    "Flexible advanced discussion with precise, natural English and appropriate tone.",
  ],
  interestsPlaceholder: "Food, film, travel, work…",
  themeOverrides: {},
};
