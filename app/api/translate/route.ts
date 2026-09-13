import { NextResponse } from "next/server";
import { UpstreamError, complete, modelFor, resolveKey } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  text?: string;
  quality?: string;
}

export async function POST(request: Request) {
  try {
    const key = resolveKey(request);
    const body = (await request.json()) as Body;
    const source = String(body.text ?? "").slice(0, 2000);
    if (!source.trim()) {
      return NextResponse.json({ text: "" });
    }

    const translation = await complete({
      key,
      model: modelFor(body.quality),
      system: String(body.system ?? ""),
      // Fenced as data so instructions inside a transcript are not followed.
      messages: [
        { role: "user", content: `<transcript>\n${source}\n</transcript>` },
      ],
      maxTokens: 500,
      temperature: 0,
      signal: request.signal,
    });

    return NextResponse.json({ text: translation.trim() });
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "The request was rejected.";
    return NextResponse.json({ error: message }, { status });
  }
}
