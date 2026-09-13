"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Orb, type OrbMood } from "@/components/Orb";
import {
  EndIcon,
  KeyboardIcon,
  MeaningIcon,
  MicIcon,
  MicOffIcon,
  SendIcon,
  SparkIcon,
  TranscriptIcon,
} from "@/components/Icons";
import type { Strings } from "@/lib/i18n";
import type { LanguageModule } from "@/lib/languages";
import type { Status } from "@/lib/conversation";
import type { Passage } from "@/lib/types";
import { passageText } from "@/lib/types";

/**
 * A gentle random walk, not a microphone analyser.
 *
 * Opening a second audio capture alongside the speech recognizer breaks
 * recognition on iOS, and the orb only needs to look alive — so its motion is
 * synthesised from the conversation state instead.
 */
function useEnergy(mood: OrbMood): RefObject<number> {
  const value = useRef(0);

  useEffect(() => {
    if (mood === "idle") {
      value.current = 0;
      return;
    }
    const ceiling = mood === "speaking" ? 0.95 : mood === "listening" ? 0.6 : 0.3;
    const interval = setInterval(() => {
      const target = Math.random() * ceiling;
      value.current += (target - value.current) * 0.35;
    }, 110);
    return () => clearInterval(interval);
  }, [mood]);

  // A ref, not state: the orb samples it each frame, so nothing here needs to
  // re-render nine times a second.
  return value;
}

interface Props {
  t: Strings;
  language: LanguageModule;
  title: string;
  status: Status;
  micOn: boolean;
  active: boolean;
  interim: string;
  reply: string;
  meaning: string;
  lastUserLine: string;
  meaningVisible: boolean;
  transcript: Passage[];
  onToggleMic(): void;
  onToggleMeaning(): void;
  onEnd(): void;
  onSendTyped(text: string): void;
  onAskForHelp(): void;
  lookup: { phrase: string; text: string } | null;
  onLookUp(phrase: string, sentence: string): void;
  onClearLookup(): void;
}

/** Split a spoken line into tappable words, keeping the punctuation and
 *  spacing between them so the sentence still reads normally. */
function TappableLine({
  text,
  lang,
  onPick,
}: {
  text: string;
  lang: string;
  onPick(word: string): void;
}) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, index) => {
        if (!part.trim()) return <span key={index}>{part}</span>;
        const bare = part.replace(/^[¿¡"'“”‘’(\[]+|[.,!?;:"'“”‘’)\]…]+$/gu, "");
        if (!bare) return <span key={index}>{part}</span>;
        return (
          <button
            key={index}
            type="button"
            lang={lang}
            onClick={() => onPick(bare)}
            className="underline-offset-4 transition-colors hover:decoration-iris active:text-iris"
            style={{ textDecoration: "underline", textDecorationColor: "transparent" }}
          >
            {part}
          </button>
        );
      })}
    </>
  );
}

export function TalkScreen({
  t,
  language,
  title,
  status,
  micOn,
  active,
  interim,
  reply,
  meaning,
  lastUserLine,
  meaningVisible,
  transcript,
  onToggleMic,
  onToggleMeaning,
  onEnd,
  onSendTyped,
  onAskForHelp,
  lookup,
  onLookUp,
  onClearLookup,
}: Props) {
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const energy = useEnergy(status);

  const statusLabel =
    status === "speaking"
      ? t.isSpeaking
      : status === "thinking"
        ? t.thinking
        : status === "listening"
          ? t.listening
          : t.readyWhenYouAre;

  const headline = reply || (active ? "" : language.greeting);
  const subhead = meaningVisible ? meaning : "";

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setTyping(false);
    onSendTyped(text);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-28">
      <div className="mt-3 flex shrink-0 justify-center">
        <span className="rounded-full bg-iris-soft px-5 py-2 text-[15px] font-medium text-ink/80">
          {title}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 py-2">
        {/* The orb is the one part that gives way: it shrinks so a long reply
            or a warning banner never pushes the controls off the screen. */}
        <div className="flex min-h-16 w-full flex-1 items-center justify-center">
          <Orb
            mood={status}
            energy={energy}
            className="aspect-square h-full max-h-52 w-auto"
          />
        </div>

        <p className="mt-3 shrink-0 text-[15px] text-muted" aria-live="polite">
          {statusLabel}
        </p>

        <p
          className="mt-3 text-balance px-2 text-center text-[26px] font-semibold leading-[1.2] tracking-[-0.02em]"
          lang={language.locale}
        >
          {headline && (
            <TappableLine
              text={headline}
              lang={language.locale}
              onPick={(word) => onLookUp(word, headline)}
            />
          )}
        </p>

        {subhead && (
          <p className="mt-2 text-balance px-2 text-center text-[17px] leading-snug text-muted">
            {subhead}
          </p>
        )}

        {(interim || lastUserLine) && (
          <p className="mt-4 px-2 text-center text-[15px] text-faint">
            <span className="mr-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
              {t.you}
            </span>
            {interim || lastUserLine}
          </p>
        )}
      </div>

      <div className="mt-auto flex shrink-0 flex-col items-center gap-2.5">
        <div className="flex w-full items-center justify-center gap-8">
          <button
            type="button"
            onClick={onToggleMeaning}
            aria-pressed={meaningVisible}
            className="press flex w-20 flex-col items-center gap-1.5"
          >
            <span
              className={`grid size-14 place-items-center rounded-full ${
                meaningVisible
                  ? "bg-butter text-ink"
                  : "bg-raised text-faint shadow-[0_2px_10px_rgba(36,31,41,0.06)]"
              }`}
            >
              <MeaningIcon size={24} />
            </span>
            <span
              className={`text-[13px] ${meaningVisible ? "font-medium text-ink" : "text-faint"}`}
            >
              {t.meaning}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMic}
            aria-label={micOn ? t.micOn : t.micOff}
            className="press grid size-[84px] place-items-center rounded-full text-white shadow-[0_10px_30px_rgba(110,79,224,0.35)]"
            style={{
              background: micOn
                ? "linear-gradient(140deg, #8C6BFF 0%, #6E4FE0 55%, #5233C4 100%)"
                : "linear-gradient(140deg, #C9BBF6 0%, #A48CEE 100%)",
            }}
          >
            {micOn ? <MicIcon size={34} /> : <MicOffIcon size={32} />}
          </button>

          {active ? (
            <button
              type="button"
              onClick={onEnd}
              className="press flex w-20 flex-col items-center gap-1.5"
            >
              <span className="grid size-14 place-items-center rounded-full bg-raised text-ink shadow-[0_2px_10px_rgba(36,31,41,0.06)]">
                <EndIcon size={24} />
              </span>
              <span className="text-[13px] text-ink">{t.end}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowTranscript(true)}
              disabled={transcript.length === 0}
              className="press flex w-20 flex-col items-center gap-1.5 disabled:opacity-45"
            >
              <span className="grid size-14 place-items-center rounded-full bg-raised text-faint shadow-[0_2px_10px_rgba(36,31,41,0.06)]">
                <TranscriptIcon size={24} />
              </span>
              <span className="text-[13px] text-faint">{t.transcript}</span>
            </button>
          )}
        </div>

        <p className="text-[14px] text-muted">{micOn ? t.micOn : t.micOff}</p>

        {active ? (
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTyping(true)}
              className="press flex items-center gap-1.5 text-[15px] text-muted"
            >
              <KeyboardIcon size={19} />
              {t.typeInstead}
            </button>
            <button
              type="button"
              onClick={onAskForHelp}
              className="press flex items-center gap-1.5 text-[15px] text-muted"
            >
              <SparkIcon size={17} />
              {t.aLittleHelp}
            </button>
          </div>
        ) : (
          <p className="text-[15px] text-faint">{t.anyLanguageWelcome}</p>
        )}
      </div>

      {typing && (
        <Sheet onClose={() => setTyping(false)} label={t.typeInstead}>
          <div className="flex items-end gap-2">
            <textarea
              autoFocus
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder={t.sendPlaceholder}
              lang={language.locale}
              className="min-h-14 flex-1 resize-none rounded-3xl bg-ground px-4 py-3 text-[16px] outline-none placeholder:text-faint"
            />
            <button
              type="button"
              onClick={submit}
              aria-label={t.send}
              disabled={!draft.trim()}
              className="press grid size-12 shrink-0 place-items-center rounded-full bg-iris text-white disabled:opacity-40"
            >
              <SendIcon size={20} />
            </button>
          </div>
        </Sheet>
      )}

      {lookup && (
        <Sheet onClose={onClearLookup} label={lookup.phrase}>
          <p
            className="text-[24px] font-semibold tracking-[-0.01em]"
            lang={language.locale}
          >
            {lookup.phrase}
          </p>
          <p className="mt-2 min-h-12 text-[16px] leading-relaxed text-muted">
            {lookup.text || `${t.thinking}…`}
          </p>
        </Sheet>
      )}

      {showTranscript && (
        <Sheet onClose={() => setShowTranscript(false)} label={t.transcript}>
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            {transcript.map((passage) => (
              <div key={passage.id}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
                  {passage.speaker === "user" ? t.you : "Chello"}
                </p>
                <p
                  className="mt-1 text-[16px] leading-snug"
                  lang={passage.speaker === "user" ? undefined : language.locale}
                >
                  {passageText(passage)}
                </p>
              </div>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

function Sheet({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose(): void;
  label: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-label={label}
        className="rise relative w-full max-w-md rounded-t-[28px] bg-raised p-5 shadow-[0_-8px_40px_rgba(36,31,41,0.18)]"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline" />
        {children}
      </div>
    </div>
  );
}
