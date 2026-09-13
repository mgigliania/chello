"use client";

import { useRef, useState } from "react";
import { CloseIcon } from "@/components/Icons";
import { ProviderPicker } from "@/components/ProviderPicker";
import { UI_LANGUAGES, type Strings } from "@/lib/i18n";
import { LANGUAGES, MEANING_LANGUAGES } from "@/lib/languages";
import { providerFor } from "@/lib/providers";
import { exportArchive, importArchive } from "@/lib/storage";
import type { Archive, Preferences } from "@/lib/types";

interface Props {
  t: Strings;
  archive: Archive;
  preferences: Preferences;
  keys: Record<string, string>;
  onClose(): void;
  onChange(patch: Partial<Preferences>): void;
  onSetKey(provider: string, key: string): void;
  onReplaceArchive(archive: Archive): void;
  onDeleteEverything(): void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: T; label: string; hint?: string }>;
  value: T;
  onChange(value: T): void;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] bg-raised shadow-[0_2px_10px_rgba(36,31,41,0.05)]">
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={option.id === value}
          className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-[17px] ${
            index > 0 ? "border-t border-hairline" : ""
          } ${option.id === value ? "bg-iris-soft font-semibold" : ""}`}
        >
          <span>
            {option.label}
            {option.hint && (
              <span className="block text-[13px] font-normal text-muted">
                {option.hint}
              </span>
            )}
          </span>
          {option.id === value && <span className="text-iris">✓</span>}
        </button>
      ))}
    </div>
  );
}

export function SettingsSheet({
  t,
  archive,
  preferences,
  keys,
  onClose,
  onChange,
  onSetKey,
  onReplaceArchive,
  onDeleteEverything,
}: Props) {
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const download = () => {
    const blob = new Blob([exportArchive(archive)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pancho-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file: File) => {
    try {
      onReplaceArchive(importArchive(await file.text()));
      setNotice(t.done);
    } catch {
      setNotice(t.somethingWentWrong);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ground">
      <div
        className="mx-auto w-full max-w-md px-5 pb-16"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
            {t.settings}
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="press grid size-11 place-items-center rounded-full bg-raised shadow-[0_2px_10px_rgba(36,31,41,0.06)]"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <Section title={t.learningLanguage}>
          <Choice
            value={preferences.learningLanguageID}
            onChange={(id) => onChange({ learningLanguageID: id })}
            options={LANGUAGES.map((language) => ({
              id: language.id,
              label: `${language.flag}  ${language.nativeName}`,
              hint: `${language.name} · ${language.variety}`,
            }))}
          />
        </Section>

        <Section title={t.subtitleLanguage}>
          <Choice
            value={preferences.meaningLanguage}
            onChange={(language) => onChange({ meaningLanguage: language })}
            options={MEANING_LANGUAGES.map((language) => ({
              id: language,
              label: language,
            }))}
          />
        </Section>

        <Section title={t.interfaceLanguage}>
          <Choice
            value={preferences.interfaceLanguage}
            onChange={(id) => onChange({ interfaceLanguage: id })}
            options={UI_LANGUAGES.map((language) => ({
              id: language.id,
              label: language.label,
            }))}
          />
        </Section>

        <Section title={t.appearance}>
          <Choice
            value={preferences.theme}
            onChange={(theme) => onChange({ theme })}
            options={[
              { id: "system" as const, label: t.themeSystem },
              { id: "light" as const, label: t.themeLight },
              { id: "dark" as const, label: t.themeDark },
            ]}
          />
        </Section>

        <Section title={t.speechRate}>
          <div className="rounded-[20px] bg-raised px-5 py-4 shadow-[0_2px_10px_rgba(36,31,41,0.05)]">
            <input
              type="range"
              min={0.6}
              max={1.3}
              step={0.05}
              value={preferences.speechRate}
              onChange={(event) =>
                onChange({ speechRate: Number(event.target.value) })
              }
              aria-label={t.speechRate}
              className="w-full accent-iris"
            />
            <div className="mt-1 flex justify-between text-[13px] text-muted">
              <span>{t.slower}</span>
              <span>{t.faster}</span>
            </div>
          </div>
        </Section>

        <Section title={t.interests}>
          <textarea
            rows={3}
            value={preferences.interests}
            onChange={(event) => onChange({ interests: event.target.value })}
            className="w-full resize-none rounded-[20px] bg-raised px-4 py-3.5 text-[16px] shadow-[0_2px_10px_rgba(36,31,41,0.05)] outline-none placeholder:text-faint"
            placeholder={
              LANGUAGES.find((l) => l.id === preferences.learningLanguageID)
                ?.interestsPlaceholder ?? ""
            }
          />
        </Section>

        <Section title={t.whereItThinks}>
          <ProviderPicker
            t={t}
            provider={preferences.provider}
            keys={keys}
            onSetProvider={(id) => onChange({ provider: id })}
            onSetKey={onSetKey}
          />

          <div className="mt-5">
            <Choice
              value={preferences.quality}
              onChange={(quality) => onChange({ quality })}
              options={[
                {
                  id: "balanced" as const,
                  label: "Balanced",
                  hint: "Replies fast. Best for live conversation.",
                },
                {
                  id: "best" as const,
                  label: "Deepest",
                  hint: "Slower to answer, more nuanced teaching.",
                },
              ]}
            />
          </div>

          <label className="mt-5 block">
            <span className="text-[15px] font-semibold">{t.modelName}</span>
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={preferences.models[preferences.provider] ?? ""}
              onChange={(event) =>
                onChange({
                  models: {
                    ...preferences.models,
                    [preferences.provider]: event.target.value.trim(),
                  },
                })
              }
              placeholder={providerFor(preferences.provider).defaultModel}
              className="mt-2 w-full rounded-[18px] bg-raised px-4 py-3.5 text-[16px] shadow-[0_2px_10px_rgba(36,31,41,0.05)] outline-none placeholder:text-faint"
            />
            <span className="mt-2 block text-[14px] leading-snug text-faint">
              {t.modelHint}
            </span>
          </label>
        </Section>

        <Section title={t.yourData}>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={download}
              className="press rounded-[18px] bg-raised px-4 py-3.5 text-left text-[17px] shadow-[0_2px_10px_rgba(36,31,41,0.05)]"
            >
              {t.exportBackup}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="press rounded-[18px] bg-raised px-4 py-3.5 text-left text-[17px] shadow-[0_2px_10px_rgba(36,31,41,0.05)]"
            >
              {t.importBackup}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.deleteConfirm)) onDeleteEverything();
              }}
              className="press rounded-[18px] bg-rose px-4 py-3.5 text-left text-[17px] text-ink"
            >
              {t.deleteEverything}
            </button>
          </div>
          {notice && <p className="mt-2 text-[14px] text-muted">{notice}</p>}
          <p className="mt-4 text-[14px] leading-relaxed text-faint">
            {t.privacyNote}
          </p>
        </Section>
      </div>
    </div>
  );
}
