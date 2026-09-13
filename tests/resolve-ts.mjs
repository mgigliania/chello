/**
 * A resolver for `node --test --experimental-strip-types`.
 *
 * Node's type stripping runs TypeScript files directly but keeps Node's ESM
 * resolution, which needs file extensions and knows nothing about the `@/`
 * alias. This bridges both so the tests import exactly what Next builds.
 */
import { stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = pathToFileURL(`${process.cwd()}/`);
const SUFFIXES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

async function firstExisting(base) {
  for (const suffix of SUFFIXES) {
    const candidate = new URL(base.href + suffix);
    try {
      // Directories must not win: "@/lib/languages" has to reach index.ts.
      if ((await stat(fileURLToPath(candidate))).isFile()) return candidate.href;
    } catch {
      // Try the next suffix.
    }
  }
  return null;
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const found = await firstExisting(new URL(specifier.slice(2), root));
    if (found) return next(found, context);
  }

  if (specifier.startsWith(".") && context.parentURL) {
    const found = await firstExisting(new URL(specifier, context.parentURL));
    if (found) return next(found, context);
  }

  return next(specifier, context);
}
