import { NextResponse } from "next/server";
import { UpstreamError, complete, modelFor, resolveKey } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  phrase?: string;
  sentence?: string;
  quality?: string;
}

export async function POST(request: Request) {
  try {
    const key = resolveKey(request);
    const body = (await request.json()) as Body;
    const phrase = String(body.phrase ?? "").slice(0, 200);
    if (!phrase.trim()) {
      return NextResponse.json({ error: "Nothing selected." }, { status: 400 });
    }

    const explanation = await complete({
      key,
      model: modelFor(body.quality),
      system: String(body.system ?? ""),
      messages: [
        {
          role: "user",
          content: `<selection>${phrase}</selection>\n<sentence>${String(
            body.sentence ?? "",
          ).slice(0, 600)}</sentence>`,
        },
      ],
      maxTokens: 300,
      temperature: 0,
      signal: request.signal,
    });

    return NextResponse.json({ text: explanation.trim() });
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "The request was rejected.";
    return NextResponse.json({ error: message }, { status });
  }
}
