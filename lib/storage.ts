"use client";

import { DEFAULT_LANGUAGE_ID } from "@/lib/languages";
import { DEFAULT_PROVIDER } from "@/lib/providers";
import type { Archive, Preferences, SessionRecord } from "@/lib/types";

const ARCHIVE_KEY = "pancho.archive.v1";
const KEY_PREFIX = "pancho.key.";
/** Superseded by the per-provider keys; read once, then retired. */
const LEGACY_KEY = "pancho.apiKey.v1";
export const SCHEMA_VERSION = 1;

export const defaultPreferences: Preferences = {
  learningLanguageID: DEFAULT_LANGUAGE_ID,
  meaningVisible: true,
  meaningLanguage: "English",
  interfaceLanguage: "en",
  hiddenWords: [],
  interests: "",
  hasOnboarded: false,
  speechRate: 0.95,
  provider: DEFAULT_PROVIDER,
  models: {},
  quality: "balanced",
  theme: "system",
};

export const emptyArchive = (): Archive => ({
  schemaVersion: SCHEMA_VERSION,
  sessions: [],
  preferences: { ...defaultPreferences },
});

/** Reads never throw: a corrupt or unavailable store yields a clean archive
 *  rather than a blank screen. Private browsing and disabled storage are
 *  ordinary conditions here, not errors. */
export function loadArchive(): Archive {
  if (typeof window === "undefined") return emptyArchive();
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return emptyArchive();
    const parsed = JSON.parse(raw) as Partial<Archive>;
    const preferences = { ...defaultPreferences, ...(parsed.preferences ?? {}) };
    return {
      schemaVersion: SCHEMA_VERSION,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      preferences: { ...preferences, models: preferences.models ?? {} },
    };
  } catch {
    return emptyArchive();
  }
}

export function saveArchive(archive: Archive): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  } catch {
    // Quota exceeded or storage blocked. The session continues in memory.
  }
}

export function exportArchive(archive: Archive): string {
  return JSON.stringify(archive, null, 2);
}

export function importArchive(text: string): Archive {
  const parsed = JSON.parse(text) as Partial<Archive>;
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sessions)) {
    throw new Error("That file is not a Pancho backup.");
  }
  const sessions = parsed.sessions.filter(
    (session): session is SessionRecord =>
      !!session &&
      typeof session.id === "string" &&
      typeof session.languageID === "string" &&
      Array.isArray(session.fragments),
  );
  const preferences = { ...defaultPreferences, ...(parsed.preferences ?? {}) };
  return {
    schemaVersion: SCHEMA_VERSION,
    sessions,
    preferences: { ...preferences, models: preferences.models ?? {} },
  };
}

/** Keys live only in this browser and go only to the provider they belong to,
 *  through this app's own API route. They are deliberately kept out of the
 *  archive so a learning backup can be shared without leaking one. */
export function loadKeys(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const keys: Record<string, string> = {};
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const name = window.localStorage.key(index);
      if (name?.startsWith(KEY_PREFIX)) {
        keys[name.slice(KEY_PREFIX.length)] =
          window.localStorage.getItem(name) ?? "";
      }
    }
    // Anyone who set up before providers existed had an Anthropic key.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy && !keys.anthropic) keys.anthropic = legacy;
  } catch {
    return {};
  }
  return keys;
}

export function saveKey(provider: string, key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key) window.localStorage.setItem(KEY_PREFIX + provider, key);
    else window.localStorage.removeItem(KEY_PREFIX + provider);
  } catch {
    // Nothing to do; the caller will be prompted again next time.
  }
}
