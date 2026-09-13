"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  updateArchive,
  writeApiKey,
  writeArchive,
} from "@/lib/archiveStore";
import { project } from "@/lib/learning";
import { emptyArchive } from "@/lib/storage";
import type { Archive, Preferences, SessionRecord } from "@/lib/types";

/** Everything that outlives a single conversation: the archive, the learner's
 *  preferences and the API key. Persisted to this browser only. */
export function useChello() {
  const { archive, apiKey, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setPreferences = useCallback((patch: Partial<Preferences>) => {
    updateArchive((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch },
    }));
  }, []);

  /** Upsert by id so an in-flight conversation can be saved repeatedly. */
  const commitSession = useCallback((session: SessionRecord) => {
    updateArchive((current) => {
      const index = current.sessions.findIndex((item) => item.id === session.id);
      const sessions =
        index === -1
          ? [...current.sessions, session]
          : current.sessions.map((item, at) => (at === index ? session : item));
      return { ...current, sessions };
    });
  }, []);

  const forgetWord = useCallback((key: string) => {
    updateArchive((current) =>
      current.preferences.hiddenWords.includes(key)
        ? current
        : {
            ...current,
            preferences: {
              ...current.preferences,
              hiddenWords: [...current.preferences.hiddenWords, key],
            },
          },
    );
  }, []);

  const deleteEverything = useCallback(() => {
    updateArchive((current) => ({
      ...emptyArchive(),
      preferences: { ...current.preferences, hiddenWords: [] },
    }));
  }, []);

  const replaceArchive = useCallback(
    (next: Archive) => writeArchive(next),
    [],
  );

  const setApiKey = useCallback((key: string) => writeApiKey(key), []);

  const learner = useMemo(
    () =>
      project(
        archive.sessions,
        archive.preferences.learningLanguageID,
        archive.preferences.hiddenWords,
      ),
    [
      archive.sessions,
      archive.preferences.learningLanguageID,
      archive.preferences.hiddenWords,
    ],
  );

  return {
    archive,
    hydrated,
    apiKey,
    learner,
    preferences: archive.preferences,
    setPreferences,
    setApiKey,
    commitSession,
    forgetWord,
    deleteEverything,
    replaceArchive,
  };
}

export type ChelloStore = ReturnType<typeof useChello>;
