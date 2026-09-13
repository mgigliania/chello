import { NextResponse } from "next/server";
import { complete, extractJSON, failure, setup } from "@/lib/model";
import type { Assessment, WordProposal } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  schema?: string;
  transcript?: string;
  /** The passages being assessed, with the revision the client saw. The
   *  revision is never taken from the model's reply — it is what lets the
   *  learning engine reject evidence for a turn that has since changed. */
  targets?: Array<{ passageID: string; revisionKey: string }>;
  context?: string;
  provider?: string;
  model?: string;
  quality?: string;
}

const KINDS = new Set([
  "exposure",
  "understanding",
  "assisted",
  "independent",
  "lapse",
]);
const OUTCOMES = new Set(["success", "partial", "breakdown", "uncertain"]);

const text = (value: unknown, limit: number): string =>
  typeof value === "string" ? value.slice(0, limit) : "";

/** Shape-check one entry of the model's JSON. Meaning is checked later against
 *  the transcript by the learning engine; this only guarantees the type. */
function coerce(
  raw: unknown,
  revisions: Map<string, string>,
  context: string,
): Assessment | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const outcome = String(value.outcome ?? "");
  if (!OUTCOMES.has(outcome)) return null;

  // Only passages the client actually asked about, at the revision it saw.
  const passageID = String(value.passageID ?? "");
  const revisionKey = revisions.get(passageID);
  if (revisionKey === undefined) return null;

  const level = Number(value.suggestedLevel);
  const words = Array.isArray(value.words) ? value.words : [];

  const proposals: WordProposal[] = words
    .slice(0, 12)
    .map((entry) => {
      const word = (entry ?? {}) as Record<string, unknown>;
      const sourceIDs = Array.isArray(word.sourceIDs)
        ? word.sourceIDs.filter((id): id is string => typeof id === "string")
        : [];
      return {
        lemma: text(word.lemma, 100),
        meaning: text(word.meaning, 180),
        form: text(word.form, 100),
        kind: (KINDS.has(String(word.kind)) ? word.kind : "exposure") as
          WordProposal["kind"],
        confidence: Number(word.confidence),
        sourceIDs,
        quote: text(word.quote, 500),
        language: text(word.language, 10),
      };
    })
    .filter((word) => word.lemma && word.meaning && word.form && word.quote);

  return {
    passageID,
    revisionKey,
    outcome: outcome as Assessment["outcome"],
    suggestedLevel: Number.isFinite(level)
      ? Math.min(5, Math.max(0, Math.round(level)))
      : 0,
    nextGoal: text(value.nextGoal, 300),
    capability: text(value.capability, 160),
    words: proposals,
    createdAt: Date.now(),
    context,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const targets = (body.targets ?? []).filter(
      (target) => target?.passageID && typeof target.revisionKey === "string",
    );
    if (targets.length === 0 || !body.transcript) {
      return NextResponse.json({ error: "Nothing to assess." }, { status: 400 });
    }

    const output = await complete({
      ...setup(request, body),
      system: `${body.system ?? ""}\n\n${body.schema ?? ""}`,
      messages: [{ role: "user", content: body.transcript }],
      maxTokens: Math.min(3000, 500 + targets.length * 450),
      temperature: 0,
      signal: request.signal,
    });

    const parsed = extractJSON(output) as { assessments?: unknown[] } | null;
    const entries = Array.isArray(parsed?.assessments) ? parsed.assessments : [];
    const revisions = new Map(
      targets.map((target) => [target.passageID, target.revisionKey]),
    );
    const context = String(body.context ?? "free");

    const assessments = entries
      .slice(0, 12)
      .map((entry) => coerce(entry, revisions, context))
      .filter((entry): entry is Assessment => entry !== null);

    if (assessments.length === 0) {
      return NextResponse.json({ error: "Unreadable assessment." }, { status: 422 });
    }
    return NextResponse.json({ assessments });
  } catch (error) {
    const { message, status } = failure(error);
    return NextResponse.json({ error: message }, { status });
  }
}
