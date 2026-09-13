import { moduleOrDefault } from "@/lib/languages";

export interface ConversationTheme {
  id: string;
  title: string;
  subtitle: string;
  /** Key into the icon set in components/Icons.tsx. */
  symbol: string;
  category: string;
  /** Given to the model as the scene. Never shown to the learner. */
  situation: string;
  colorIndex: number;
}

export const THEME_CATEGORIES = [
  "All",
  "Everyday",
  "Connection",
  "Local life",
  "Interests",
] as const;

const SHARED: ConversationTheme[] = [
  {
    id: "coffee",
    title: "A coffee?",
    subtitle: "Something warm, please",
    symbol: "cup",
    category: "Everyday",
    situation:
      "You work in a cosy café. Help the learner order, then chat naturally.",
    colorIndex: 0,
  },
  {
    id: "weekend",
    title: "The weekend",
    subtitle: "Tell me about yours",
    symbol: "sunrise",
    category: "Connection",
    situation:
      "Ask about the learner's weekend. Practise past events and follow their interests.",
    colorIndex: 1,
  },
  {
    id: "walk",
    title: "A little walk",
    subtitle: "Out into the fresh air",
    symbol: "tree",
    category: "Local life",
    situation:
      "Take an imagined walk together. Talk about nature, weather and daily life.",
    colorIndex: 2,
  },
  {
    id: "dinner",
    title: "Dinner plans",
    subtitle: "Let's make something",
    symbol: "cutlery",
    category: "Everyday",
    situation:
      "Plan dinner together. Ask about ingredients, preferences and the steps of cooking.",
    colorIndex: 3,
  },
  {
    id: "introductions",
    title: "Nice to meet you",
    subtitle: "Start somewhere small",
    symbol: "wave",
    category: "Connection",
    situation:
      "Meet the learner for the first time. Learn their interests through natural introductions.",
    colorIndex: 0,
  },
  {
    id: "groceries",
    title: "At the market",
    subtitle: "Find the good tomatoes",
    symbol: "basket",
    category: "Everyday",
    situation:
      "Help the learner shop at a local food market. Practise quantities and questions.",
    colorIndex: 2,
  },
  {
    id: "travel",
    title: "Next stop",
    subtitle: "A ticket to somewhere",
    symbol: "tram",
    category: "Everyday",
    situation:
      "Plan a train trip. Discuss routes and tickets without inventing real current schedules.",
    colorIndex: 1,
  },
  {
    id: "home",
    title: "A place of your own",
    subtitle: "Make yourself at home",
    symbol: "house",
    category: "Everyday",
    situation:
      "Discuss a home, rooms, moving and what makes a place comfortable.",
    colorIndex: 3,
  },
  {
    id: "friends",
    title: "New friends",
    subtitle: "An invitation, maybe",
    symbol: "people",
    category: "Connection",
    situation:
      "You are a friendly new acquaintance. Arrange something to do together.",
    colorIndex: 0,
  },
  {
    id: "work",
    title: "Monday morning",
    subtitle: "Around the office",
    symbol: "briefcase",
    category: "Everyday",
    situation:
      "Chat as colleagues. Discuss work, meetings and a small problem to solve.",
    colorIndex: 1,
  },
  {
    id: "weather",
    title: "Rain again?",
    subtitle: "Whatever the weather",
    symbol: "rain",
    category: "Local life",
    situation:
      "Talk about weather, clothing and outdoor plans. Do not claim today's forecast.",
    colorIndex: 1,
  },
  {
    id: "cabin",
    title: "A weekend away",
    subtitle: "A quieter kind of day",
    symbol: "mountain",
    category: "Local life",
    situation:
      "Plan a weekend away: travel, food, walks and relaxing together.",
    colorIndex: 2,
  },
  {
    id: "music",
    title: "On repeat",
    subtitle: "What are you listening to?",
    symbol: "music",
    category: "Interests",
    situation:
      "Ask about music the learner enjoys. Explore feelings, favourites and concerts.",
    colorIndex: 0,
  },
  {
    id: "film",
    title: "One more episode",
    subtitle: "Something worth watching",
    symbol: "film",
    category: "Interests",
    situation:
      "Discuss films and series. Ask for opinions and avoid unwanted spoilers.",
    colorIndex: 1,
  },
  {
    id: "books",
    title: "Between the pages",
    subtitle: "A story that stayed",
    symbol: "book",
    category: "Interests",
    situation:
      "Chat about books, characters, stories and why they matter to the learner.",
    colorIndex: 3,
  },
  {
    id: "design",
    title: "Good things",
    subtitle: "Made with a little care",
    symbol: "pencil",
    category: "Interests",
    situation:
      "Explore design, architecture and objects the learner loves. Ask for concrete opinions.",
    colorIndex: 0,
  },
  {
    id: "technology",
    title: "What comes next",
    subtitle: "Ideas, tools and tomorrow",
    symbol: "sparkles",
    category: "Interests",
    situation:
      "Discuss technology and how it changes daily life. Avoid claims that need today's facts.",
    colorIndex: 1,
  },
  {
    id: "travelstories",
    title: "Somewhere else",
    subtitle: "A place you remember",
    symbol: "globe",
    category: "Interests",
    situation:
      "Exchange travel stories and dream destinations. Invite descriptions and comparisons.",
    colorIndex: 2,
  },
  {
    id: "restaurant",
    title: "A table for two",
    subtitle: "Stay for dessert",
    symbol: "glass",
    category: "Everyday",
    situation:
      "Role-play a restaurant meal. Practise requests, preferences and polite problem-solving.",
    colorIndex: 0,
  },
  {
    id: "neighbours",
    title: "Next door",
    subtitle: "A familiar face",
    symbol: "buildings",
    category: "Connection",
    situation:
      "Chat as neighbours. Discuss the neighbourhood and small requests for help.",
    colorIndex: 3,
  },
  {
    id: "traditions",
    title: "Everyday customs",
    subtitle: "Small customs, big stories",
    symbol: "flag",
    category: "Local life",
    situation:
      "Explore everyday customs with nuance. Avoid treating a whole culture as alike.",
    colorIndex: 2,
  },
  {
    id: "opinions",
    title: "What do you think?",
    subtitle: "Room for another view",
    symbol: "quote",
    category: "Connection",
    situation:
      "Choose an everyday dilemma. Invite reasons and gently explore another perspective.",
    colorIndex: 1,
  },
  {
    id: "future",
    title: "A year from now",
    subtitle: "Plans worth talking about",
    symbol: "plane",
    category: "Connection",
    situation:
      "Talk about hopes and future plans. Explore possibilities and practical next steps.",
    colorIndex: 3,
  },
  {
    id: "health",
    title: "Taking care",
    subtitle: "Rest, move, repeat",
    symbol: "heart",
    category: "Local life",
    situation:
      "Talk about sleep, exercise and everyday wellbeing. Offer no medical advice or diagnosis.",
    colorIndex: 0,
  },
];

/** Themes for a language, with its own overrides applied. */
export function themesFor(languageID: string): ConversationTheme[] {
  const overrides = moduleOrDefault(languageID).themeOverrides;
  return SHARED.map((theme) => ({ ...theme, ...(overrides[theme.id] ?? {}) }));
}

export function themeFor(
  languageID: string,
  themeID: string | undefined,
): ConversationTheme | undefined {
  if (!themeID) return undefined;
  return themesFor(languageID).find((theme) => theme.id === themeID);
}
