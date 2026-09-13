"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";
import { Orb } from "@/components/Orb";
import type { Strings } from "@/lib/i18n";
import { LANGUAGES, MEANING_LANGUAGES, meaningGreeting } from "@/lib/languages";

interface Props {
  t: Strings;
  learningLanguageID: string;
  meaningLanguage: string;
  apiKey: string;
  onSetLearning(id: string): void;
  onSetMeaning(language: string): void;
  onSetApiKey(key: string): void;
  onDone(): void;
}

export function Onboarding({
  t,
  learningLanguageID,
  meaningLanguage,
  apiKey,
  onSetLearning,
  onSetMeaning,
  onSetApiKey,
  onDone,
}: Props) {
  const [step, setStep] = useState(0);
  const [greeting, setGreeting] = useState(LANGUAGES[0].greeting);

  // The greeting drifts through the languages on offer — the one moment the
  // app shows, rather than says, what it is for.
  useEffect(() => {
    if (step !== 0) return;
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LANGUAGES.length;
      setGreeting(LANGUAGES[index].greeting);
    }, 1600);
    return () => clearInterval(interval);
  }, [step]);

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6"
      style={{
        paddingTop: "max(20px, env(safe-area-inset-top))",
        paddingBottom: "max(24px, env(safe-area-inset-bottom))",
      }}
    >
      <Brand />

      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Orb mood="speaking" energy={0.4} className="h-52 w-52" />
          <p
            key={greeting}
            className="rise mt-8 text-[44px] font-semibold tracking-[-0.035em]"
          >
            {greeting}
          </p>
          <p className="mt-4 text-balance text-[17px] leading-relaxed text-muted">
            {t.welcomeBody}
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col justify-center py-8">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em]">
            {t.whichLanguage}
          </h1>
          <div className="mt-6 grid gap-2.5">
            {LANGUAGES.map((language) => {
              const selected = language.id === learningLanguageID;
              return (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => onSetLearning(language.id)}
                  aria-pressed={selected}
                  className={`press flex items-center gap-3 rounded-[22px] px-5 py-4 text-left ${
                    selected
                      ? "bg-iris text-white"
                      : "bg-raised shadow-[0_2px_10px_rgba(36,31,41,0.05)]"
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="flex-1">
                    <span className="block text-[18px] font-semibold">
                      {language.nativeName}
                    </span>
                    <span
                      className={`block text-[14px] ${selected ? "text-white/70" : "text-muted"}`}
                    >
                      {language.name} · {language.variety}
                    </span>
                  </span>
                  <span className="text-[20px]">{language.greeting}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col justify-center py-8">
          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.03em]">
            {t.whichSubtitles}
          </h1>
          <div className="no-scrollbar mt-5 max-h-56 overflow-y-auto rounded-[22px] bg-raised p-1.5 shadow-[0_2px_10px_rgba(36,31,41,0.05)]">
            {MEANING_LANGUAGES.map((language) => {
              const selected = language === meaningLanguage;
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() => onSetMeaning(language)}
                  aria-pressed={selected}
                  className={`press flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-[17px] ${
                    selected ? "bg-iris-soft font-semibold" : ""
                  }`}
                >
                  {language}
                  <span className="text-muted">{meaningGreeting(language)}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-6 block">
            <span className="text-[15px] font-semibold">{t.apiKey}</span>
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => onSetApiKey(event.target.value.trim())}
              placeholder="sk-ant-…"
              className="mt-2 w-full rounded-[18px] bg-raised px-4 py-3.5 text-[16px] outline-none shadow-[0_2px_10px_rgba(36,31,41,0.05)] placeholder:text-faint"
            />
            <span className="mt-2 block text-[14px] leading-snug text-faint">
              {t.apiKeyHelp}
            </span>
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={() => (step === 2 ? onDone() : setStep(step + 1))}
        className="press w-full rounded-full bg-iris py-4 text-[17px] font-semibold text-white shadow-[0_8px_24px_rgba(110,79,224,0.3)]"
      >
        {step === 2 ? t.beginButton : t.continueButton}
      </button>

      <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === step ? "w-6 bg-iris" : "w-1.5 bg-hairline"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
