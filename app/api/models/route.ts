import { NextResponse } from "next/server";
import { providerFor } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Listing {
  id: string;
  name: string;
  context: number;
}

interface CatalogueEntry {
  id?: string;
  name?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
}

const isFree = (entry: CatalogueEntry): boolean => {
  if (entry.id?.endsWith(":free")) return true;
  const prompt = Number(entry.pricing?.prompt ?? "1");
  const completion = Number(entry.pricing?.completion ?? "1");
  return prompt === 0 && completion === 0;
};

/**
 * Which models a provider is giving away today.
 *
 * OpenRouter's free roster rotates, so a model name baked into the build goes
 * stale. Asking its public catalogue means the app offers what actually works
 * now, and keeps working when the list changes underneath it.
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("provider") ?? "";
  const provider = providerFor(id);
  if (!provider.catalogueURL) return NextResponse.json({ models: [] });

  try {
    const response = await fetch(provider.catalogueURL, {
      headers: { accept: "application/json" },
      // The roster changes rarely; an hour old is fine and spares the provider.
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json({ models: [] });

    const body = (await response.json()) as { data?: CatalogueEntry[] };
    const models: Listing[] = (body.data ?? [])
      .filter((entry) => entry.id && isFree(entry))
      .map((entry) => ({
        id: entry.id as string,
        name: (entry.name ?? entry.id) as string,
        context: entry.context_length ?? 0,
      }))
      .sort((a, b) => b.context - a.context)
      .slice(0, 40);

    return NextResponse.json({ models });
  } catch {
    // A catalogue we cannot reach is not an error the learner can act on.
    return NextResponse.json({ models: [] });
  }
}
