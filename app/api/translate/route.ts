import { NextResponse } from "next/server";
import { complete, failure, setup } from "@/lib/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  text?: string;
  provider?: string;
  model?: string;
  quality?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const source = String(body.text ?? "").slice(0, 2000);
    if (!source.trim()) return NextResponse.json({ text: "" });

    const translation = await complete({
      ...setup(request, body),
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
    const { message, status } = failure(error);
    return NextResponse.json({ error: message }, { status });
  }
}
