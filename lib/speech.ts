"use client";

/** Browser speech in, browser speech out.
 *
 *  Both directions use the device's own engines rather than a paid audio API,
 *  which is what keeps a conversation costing only its text tokens. The price
 *  is that support is uneven, so everything here degrades to typing. */

type RecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [alternative: number]: { transcript: string; confidence: number };
    };
  };
}

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function recognitionSupported(): boolean {
  return recognitionCtor() !== null;
}

export function synthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface ListenerHandlers {
  onInterim(text: string): void;
  onFinal(text: string): void;
  onError(kind: "denied" | "unsupported" | "other"): void;
  onListeningChange(listening: boolean): void;
}

/**
 * A restart-tolerant wrapper around the Web Speech recognizer.
 *
 * Mobile engines end a session on almost any pause, so "listening" is a state
 * we hold ourselves and re-assert whenever the engine drops out. `suspend` is
 * used while the app is speaking so the recognizer never transcribes our own
 * voice back into the conversation.
 */
export class Listener {
  private recognition: SpeechRecognitionLike | null = null;
  private wanted = false;
  private suspended = false;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private locale = "en-US";

  constructor(private handlers: ListenerHandlers) {}

  get isListening(): boolean {
    return this.wanted && !this.suspended;
  }

  setLocale(locale: string): void {
    this.locale = locale;
    if (this.recognition) this.recognition.lang = locale;
  }

  start(locale?: string): void {
    if (locale) this.locale = locale;
    const Ctor = recognitionCtor();
    if (!Ctor) {
      this.handlers.onError("unsupported");
      return;
    }
    this.wanted = true;
    this.suspended = false;
    this.spin(Ctor);
    this.handlers.onListeningChange(true);
  }

  stop(): void {
    this.wanted = false;
    this.clearTimer();
    this.teardown();
    this.handlers.onListeningChange(false);
  }

  /** Pause for the duration of our own speech, keeping the user's intent. */
  suspend(): void {
    if (!this.wanted || this.suspended) return;
    this.suspended = true;
    this.clearTimer();
    this.teardown();
    this.handlers.onListeningChange(false);
  }

  resume(): void {
    if (!this.wanted || !this.suspended) return;
    this.suspended = false;
    const Ctor = recognitionCtor();
    if (Ctor) this.spin(Ctor);
    this.handlers.onListeningChange(true);
  }

  private clearTimer() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  private teardown() {
    const recognition = this.recognition;
    this.recognition = null;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.onstart = null;
    try {
      recognition.abort();
    } catch {
      // Already stopped.
    }
  }

  private spin(Ctor: RecognitionCtor) {
    this.teardown();
    const recognition = new Ctor();
    recognition.lang = this.locale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          const trimmed = text.trim();
          if (trimmed) this.handlers.onFinal(trimmed);
        } else {
          interim += text;
        }
      }
      this.handlers.onInterim(interim.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.wanted = false;
        this.handlers.onError("denied");
        this.handlers.onListeningChange(false);
        return;
      }
      // "no-speech" and "aborted" are ordinary on mobile; onend will respin.
      if (event.error !== "no-speech" && event.error !== "aborted") {
        this.handlers.onError("other");
      }
    };

    recognition.onend = () => {
      if (!this.wanted || this.suspended) return;
      this.clearTimer();
      this.restartTimer = setTimeout(() => {
        const Again = recognitionCtor();
        if (this.wanted && !this.suspended && Again) this.spin(Again);
      }, 250);
    };

    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      // start() throws if a previous session is still closing; onend respins.
    }
  }
}

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

/** Voices arrive asynchronously in most browsers, and sometimes only after a
 *  first `getVoices()` call. Resolve once, then reuse. */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!synthesisSupported()) return Promise.resolve([]);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const timeout = setTimeout(
      () => resolve(window.speechSynthesis.getVoices()),
      1500,
    );
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
  return voicesReady;
}

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  locale: string,
  fallbacks: string[],
): SpeechSynthesisVoice | null {
  const candidates = [locale, ...fallbacks];
  for (const tag of candidates) {
    const exact = voices.find(
      (voice) => voice.lang.replace("_", "-").toLowerCase() === tag.toLowerCase(),
    );
    if (exact) return exact;
  }
  const base = locale.split("-")[0].toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith(base)) ?? null
  );
}

/** Safari mutes synthesis until it has spoken once inside a user gesture. */
export function unlockSpeech(): void {
  if (!synthesisSupported()) return;
  try {
    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Nothing to unlock.
  }
}

export function cancelSpeech(): void {
  if (!synthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Nothing playing.
  }
}

/** Long utterances are unreliable in Safari, so speak sentence by sentence.
 *  Resolves when the last chunk finishes or the speech is cancelled. */
export function speak(
  text: string,
  options: { locale: string; fallbacks: string[]; rate: number },
): Promise<void> {
  if (!synthesisSupported() || !text.trim()) return Promise.resolve();

  const chunks = text
    .split(/(?<=[.!?…¿¡;:]|\n)\s+/u)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  const queue = chunks.length > 0 ? chunks : [text.trim()];

  return loadVoices().then(
    (voices) =>
      new Promise<void>((resolve) => {
        const voice = pickVoice(voices, options.locale, options.fallbacks);
        let index = 0;
        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        const next = () => {
          if (index >= queue.length) {
            finish();
            return;
          }
          const utterance = new SpeechSynthesisUtterance(queue[index]);
          index += 1;
          utterance.lang = options.locale;
          if (voice) utterance.voice = voice;
          utterance.rate = Math.min(1.6, Math.max(0.5, options.rate));
          utterance.pitch = 1;
          utterance.onend = next;
          utterance.onerror = finish;
          try {
            window.speechSynthesis.speak(utterance);
          } catch {
            finish();
          }
        };

        next();
      }),
  );
}
