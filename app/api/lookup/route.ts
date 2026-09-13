import { NextResponse } from "next/server";
import { complete, failure, setup } from "@/lib/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  phrase?: string;
  sentence?: string;
  provider?: string;
  model?: string;
  quality?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const phrase = String(body.phrase ?? "").slice(0, 200);
    if (!phrase.trim()) {
      return NextResponse.json({ error: "Nothing selected." }, { status: 400 });
    }

    const explanation = await complete({
      ...setup(request, body),
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
    const { message, status } = failure(error);
    return NextResponse.json({ error: message }, { status });
  }
}
