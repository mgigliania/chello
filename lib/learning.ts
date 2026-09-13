import { moduleFor } from "@/lib/languages";
import type {
  Assessment,
  LearnerState,
  SessionRecord,
  WordProposal,
  WordState,
} from "@/lib/types";
import { passageText, toPassages, wordKey } from "@/lib/types";

const DAY_MS = 86_400_000;
/** Days of rest after reaching 0, 1, 2 and 3 bars. */
const REVISIT_DAYS = [1, 1, 4, 14];
/** A phrase the assistant said this recently was probably imitated, not recalled. */
const IMITATION_WINDOW_MS = 90_000;

const fold = (value: string) => value.normalize("NFC").toLocaleLowerCase();
const contains = (haystack: string, needle: string) =>
  fold(haystack).includes(fold(needle));
const startOfDay = (ms: number) => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const BAR_LABELS = ["New", "Fragile", "Growing", "Steady"] as const;

export function barLabel(bars: number): string {
  return BAR_LABELS[Math.min(3, Math.max(0, bars))];
}

export function barExplanation(word: WordState): string {
  if (word.independentCount === 0)
    return "Heard or used with support. Try using it in your own words.";
  if (word.bars === 1) return "Used independently. We'll bring it back soon.";
  if (word.bars === 2)
    return "Recalled on different days. Still worth revisiting.";
  return "Recalled across days and contexts. Strength can fade with time.";
}

/**
 * Keep only evidence the transcript actually supports.
 *
 * The model proposes; this decides. Anything it cannot tie to an exact quote
 * inside the assessed passage is dropped, and production that was scaffolded —
 * by visible subtitles, by typing, or by the assistant having just said the
 * same form — is demoted from `independent` to `assisted`. Awarding false
 * competence is the expensive mistake here, so every check fails closed.
 */
export function validate(
  proposal: Assessment,
  session: SessionRecord,
): Assessment | null {
  if (!moduleFor(session.languageID)) return null;

  const passages = toPassages(session.fragments);
  const passage = passages.find(
    (candidate) =>
      candidate.id === proposal.passageID && candidate.speaker === "user",
  );
  if (!passage) return null;

  const revisionKey = passage.fragments
    .map((fragment) => `${fragment.id}:${fragment.revision}`)
    .join(",");
  if (revisionKey !== proposal.revisionKey) return null;
  if (!Number.isInteger(proposal.suggestedLevel)) return null;
  if (proposal.suggestedLevel < 0 || proposal.suggestedLevel > 5) return null;
  if (proposal.words.length > 12) return null;

  const allowed = new Set(passage.fragments.map((fragment) => fragment.id));
  const text = passageText(passage);
  const scaffolded = passage.fragments.some(
    (fragment) => fragment.meaningVisible || fragment.typed,
  );

  const words = proposal.words.reduce<WordProposal[]>((kept, word) => {
    const ok =
      word.language === session.languageID &&
      word.sourceIDs.length > 0 &&
      word.sourceIDs.every((id) => allowed.has(id)) &&
      Number.isFinite(word.confidence) &&
      word.confidence >= 0.8 &&
      word.confidence <= 1 &&
      word.lemma.length > 0 &&
      word.lemma.length < 100 &&
      word.meaning.length > 0 &&
      word.meaning.length < 180 &&
      word.form.length > 0 &&
      word.quote.length > 0 &&
      contains(text, word.quote) &&
      contains(word.quote, word.form);
    if (!ok) return kept;

    const referenced = passage.fragments
      .filter((fragment) => word.sourceIDs.includes(fragment.id))
      .map((fragment) => fragment.text)
      .join("");
    if (!contains(referenced, word.quote)) return kept;

    const start = passage.fragments[0]?.startMS ?? 0;
    const imitated = passages.some(
      (candidate) =>
        candidate.speaker === "assistant" &&
        (candidate.fragments[0]?.startMS ?? 0) <= start &&
        start -
          Math.max(...candidate.fragments.map((fragment) => fragment.endMS)) <
          IMITATION_WINDOW_MS &&
        contains(passageText(candidate), word.form),
    );

    const demote =
      word.kind === "independent" && (scaffolded || imitated)
        ? { ...word, kind: "assisted" as const }
        : word;
    kept.push(demote);
    return kept;
  }, []);

  return {
    ...proposal,
    nextGoal: proposal.nextGoal.slice(0, 300),
    capability: proposal.capability.slice(0, 160),
    words,
  };
}

interface Observation {
  word: WordProposal;
  at: number;
  context: string;
}

/**
 * Replay every validated assessment to derive the learner's current state.
 *
 * Nothing is stored incrementally: bars, challenge level and due dates are all
 * recomputed from the evidence, so correcting or hiding a word takes effect
 * immediately and there is no drifting counter to repair.
 */
export function project(
  sessions: SessionRecord[],
  languageID: string,
  hiddenWords: string[] = [],
  now: number = Date.now(),
): LearnerState {
  let challenge = 0;
  let observationCount = 0;
  let streak = 0;
  let nextGoal =
    "Start with a greeting and one small question. Adjust from what the learner actually says.";

  const hidden = new Set(hiddenWords);
  const capabilityEvidence = new Map<string, Set<string>>();
  const events = new Map<string, Observation[]>();

  const relevant = sessions
    .filter((session) => session.languageID === languageID)
    .sort((a, b) => a.startedAt - b.startedAt);

  for (const session of relevant) {
    const seenPassages = new Set<string>();
    const ordered = [...session.assessments].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
    for (const raw of ordered) {
      if (seenPassages.has(raw.passageID)) continue;
      seenPassages.add(raw.passageID);
      const assessment = validate(raw, session);
      if (!assessment) continue;

      observationCount += 1;
      if (assessment.outcome === "breakdown") {
        challenge = Math.max(0, challenge - 1);
        streak = 0;
      } else if (assessment.outcome === "success") {
        streak += 1;
        // Two clean turns in a row before the challenge rises — one good
        // answer is noise, two is a trend.
        if (streak >= 2) {
          challenge = Math.min(
            5,
            Math.max(challenge, Math.min(challenge + 1, assessment.suggestedLevel)),
          );
          streak = 0;
        }
      } else {
        streak = 0;
      }

      if (assessment.nextGoal) nextGoal = assessment.nextGoal;
      if (assessment.outcome === "success" && assessment.capability) {
        const evidence =
          capabilityEvidence.get(assessment.capability) ?? new Set<string>();
        evidence.add(`${startOfDay(assessment.createdAt)}|${assessment.context}`);
        capabilityEvidence.set(assessment.capability, evidence);
      }

      const seenWords = new Set<string>();
      for (const word of assessment.words) {
        const key = wordKey(word);
        if (hidden.has(key) || seenWords.has(key)) continue;
        seenWords.add(key);
        const list = events.get(key) ?? [];
        list.push({ word, at: assessment.createdAt, context: assessment.context });
        events.set(key, list);
      }
    }
  }

  const words: WordState[] = [];
  for (const [key, observations] of events) {
    const last = observations[observations.length - 1];
    const independent = observations.filter(
      (observation) => observation.word.kind === "independent",
    );
    const days = new Set(independent.map((o) => startOfDay(o.at))).size;
    const contexts = new Set(independent.map((o) => o.context)).size;
    const lastRecall = independent[independent.length - 1]?.at;

    let bars = independent.length === 0 ? 0 : 1;
    if (days >= 2) bars = 2;
    // Three bars means spaced recall in different situations, across a week.
    if (
      days >= 3 &&
      contexts >= 2 &&
      independent[independent.length - 1].at - independent[0].at >= 7 * DAY_MS
    ) {
      bars = 3;
    }

    const dueAt = (lastRecall ?? last.at) + REVISIT_DAYS[bars] * DAY_MS;
    if (now > dueAt && bars > 1) bars -= 1;

    const lapse = [...observations]
      .reverse()
      .find((observation) => observation.word.kind === "lapse");
    if (lapse && lapse.at > (lastRecall ?? -Infinity)) bars = Math.min(bars, 1);

    words.push({
      id: key,
      lemma: last.word.lemma,
      meaning: last.word.meaning,
      form: last.word.form,
      example: last.word.quote,
      bars,
      understandingCount: observations.filter(
        (o) => o.word.kind === "understanding",
      ).length,
      independentCount: independent.length,
      lastSeen: last.at,
      dueAt,
    });
  }

  words.sort((a, b) => b.lastSeen - a.lastSeen);

  const capabilities = [...capabilityEvidence.entries()]
    .filter(([, evidence]) => evidence.size >= 3)
    .map(([capability]) => capability)
    .sort();

  return { challenge, observationCount, nextGoal, capabilities, words };
}

export function levelLabel(state: LearnerState): string {
  return state.observationCount < 4 ? "Getting to know you" : "Finding your pace";
}
