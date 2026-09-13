"use client";

import { ArrowIcon } from "@/components/Icons";
import type { Strings } from "@/lib/i18n";
import { PROVIDERS, providerFor } from "@/lib/providers";

interface Props {
  t: Strings;
  provider: string;
  keys: Record<string, string>;
  onSetProvider(id: string): void;
  onSetKey(provider: string, key: string): void;
}

/**
 * Choosing a service and pasting its key, as one thing.
 *
 * They belong together: a key is worthless against the wrong provider, and the
 * free options are only obvious if the price sits on the option itself.
 */
export function ProviderPicker({
  t,
  provider,
  keys,
  onSetProvider,
  onSetKey,
}: Props) {
  const current = providerFor(provider);
  const key = keys[current.id] ?? "";

  return (
    <div>
      <div className="grid gap-2.5">
        {PROVIDERS.map((option) => {
          const selected = option.id === current.id;
          const free = option.cost === "free";
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSetProvider(option.id)}
              aria-pressed={selected}
              className={`press rounded-[20px] px-5 py-4 text-left ${
                selected
                  ? "bg-iris-solid text-white"
                  : "bg-raised shadow-[0_2px_10px_rgba(36,31,41,0.05)]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-[17px] font-bold">{option.label}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold uppercase tracking-wide ${
                    selected
                      ? "bg-white/20 text-white"
                      : free
                        ? "bg-mint text-ink"
                        : "bg-butter text-ink"
                  }`}
                >
                  {free ? t.freeLabel : t.paidLabel}
                </span>
              </span>
              <span
                className={`mt-1 block text-[14px] ${
                  selected ? "text-white/75" : "text-muted"
                }`}
              >
                {option.blurb}
              </span>
            </button>
          );
        })}
      </div>

      <a
        href={current.keyURL}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-4 flex items-center justify-center gap-2 rounded-[18px] bg-raised px-4 py-3.5 text-[16px] font-semibold shadow-[0_2px_10px_rgba(36,31,41,0.05)]"
      >
        {current.cost === "free" ? t.getFreeKey : t.getKey}
        <ArrowIcon size={17} />
      </a>

      <label className="mt-3 block">
        <span className="text-[15px] font-semibold">
          {t.apiKey(current.label)}
        </span>
        <input
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={key}
          onChange={(event) => onSetKey(current.id, event.target.value.trim())}
          placeholder={current.keyHint}
          className="mt-2 w-full rounded-[18px] bg-raised px-4 py-3.5 text-[16px] shadow-[0_2px_10px_rgba(36,31,41,0.05)] outline-none placeholder:text-faint"
        />
        <span className="mt-2 block text-[14px] leading-snug text-faint">
          {t.apiKeyHelp}
        </span>
      </label>
    </div>
  );
}
