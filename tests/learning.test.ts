import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { project, validate } from "@/lib/learning";
import type {
  Assessment,
  Fragment,
  SessionRecord,
  WordProposal,
} from "@/lib/types";

const DAY = 86_400_000;
const BASE = Date.UTC(2026, 0, 5, 12, 0, 0);

function fragment(partial: Partial<Fragment> & { id: string }): Fragment {
  return {
    revision: 0,
    speaker: "user",
    text: "",
    startMS: BASE,
    endMS: BASE + 1000,
    receivedAt: BASE,
    meaningVisible: false,
    typed: false,
    ...partial,
  };
}

function word(partial: Partial<WordProposal> = {}): WordProposal {
  return {
    lemma: "quedar",
    meaning: "to meet up",
    form: "quedamos",
    kind: "independent",
    confidence: 0.95,
    sourceIDs: ["u1"],
    quote: "quedamos el jueves",
    language: "es",
    ...partial,
  };
}

function assessment(partial: Partial<Assessment> = {}): Assessment {
  return {
    passageID: "u1",
    revisionKey: "u1:0",
    outcome: "success",
    suggestedLevel: 2,
    nextGoal: "Practise past tense.",
    capability: "Can arrange to meet someone",
    words: [word()],
    createdAt: BASE,
    context: "coffee",
    ...partial,
  };
}

function session(partial: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: "s1",
    languageID: "es",
    startedAt: BASE,
    title: "Un café",
    themeID: "coffee",
    fragments: [fragment({ id: "u1", text: "quedamos el jueves" })],
    assessments: [assessment()],
    translations: {},
    ...partial,
  };
}

describe("validate", () => {
  it("keeps evidence that quotes the passage exactly", () => {
    const result = validate(assessment(), session());
    assert.equal(result?.words.length, 1);
    assert.equal(result?.words[0].kind, "independent");
  });

  it("drops a word whose quote is not in the passage", () => {
    const result = validate(
      assessment({ words: [word({ quote: "nunca dije esto", form: "dije" })] }),
      session(),
    );
    assert.equal(result?.words.length, 0);
  });

  it("drops a word whose form is absent from its own quote", () => {
    const result = validate(
      assessment({ words: [word({ form: "jamás" })] }),
      session(),
    );
    assert.equal(result?.words.length, 0);
  });

  it("drops evidence attributed to another language", () => {
    const result = validate(
      assessment({ words: [word({ language: "fr" })] }),
      session(),
    );
    assert.equal(result?.words.length, 0);
  });

  it("drops low-confidence evidence", () => {
    const result = validate(
      assessment({ words: [word({ confidence: 0.5 })] }),
      session(),
    );
    assert.equal(result?.words.length, 0);
  });

  it("rejects an assessment whose passage has since been revised", () => {
    assert.equal(validate(assessment({ revisionKey: "u1:9" }), session()), null);
  });

  it("rejects a level outside the 0–5 scale", () => {
    assert.equal(validate(assessment({ suggestedLevel: 9 }), session()), null);
  });

  it("demotes production made with meaning subtitles visible", () => {
    const scaffolded = session({
      fragments: [
        fragment({ id: "u1", text: "quedamos el jueves", meaningVisible: true }),
      ],
    });
    const result = validate(assessment(), scaffolded);
    assert.equal(result?.words[0].kind, "assisted");
  });

  it("demotes production that was typed rather than spoken", () => {
    const typed = session({
      fragments: [fragment({ id: "u1", text: "quedamos el jueves", typed: true })],
    });
    assert.equal(validate(assessment(), typed)?.words[0].kind, "assisted");
  });

  it("demotes a phrase the assistant had just modelled", () => {
    const echoed = session({
      fragments: [
        fragment({
          id: "a1",
          speaker: "assistant",
          text: "¿Quedamos el jueves?",
          startMS: BASE - 20_000,
          endMS: BASE - 15_000,
        }),
        fragment({ id: "u1", text: "quedamos el jueves" }),
      ],
    });
    assert.equal(validate(assessment(), echoed)?.words[0].kind, "assisted");
  });

  it("keeps production the assistant modelled long ago", () => {
    const old = session({
      fragments: [
        fragment({
          id: "a1",
          speaker: "assistant",
          text: "¿Quedamos el jueves?",
          startMS: BASE - 600_000,
          endMS: BASE - 595_000,
        }),
        fragment({ id: "u1", text: "quedamos el jueves" }),
      ],
    });
    assert.equal(validate(assessment(), old)?.words[0].kind, "independent");
  });
});

describe("project", () => {
  const key = "es|quedar|to meet up";

  /** One session per day, each a single independent use of the same word. */
  function days(count: number, context = "coffee", spacing = DAY) {
    return Array.from({ length: count }, (_, index) => {
      const at = BASE + index * spacing;
      return session({
        id: `s${index}`,
        startedAt: at,
        themeID: context,
        fragments: [
          fragment({
            id: "u1",
            text: "quedamos el jueves",
            startMS: at,
            endMS: at + 1000,
          }),
        ],
        assessments: [assessment({ createdAt: at, context })],
      });
    });
  }

  it("gives one bar for a single unaided use", () => {
    const state = project([session()], "es", [], BASE + 1000);
    assert.equal(state.words[0].bars, 1);
    assert.equal(state.words[0].independentCount, 1);
  });

  it("gives no bars when the only evidence was supported", () => {
    const supported = session({
      fragments: [
        fragment({ id: "u1", text: "quedamos el jueves", meaningVisible: true }),
      ],
    });
    const state = project([supported], "es", [], BASE + 1000);
    assert.equal(state.words[0].bars, 0);
  });

  it("gives two bars for recall on two different days", () => {
    const state = project(days(2), "es", [], BASE + DAY + 1000);
    assert.equal(state.words[0].bars, 2);
  });

  it("withholds the third bar without a spread of contexts", () => {
    const state = project(days(8), "es", [], BASE + 7 * DAY + 1000);
    assert.equal(state.words[0].bars, 2);
  });

  it("withholds the third bar when the days are not spread over a week", () => {
    const sessions = [
      ...days(2, "coffee"),
      ...days(1, "market").map((s) => ({
        ...s,
        id: "s-market",
        startedAt: BASE + 2 * DAY,
        assessments: [assessment({ createdAt: BASE + 2 * DAY, context: "market" })],
        fragments: [
          fragment({
            id: "u1",
            text: "quedamos el jueves",
            startMS: BASE + 2 * DAY,
            endMS: BASE + 2 * DAY + 1000,
          }),
        ],
      })),
    ];
    const state = project(sessions, "es", [], BASE + 2 * DAY + 1000);
    assert.equal(state.words[0].bars, 2);
  });

  it("gives three bars for spaced recall across contexts and a week", () => {
    const spread = [
      ...days(1, "coffee"),
      ...days(1, "market").map((s) => ({
        ...s,
        id: "s-market",
        startedAt: BASE + 4 * DAY,
        assessments: [assessment({ createdAt: BASE + 4 * DAY, context: "market" })],
        fragments: [
          fragment({
            id: "u1",
            text: "quedamos el jueves",
            startMS: BASE + 4 * DAY,
            endMS: BASE + 4 * DAY + 1000,
          }),
        ],
      })),
      ...days(1, "walk").map((s) => ({
        ...s,
        id: "s-walk",
        startedAt: BASE + 8 * DAY,
        assessments: [assessment({ createdAt: BASE + 8 * DAY, context: "walk" })],
        fragments: [
          fragment({
            id: "u1",
            text: "quedamos el jueves",
            startMS: BASE + 8 * DAY,
            endMS: BASE + 8 * DAY + 1000,
          }),
        ],
      })),
    ];
    const state = project(spread, "es", [], BASE + 8 * DAY + 1000);
    assert.equal(state.words[0].bars, 3);
  });

  it("lets a bar decay once the word is overdue", () => {
    const fresh = project(days(2), "es", [], BASE + DAY + 1000);
    assert.equal(fresh.words[0].bars, 2);
    const stale = project(days(2), "es", [], BASE + 30 * DAY);
    assert.equal(stale.words[0].bars, 1);
  });

  it("caps a word at one bar after a lapse", () => {
    const lapsed = [
      ...days(2),
      session({
        id: "s-lapse",
        startedAt: BASE + 2 * DAY,
        fragments: [
          fragment({
            id: "u1",
            text: "quedamos el jueves",
            startMS: BASE + 2 * DAY,
            endMS: BASE + 2 * DAY + 1000,
          }),
        ],
        assessments: [
          assessment({
            createdAt: BASE + 2 * DAY,
            words: [word({ kind: "lapse" })],
          }),
        ],
      }),
    ];
    const state = project(lapsed, "es", [], BASE + 2 * DAY + 1000);
    assert.equal(state.words[0].bars, 1);
  });

  it("hides words the learner asked to forget", () => {
    const state = project([session()], "es", [key], BASE + 1000);
    assert.equal(state.words.length, 0);
  });

  it("ignores sessions in another language", () => {
    const state = project([session()], "fr", [], BASE + 1000);
    assert.equal(state.words.length, 0);
    assert.equal(state.observationCount, 0);
  });

  it("raises the challenge only after two clean turns in a row", () => {
    const one = project(days(1), "es", [], BASE + 1000);
    assert.equal(one.challenge, 0);
    const two = project(days(2), "es", [], BASE + DAY + 1000);
    assert.equal(two.challenge, 1);
  });

  it("lowers the challenge after a breakdown", () => {
    const sessions = [
      ...days(2),
      session({
        id: "s-bad",
        startedAt: BASE + 2 * DAY,
        fragments: [
          fragment({
            id: "u1",
            text: "quedamos el jueves",
            startMS: BASE + 2 * DAY,
            endMS: BASE + 2 * DAY + 1000,
          }),
        ],
        assessments: [
          assessment({ createdAt: BASE + 2 * DAY, outcome: "breakdown", words: [] }),
        ],
      }),
    ];
    assert.equal(project(sessions, "es", [], BASE + 2 * DAY + 1000).challenge, 0);
  });

  it("reports a capability only after three separate pieces of evidence", () => {
    const two = project(days(2), "es", [], BASE + DAY + 1000);
    assert.deepEqual(two.capabilities, []);
    const three = project(days(3), "es", [], BASE + 2 * DAY + 1000);
    assert.deepEqual(three.capabilities, ["Can arrange to meet someone"]);
  });
});
