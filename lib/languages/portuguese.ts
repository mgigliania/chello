import type { LanguageModule } from "./module";

export const portuguese: LanguageModule = {
  id: "pt",
  name: "Portuguese",
  nativeName: "Português",
  variety: "Brazil",
  locale: "pt-BR",
  voiceFallbacks: ["pt-PT", "pt"],
  greeting: "Oi!",
  greetingWord: "oi",
  flag: "🇧🇷",
  speechGuidance:
    "Use clear, natural Brazilian Portuguese. Use você for friendly address and vocês for plural. Keep open and closed vowels distinct, and use natural nasal vowels in words such as não and bem. Accept European and African Portuguese forms, including tu with its own agreement, as valid rather than wrong. Do not imitate a regional caricature.",
  writingGuidance:
    "Use standard Portuguese spelling under the current orthographic agreement, with correct accents, cedilla and tildes.",
  lemmaGuidance:
    "Give nouns with a singular article that makes gender clear, for example a casa and o livro, and verbs in the infinitive such as falar. Keep pronominal verbs such as lembrar-se distinct. Preserve accents, ç and nasal tildes.",
  teachingFocus: [
    "Greetings, introductions and useful everyday chunks such as me chamo and eu queria.",
    "Everyday questions, gender and number agreement, present tense and the ser/estar contrast.",
    "Connected stories, pretérito perfeito and imperfeito in context, plans, and familiar situations.",
    "Reasons and opinions, object pronouns, the future subjunctive after quando and se, and polite requests.",
    "Nuance, hypothetical situations, register, idiomatic phrasing and regional variation.",
    "Flexible advanced discussion with precise, natural Portuguese and appropriate tone.",
  ],
  interestsPlaceholder: "Food, music, football, life in Brazil…",
  themeOverrides: {
    coffee: {
      title: "Um cafezinho",
      situation:
        "Meet in a neighbourhood café in Brazil. Order a drink and chat. Ask about the learner's interests.",
    },
    groceries: {
      title: "Na feira",
      subtitle: "A little of everything",
      situation:
        "Visit a street market in a Portuguese-speaking place. Practise quantities, prices and polite questions. Respect regional food vocabulary.",
    },
    travel: {
      situation:
        "Plan a trip in Brazil. Discuss transport, distances and tickets without inventing current schedules.",
    },
    cabin: {
      subtitle: "A weekend near the water",
      situation:
        "Plan an imagined weekend in a Portuguese-speaking place. Choose a city, coast or countryside together and discuss practical plans.",
    },
    traditions: {
      title: "À mesa",
      subtitle: "Stay a little longer",
      situation:
        "Talk over an imagined meal about daily routines, family and local customs. Compare experiences without treating Portuguese-speaking cultures as uniform.",
    },
  },
};
