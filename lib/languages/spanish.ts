import type { LanguageModule } from "./module";

export const spanish: LanguageModule = {
  id: "es",
  name: "Spanish",
  nativeName: "Español",
  variety: "Spain",
  locale: "es-ES",
  voiceFallbacks: ["es-MX", "es-US", "es"],
  greeting: "¡Hola!",
  greetingWord: "hola",
  flag: "🇪🇸",
  speechGuidance:
    "Use clear Spanish from Spain, with a natural distinction between s and z/soft c, tú for friendly singular address and vosotros for informal plural address. Accept seseo, ustedes, voseo and other valid regional forms without marking them wrong. Do not imitate a regional caricature.",
  writingGuidance:
    "Use standard Spanish spelling, accents, and opening question and exclamation marks.",
  lemmaGuidance:
    "Give nouns with their singular grammatical article and verbs in the infinitive, for example la casa and hablar. Keep reflexive verbs such as llamarse distinct. Preserve accents and ñ.",
  teachingFocus: [
    "Greetings, introductions and short useful chunks such as me llamo and quiero.",
    "Everyday questions, gender and number agreement, present tense and useful ser/estar contrasts.",
    "Connected stories, past events, object pronouns and familiar situations.",
    "Reasons and opinions, contrasts between past tenses and common subjunctive contexts.",
    "Nuance, hypothetical situations, register and regional variation.",
    "Flexible advanced discussion with precise, idiomatic Spanish.",
  ],
  interestsPlaceholder: "Food, travel, music, life in Spain…",
  themeOverrides: {
    coffee: {
      title: "Un café",
      situation:
        "Meet in a neighbourhood café in Spain. Order a drink and chat. Ask about the learner's interests.",
    },
    groceries: {
      title: "En el mercado",
      subtitle: "A little of everything",
      situation:
        "Visit a local market in a Spanish-speaking community. Practise quantities, prices and polite questions. Respect regional food vocabulary.",
    },
    travel: {
      situation:
        "Plan a trip in Spain. Discuss transport and tickets without inventing current schedules.",
    },
    cabin: {
      subtitle: "Somewhere in the sunshine",
      situation:
        "Plan an imagined weekend in a Spanish-speaking place. Choose a city, coast or countryside together and discuss practical plans.",
    },
    traditions: {
      title: "La sobremesa",
      subtitle: "Let the conversation linger",
      situation:
        "Talk after a shared meal about daily routines, family and local customs. Compare experiences without treating Spanish-speaking cultures as uniform.",
    },
  },
};
