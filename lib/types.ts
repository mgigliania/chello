/** Core domain types. Mirrors the evidence model: what the learner actually
 *  produced, how well supported it was, and what that implies for practice. */

export type Speaker = "user" | "assistant";

/** How a word appeared. Only `independent` counts as unaided recall. */
export type EvidenceKind =
  | "exposure"
  | "understanding"
  | "assisted"
  | "independent"
  | "lapse";

export type Outcome = "success" | "partial" | "breakdown" | "uncertain";

export interface Fragment {
  id: string;
  revision: number;
  speaker: Speaker;
  text: string;
  startMS: number;
  endMS: number;
  receivedAt: number;
  /** Meaning subtitles were on screen while this was produced. */
  meaningVisible: boolean;
  /** Typed rather than spoken. */
  typed: boolean;
}

export interface Passage {
  id: string;
  speaker: Speaker;
  fragments: Fragment[];
}

export interface WordProposal {
  lemma: string;
  meaning: string;
  form: string;
  kind: EvidenceKind;
  confidence: number;
  sourceIDs: string[];
  quote: string;
  language: string;
}

export interface Assessment {
  passageID: string;
  revisionKey: string;
  outcome: Outcome;
  suggestedLevel: number;
  nextGoal: string;
  capability: string;
  words: WordProposal[];
  createdAt: number;
  /** Theme id, or "free" — used to require recall in *different* contexts. */
  context: string;
}

export interface SessionRecord {
  id: string;
  languageID: string;
  startedAt: number;
  endedAt?: number;
  themeID?: string;
  title: string;
  fragments: Fragment[];
  assessments: Assessment[];
  translations: Record<string, string>;
  endReason?: string;
}

export interface Preferences {
  learningLanguageID: string;
  meaningVisible: boolean;
  meaningLanguage: string;
  /** Locale for the app's own chrome, independent of what is being learned. */
  interfaceLanguage: string;
  hiddenWords: string[];
  interests: string;
  hasOnboarded: boolean;
  speechRate: number;
  /** Which service answers. Two of the three are free. */
  provider: string;
  /** Model name typed in Settings, per provider. Providers retire model IDs,
   *  so this is the escape hatch that avoids waiting on a code change. */
  models: Record<string, string>;
  /** "balanced" for a fast partner, "best" for the deeper model. */
  quality: "balanced" | "best";
  /** "system" follows the device; the others override it in both directions. */
  theme: "system" | "light" | "dark";
}

export interface Archive {
  schemaVersion: number;
  sessions: SessionRecord[];
  preferences: Preferences;
}

export interface WordState {
  id: string;
  lemma: string;
  meaning: string;
  form: string;
  example: string;
  bars: number;
  understandingCount: number;
  independentCount: number;
  lastSeen: number;
  dueAt: number;
}

export interface LearnerState {
  challenge: number;
  observationCount: number;
  nextGoal: string;
  capabilities: string[];
  words: WordState[];
}

export const wordKey = (w: WordProposal): string =>
  `${w.language}|${w.lemma.trim().toLowerCase()}|${w.meaning.toLowerCase()}`;

export function passageRevisionKey(passage: Passage): string {
  return passage.fragments.map((f) => `${f.id}:${f.revision}`).join(",");
}

export function passageText(passage: Passage): string {
  return passage.fragments.map((f) => f.text).join("");
}

/** Group consecutive same-speaker fragments into turns. A gap longer than
 *  `gapMS` starts a new passage so a long pause is not read as one breath. */
export function toPassages(fragments: Fragment[], gapMS = 2500): Passage[] {
  const ordered = [...fragments].sort((a, b) => a.startMS - b.startMS);
  const passages: Passage[] = [];
  for (const fragment of ordered) {
    const current = passages[passages.length - 1];
    const previous = current?.fragments[current.fragments.length - 1];
    if (
      current &&
      previous &&
      current.speaker === fragment.speaker &&
      fragment.startMS - previous.endMS <= gapMS
    ) {
      current.fragments.push(fragment);
    } else {
      passages.push({
        id: fragment.id,
        speaker: fragment.speaker,
        fragments: [fragment],
      });
    }
  }
  return passages;
}
