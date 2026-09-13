import { NextResponse } from "next/server";
import {
  UpstreamError,
  modelFor,
  resolveKey,
  streamText,
  type Message,
} from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  system?: string;
  messages?: Message[];
  quality?: string;
  maxTokens?: number;
}

function isMessage(value: unknown): value is Message {
  const message = value as Message;
  return (
    !!message &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

export async function POST(request: Request) {
  try {
    const key = resolveKey(request);
    const body = (await request.json()) as Body;
    const messages = (body.messages ?? []).filter(isMessage);
    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages." }, { status: 400 });
    }

    const stream = await streamText({
      key,
      model: modelFor(body.quality),
      system: String(body.system ?? ""),
      messages,
      maxTokens: Math.min(1024, Math.max(64, body.maxTokens ?? 400)),
      temperature: 1,
      signal: request.signal,
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-accel-buffering": "no",
      },
    });
  } catch (error) {
    const status = error instanceof UpstreamError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "The request was rejected.";
    return NextResponse.json({ error: message }, { status });
  }
}
