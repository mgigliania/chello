import type { LanguageModule } from "./module";

export const italian: LanguageModule = {
  id: "it",
  name: "Italian",
  nativeName: "Italiano",
  variety: "Italy",
  locale: "it-IT",
  voiceFallbacks: ["it-CH", "it"],
  greeting: "Ciao!",
  greetingWord: "ciao",
  flag: "🇮🇹",
  speechGuidance:
    "Use clear, natural standard Italian. Keep double consonants audibly long, distinguish open and closed e and o where standard usage does, and use tu in friendly conversation and Lei when the situation calls for formality. Accept valid regional pronunciation and vocabulary from across Italy without marking it wrong. Do not imitate a regional caricature.",
  writingGuidance:
    "Use standard Italian spelling, accents and apostrophes, including elisions such as l'amico and correct grave and acute accents.",
  lemmaGuidance:
    "Give nouns with a singular definite article that makes gender clear, for example la casa and il libro, and verbs in the infinitive such as parlare. Keep reflexive verbs such as chiamarsi distinct. Preserve accents and apostrophes.",
  teachingFocus: [
    "Greetings, introductions and useful everyday chunks such as mi chiamo and vorrei.",
    "Everyday questions, gender and number agreement, present tense and the essere/avere contrast.",
    "Connected stories, passato prossimo and imperfetto in context, plans, and familiar situations.",
    "Reasons and opinions, combined pronouns, the conditional for polite requests and common subjunctive contexts.",
    "Nuance, hypothetical periods, register, idiomatic phrasing and regional variation.",
    "Flexible advanced discussion with precise, natural Italian and appropriate tone.",
  ],
  interestsPlaceholder: "Food, cinema, travel, life in Italy…",
  themeOverrides: {
    coffee: {
      title: "Un caffè",
      situation:
        "Meet at a neighbourhood bar in Italy. Order at the counter and chat. Ask about the learner's interests.",
    },
    groceries: {
      title: "Al mercato",
      subtitle: "A little of everything",
      situation:
        "Visit a local market in Italy. Practise quantities, prices and polite requests, then ask what the learner likes to cook.",
    },
    travel: {
      situation:
        "Plan a trip in Italy. Discuss trains, directions and tickets without inventing current schedules.",
    },
    cabin: {
      subtitle: "A change of scene",
      situation:
        "Plan an imagined weekend somewhere in Italy. Choose a city, coast or mountains together and discuss practical plans.",
    },
    traditions: {
      title: "A tavola",
      subtitle: "Stay a little longer",
      situation:
        "Talk over an imagined meal about daily routines, family and local customs. Compare experiences without treating Italian regions as alike.",
    },
  },
};
