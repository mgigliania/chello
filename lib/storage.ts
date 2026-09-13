"use client";

import { DEFAULT_LANGUAGE_ID } from "@/lib/languages";
import type { Archive, Preferences, SessionRecord } from "@/lib/types";

const ARCHIVE_KEY = "pancho.archive.v1";
const KEY_STORAGE = "pancho.apiKey.v1";
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
    return {
      schemaVersion: SCHEMA_VERSION,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      preferences: { ...defaultPreferences, ...(parsed.preferences ?? {}) },
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
  return {
    schemaVersion: SCHEMA_VERSION,
    sessions,
    preferences: { ...defaultPreferences, ...(parsed.preferences ?? {}) },
  };
}

/** The key lives only in this browser and is sent only to Anthropic, through
 *  this app's own API route. It is deliberately kept out of the archive so a
 *  learning backup can be shared without leaking it. */
export function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key) window.localStorage.setItem(KEY_STORAGE, key);
    else window.localStorage.removeItem(KEY_STORAGE);
  } catch {
    // Nothing to do; the caller will be prompted again next time.
  }
}
