import type { LanguageModule } from "./module";

export const french: LanguageModule = {
  id: "fr",
  name: "French",
  nativeName: "Français",
  variety: "France",
  locale: "fr-FR",
  voiceFallbacks: ["fr-CA", "fr"],
  greeting: "Salut !",
  greetingWord: "salut",
  flag: "🇫🇷",
  speechGuidance:
    "Use clear, natural metropolitan French pronunciation. Use tu in a friendly conversation and vous when the situation calls for formality or plural address. Accept valid regional accents, vocabulary and grammar from across the French-speaking world. Do not treat regional variation, informal omission of ne, or a non-native accent alone as an error. Do not imitate a regional caricature.",
  writingGuidance:
    "Use standard French spelling, accents, apostrophes and punctuation. Preserve accents on capital letters. Match the register to the situation and accept valid regional usage from the learner.",
  lemmaGuidance:
    "Give nouns with a singular article that makes gender clear where possible and verbs in the infinitive, for example une maison, un ami and parler. Keep pronominal verbs such as se souvenir distinct. Preserve accents and meaningful elisions.",
  teachingFocus: [
    "Greetings, introductions and useful everyday chunks such as je m'appelle and je voudrais.",
    "Everyday questions, grammatical gender, present tense and common negation in conversation.",
    "Connected stories, passé composé and imparfait in context, future plans and familiar situations.",
    "Reasons and opinions, object pronouns, conditional requests and common subjunctive contexts.",
    "Nuance, hypothetical situations, register, idiomatic phrasing and regional variation.",
    "Flexible advanced discussion with precise, natural French and appropriate tone.",
  ],
  interestsPlaceholder: "Food, cinema, travel, life in France…",
  themeOverrides: {
    coffee: {
      title: "Un café ?",
      situation:
        "Meet in a neighbourhood café in France. Order a drink and chat. Use polite greetings with staff and a friendly register with the learner.",
    },
    groceries: {
      title: "Au marché",
      subtitle: "A little of everything",
      situation:
        "Visit a local market in France. Practise quantities, prices and polite requests, then ask what the learner likes to cook.",
    },
    travel: {
      title: "En route",
      situation:
        "Plan a trip in France. Discuss transport, directions and tickets without inventing current schedules.",
    },
    cabin: {
      subtitle: "A change of scene",
      situation:
        "Plan an imagined weekend in a French-speaking place. Choose a city, coast or countryside together and discuss practical plans.",
    },
    traditions: {
      title: "À table",
      subtitle: "Stay a little longer",
      situation:
        "Talk over an imagined meal about daily routines and local customs. Compare the learner's experiences with life in France without treating French-speaking cultures as uniform.",
    },
  },
};
