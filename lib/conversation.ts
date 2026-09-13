"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { moduleOrDefault } from "@/lib/languages";
import { Listener, cancelSpeech, speak, unlockSpeech } from "@/lib/speech";
import {
  ASSESSMENT_SCHEMA,
  assessmentPrompt,
  greetingPrompt,
  helpPrompt,
  lookupPrompt,
  themePrompt,
  transcriptContext,
  translationPrompt,
  voicePrompt,
} from "@/lib/teaching";
import { themeFor } from "@/lib/themes";
import type {
  Assessment,
  Fragment,
  LearnerState,
  Preferences,
  SessionRecord,
} from "@/lib/types";
import { passageText, toPassages } from "@/lib/types";

export type Status = "idle" | "listening" | "thinking" | "speaking";

export type ErrorKind =
  | "none"
  | "key"
  | "mic-denied"
  | "mic-unsupported"
  | "network";

interface Options {
  preferences: Preferences;
  learner: LearnerState;
  apiKey: string;
  onCommit(session: SessionRecord): void;
}

/** How much of the conversation to resend.
 *
 *  The model only needs recent context to stay coherent, and the transcript is
 *  kept in full locally either way — so capping this stops every turn getting
 *  more expensive than the last, which matters most on a free tier's
 *  tokens-per-minute allowance. */
const CONTEXT_TURNS = 10;

const newID = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

/** Anthropic expects strictly alternating turns beginning with the user, so
 *  consecutive fragments from one speaker are merged before sending. */
function buildMessages(
  session: SessionRecord,
  directive?: string,
): ApiMessage[] {
  const messages: ApiMessage[] = [];
  for (const passage of toPassages(session.fragments).slice(-CONTEXT_TURNS)) {
    const role = passage.speaker === "user" ? "user" : "assistant";
    const content = passageText(passage).trim();
    if (!content) continue;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += ` ${content}`;
    else messages.push({ role, content });
  }

  if (directive) {
    const last = messages[messages.length - 1];
    if (last && last.role === "user") last.content += `\n\n${directive}`;
    else messages.push({ role: "user", content: directive });
  }

  if (messages.length === 0 || messages[0].role !== "user") {
    messages.unshift({ role: "user", content: directive ?? "Begin." });
  }
  return messages;
}

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "The request was rejected.";
  } catch {
    return "The request was rejected.";
  }
}

export function useConversation({
  preferences,
  learner,
  apiKey,
  onCommit,
}: Options) {
  const language = useMemo(
    () => moduleOrDefault(preferences.learningLanguageID),
    [preferences.learningLanguageID],
  );

  const [session, setSession] = useState<SessionRecord | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [interim, setInterim] = useState("");
  const [reply, setReply] = useState("");
  const [meaning, setMeaning] = useState("");
  const [lastUserLine, setLastUserLine] = useState("");
  const [error, setError] = useState<ErrorKind>("none");
  const [errorDetail, setErrorDetail] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [lookup, setLookup] = useState<{ phrase: string; text: string } | null>(
    null,
  );

  const sessionRef = useRef<SessionRecord | null>(null);
  const listenerRef = useRef<Listener | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  /** Speech or typing that arrived while a reply was still generating.
   *  Held rather than dropped, and replayed once the orb stops talking. */
  const pendingRef = useRef<Array<{ text: string; typed: boolean }>>([]);

  /** `respond` is memoised, but it calls helpers declared below it. Reading
   *  them through a ref that is refreshed every render keeps it from calling
   *  a stale copy after the store's callbacks change identity. */
  const helpersRef = useRef<{
    translate(text: string): Promise<void>;
    assessLatest(): Promise<void>;
    commitUserTurn(text: string, typed: boolean): void;
  }>(null!);

  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;
  const learnerRef = useRef(learner);
  learnerRef.current = learner;
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  const settingsRef = useRef(preferences);
  settingsRef.current = preferences;

  const headers = useCallback(
    (): HeadersInit => ({
      "content-type": "application/json",
      ...(apiKeyRef.current ? { "x-pancho-key": apiKeyRef.current } : {}),
    }),
    [],
  );

  /** Which service, which model — sent with every request so a change in
   *  Settings takes effect on the next turn without restarting anything. */
  const routing = useCallback(
    () => ({
      provider: settingsRef.current.provider,
      model: settingsRef.current.models[settingsRef.current.provider] ?? "",
      quality: settingsRef.current.quality,
    }),
    [],
  );

  /**
   * Apply a change to the live session.
   *
   * The ref is the source of truth and is updated synchronously: a turn is
   * appended and the next request is built from it in the same tick, so this
   * cannot wait for React to flush. Committing from inside a `setState`
   * updater would also mean writing to the archive during render.
   */
  const update = useCallback(
    (mutate: (current: SessionRecord) => SessionRecord) => {
      const current = sessionRef.current;
      if (!current) return;
      const next = mutate(current);
      sessionRef.current = next;
      setSession(next);
      onCommit(next);
    },
    [onCommit],
  );

  const appendFragment = useCallback(
    (fragment: Fragment) => {
      update((current) => ({
        ...current,
        fragments: [...current.fragments, fragment],
      }));
    },
    [update],
  );

  /** Ask the model for a reply, speak it, then assess the learner's turn. */
  const respond = useCallback(
    async (directive?: string) => {
      const current = sessionRef.current;
      if (!current) return;
      if (!apiKeyRef.current) {
        setError("key");
        return;
      }

      busyRef.current = true;
      setStatus("thinking");
      setReply("");
      setMeaning("");
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const theme = themeFor(current.languageID, current.themeID);
      const system = voicePrompt({
        language,
        learner: learnerRef.current,
        theme,
        interests: preferencesRef.current.interests,
        meaningLanguage: preferencesRef.current.meaningLanguage,
      });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: headers(),
          signal: controller.signal,
          body: JSON.stringify({
            ...routing(),
            system,
            messages: buildMessages(current, directive),
          }),
        });

        if (!response.ok || !response.body) {
          const detail = await readError(response);
          setError(response.status === 401 ? "key" : "network");
          setErrorDetail(detail);
          setStatus("idle");
          busyRef.current = false;
          return;
        }

        const decoder = new TextDecoder();
        const reader = response.body.getReader();
        let text = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setReply(text);
        }
        text = text.trim();
        if (!text) {
          setStatus("idle");
          busyRef.current = false;
          return;
        }

        setError("none");
        setErrorDetail("");

        const start = Date.now();
        appendFragment({
          id: newID(),
          revision: 0,
          speaker: "assistant",
          text,
          startMS: start,
          endMS: start,
          receivedAt: start,
          meaningVisible: false,
          typed: false,
        });

        // Subtitles and assessment are side quests: neither may delay speech.
        void helpersRef.current.translate(text);
        void helpersRef.current.assessLatest();

        setStatus("speaking");
        listenerRef.current?.suspend();
        await speak(text, {
          locale: language.locale,
          fallbacks: language.voiceFallbacks,
          rate: preferencesRef.current.speechRate,
        });
        busyRef.current = false;
        listenerRef.current?.resume();
        setStatus(listenerRef.current?.isListening ? "listening" : "idle");

        const queued = pendingRef.current;
        if (queued.length > 0) {
          pendingRef.current = [];
          helpersRef.current.commitUserTurn(
            queued.map((item) => item.text).join(" "),
            queued.some((item) => item.typed),
          );
        }
      } catch (caught) {
        busyRef.current = false;
        if ((caught as Error)?.name === "AbortError") return;
        setError("network");
        setErrorDetail("");
        setStatus("idle");
      }
    },
    [appendFragment, headers, language, routing],
  );

  const translate = useCallback(
    async (text: string) => {
      if (!apiKeyRef.current) return;
      // A hidden subtitle is a request nobody reads.
      if (!settingsRef.current.meaningVisible) return;
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            ...routing(),
            text,
            system: translationPrompt(
              language,
              preferencesRef.current.meaningLanguage,
            ),
          }),
        });
        if (!response.ok) return;
        const body = (await response.json()) as { text?: string };
        if (body.text) {
          setMeaning(body.text);
          update((current) => ({
            ...current,
            translations: { ...current.translations, [text]: body.text as string },
          }));
        }
      } catch {
        // Subtitles are optional; silence is the right failure here.
      }
    },
    [headers, language, routing, update],
  );

  /** Score the most recent completed learner turn. */
  const assessLatest = useCallback(async () => {
    const current = sessionRef.current;
    if (!current || !apiKeyRef.current) return;

    const passages = toPassages(current.fragments);
    const target = [...passages].reverse().find((p) => p.speaker === "user");
    if (!target) return;
    if (current.assessments.some((a) => a.passageID === target.id)) return;

    const revisionKey = target.fragments
      .map((fragment) => `${fragment.id}:${fragment.revision}`)
      .join(",");

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          ...routing(),
          system: assessmentPrompt(language),
          schema: ASSESSMENT_SCHEMA,
          transcript: transcriptContext(current, target),
          passageID: target.id,
          revisionKey,
          context: current.themeID ?? "free",
        }),
      });
      if (!response.ok) return;
      const assessment = (await response.json()) as Assessment;
      update((existing) => ({
        ...existing,
        assessments: existing.assessments.some(
          (a) => a.passageID === assessment.passageID,
        )
          ? existing.assessments
          : [...existing.assessments, assessment],
      }));
    } catch {
      // A missed assessment costs one turn of evidence, nothing more.
    }
  }, [headers, language, routing, update]);

  const commitUserTurn = useCallback(
    (text: string, typed: boolean) => {
      const trimmed = text.trim();
      if (!trimmed || !sessionRef.current) return;

      // Mid-reply speech is held rather than dropped or interleaved.
      if (busyRef.current) {
        pendingRef.current.push({ text: trimmed, typed });
        return;
      }

      const now = Date.now();
      setLastUserLine(trimmed);
      setInterim("");
      appendFragment({
        id: newID(),
        revision: 0,
        speaker: "user",
        text: trimmed,
        startMS: now,
        endMS: now,
        receivedAt: now,
        meaningVisible: preferencesRef.current.meaningVisible,
        typed,
      });
      void respond();
    },
    [appendFragment, respond],
  );

  // Keep one Listener for the life of the hook; its handlers close over refs.
  useEffect(() => {
    const listener = new Listener({
      onInterim: setInterim,
      onFinal: (text) => commitUserTurn(text, false),
      onError: (kind) => {
        if (kind === "denied") setError("mic-denied");
        else if (kind === "unsupported") setError("mic-unsupported");
        setMicOn(false);
      },
      onListeningChange: (listening) => {
        setMicOn(listening);
        setStatus((current) => {
          if (current === "speaking" || current === "thinking") return current;
          return listening ? "listening" : "idle";
        });
      },
    });
    listenerRef.current = listener;
    return () => {
      listener.stop();
      cancelSpeech();
      listenerRef.current = null;
    };
  }, [commitUserTurn]);

  useEffect(() => {
    listenerRef.current?.setLocale(language.locale);
  }, [language.locale]);

  const start = useCallback(
    (themeID?: string) => {
      if (!apiKeyRef.current) {
        setError("key");
        return;
      }
      cancelSpeech();
      unlockSpeech();

      const theme = themeFor(preferencesRef.current.learningLanguageID, themeID);
      const fresh: SessionRecord = {
        id: newID(),
        languageID: preferencesRef.current.learningLanguageID,
        startedAt: Date.now(),
        themeID,
        title: theme?.title ?? `A little ${language.name}`,
        fragments: [],
        assessments: [],
        translations: {},
      };
      sessionRef.current = fresh;
      setSession(fresh);
      setReply("");
      setMeaning("");
      setLastUserLine("");
      setInterim("");
      setError("none");
      pendingRef.current = [];

      listenerRef.current?.start(language.locale);
      void respond(
        theme
          ? `${greetingPrompt(language)} ${themePrompt(theme, language)}`
          : greetingPrompt(language),
      );
    },
    [language, respond],
  );

  const end = useCallback(
    (reason = "ended") => {
      abortRef.current?.abort();
      listenerRef.current?.stop();
      cancelSpeech();
      busyRef.current = false;
      pendingRef.current = [];
      setStatus("idle");
      setInterim("");
      if (sessionRef.current) {
        update((current) => ({ ...current, endedAt: Date.now(), endReason: reason }));
      }
      setSession(null);
      sessionRef.current = null;
    },
    [update],
  );

  const toggleMic = useCallback(() => {
    const listener = listenerRef.current;
    if (!listener) return;
    if (listener.isListening) {
      listener.stop();
      return;
    }
    unlockSpeech();
    if (!sessionRef.current) {
      start();
      return;
    }
    listener.start(language.locale);
  }, [language.locale, start]);

  const sendTyped = useCallback(
    (text: string) => {
      if (!sessionRef.current) {
        start();
        // The greeting is already in flight; hold this until it lands.
        pendingRef.current.push({ text: text.trim(), typed: true });
        return;
      }
      commitUserTurn(text, true);
    },
    [commitUserTurn, start],
  );

  /** Explain one word from the tutor's last line, in the reading language. */
  const lookUp = useCallback(
    async (phrase: string, sentence: string) => {
      if (!apiKeyRef.current) {
        setError("key");
        return;
      }
      setLookup({ phrase, text: "" });
      try {
        const response = await fetch("/api/lookup", {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            ...routing(),
            phrase,
            sentence,
            system: lookupPrompt(
              language,
              preferencesRef.current.meaningLanguage,
            ),
          }),
        });
        const body = (await response.json()) as { text?: string; error?: string };
        setLookup({ phrase, text: body.text ?? body.error ?? "" });
      } catch {
        setLookup(null);
      }
    },
    [headers, language, routing],
  );

  const clearLookup = useCallback(() => setLookup(null), []);

  const askForHelp = useCallback(() => {
    if (!sessionRef.current || busyRef.current) return;
    cancelSpeech();
    void respond(helpPrompt(language));
  }, [language, respond]);

  const chooseTheme = useCallback(
    (themeID?: string) => {
      if (!sessionRef.current) {
        start(themeID);
        return;
      }
      const theme = themeFor(preferencesRef.current.learningLanguageID, themeID);
      update((current) => ({
        ...current,
        themeID,
        title: theme?.title ?? current.title,
      }));
      cancelSpeech();
      void respond(themePrompt(theme, language));
    },
    [language, respond, start, update],
  );

  helpersRef.current = { translate, assessLatest, commitUserTurn };

  const transcript = useMemo(
    () => (session ? toPassages(session.fragments) : []),
    [session],
  );

  return {
    session,
    transcript,
    status,
    micOn,
    interim,
    reply,
    meaning,
    lastUserLine,
    error,
    errorDetail,
    language,
    clearError: () => {
      setError("none");
      setErrorDetail("");
    },
    start,
    end,
    toggleMic,
    sendTyped,
    askForHelp,
    chooseTheme,
    lookup,
    lookUp,
    clearLookup,
  };
}
