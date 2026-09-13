"use client";

import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/Icons";
import type { Strings } from "@/lib/i18n";
import { PROVIDERS, providerFor } from "@/lib/providers";

interface Listing {
  id: string;
  name: string;
  free: boolean;
}

/**
 * The best model to start someone on, from what their key can actually call.
 *
 * A conversation wants speed over depth, and "flash"/"mini"/"instant" is how
 * every provider names its quick tier. Free wins over paid; beyond that the
 * provider's own ordering is as good a guide as any.
 */
function preferred(models: Listing[]): string | null {
  const quick = /flash|mini|instant|small|haiku|scout/i;
  const free = models.filter((model) => model.free);
  const pool = free.length > 0 ? free : models;
  return (pool.find((model) => quick.test(model.id)) ?? pool[0])?.id ?? null;
}

interface Props {
  t: Strings;
  provider: string;
  keys: Record<string, string>;
  models: Record<string, string>;
  onSetProvider(id: string): void;
  onSetKey(provider: string, key: string): void;
  onSetModel(provider: string, model: string): void;
}

/**
 * Choosing a service, its key, and its model, as one thing.
 *
 * They belong together: a key is worthless against the wrong provider, the
 * free options are only obvious if the price sits on the option itself, and a
 * provider whose free roster rotates needs its model picked from what is
 * actually free today rather than from a guess baked into the build.
 */
export function ProviderPicker({
  t,
  provider,
  keys,
  models,
  onSetProvider,
  onSetKey,
  onSetModel,
}: Props) {
  const current = providerFor(provider);
  const key = keys[current.id] ?? "";
  const keyLooksWrong = key.length > 0 && !current.keyPattern.test(key);
  const model = models[current.id] ?? "";

  // Cached by provider *and* key, because the answer depends on both: the same
  // catalogue with a different account can allow different models. Caching
  // also means "still loading" is the absence of an entry rather than a second
  // piece of state written during the effect.
  const [catalogues, setCatalogues] = useState<Record<string, Listing[]>>({});
  const askable = Boolean(key) || Boolean(current.catalogueURL);
  const cacheKey = `${current.id}:${key}`;
  const listing = catalogues[cacheKey];
  const loading = askable && listing === undefined;

  useEffect(() => {
    if (!askable || catalogues[cacheKey] !== undefined) return;
    let live = true;
    // Debounced, so pasting a key character by character asks once.
    const timer = setTimeout(() => {
      fetch(`/api/models?provider=${encodeURIComponent(current.id)}`, {
        headers: key ? { "x-pancho-key": key } : {},
      })
        .then((response) => (response.ok ? response.json() : { models: [] }))
        .then((body: { models?: Listing[] }) => {
          if (!live) return;
          const found = body.models ?? [];
          setCatalogues((prior) => ({ ...prior, [cacheKey]: found }));
          // Nothing chosen yet: start them on something the key can call,
          // rather than on a name hard-coded months ago.
          if (!models[current.id] && found.length > 0) {
            const pick = preferred(found);
            if (pick) onSetModel(current.id, pick);
          }
        })
        .catch(() => {
          if (live) setCatalogues((prior) => ({ ...prior, [cacheKey]: [] }));
        });
    }, 600);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [askable, cacheKey, catalogues, current.id, key, models, onSetModel]);

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
        {keyLooksWrong ? (
          <span className="mt-2 block rounded-[14px] bg-butter px-3.5 py-2.5 text-[14px] leading-snug text-ink">
            {t.keyLooksWrong}{" "}
            <span className="font-mono">{current.keyHint}</span>
          </span>
        ) : (
          <span className="mt-2 block text-[14px] leading-snug text-faint">
            {t.apiKeyHelp}
          </span>
        )}
      </label>

      <label className="mt-5 block">
        <span className="text-[15px] font-semibold">{t.modelName}</span>
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={model}
          onChange={(event) => onSetModel(current.id, event.target.value.trim())}
          placeholder={current.defaultModel || t.freeNow}
          className="mt-2 w-full rounded-[18px] bg-raised px-4 py-3.5 font-mono text-[15px] shadow-[0_2px_10px_rgba(36,31,41,0.05)] outline-none placeholder:font-sans placeholder:text-faint"
        />
        <span className="mt-2 block text-[14px] leading-snug text-faint">
          {current.defaultModel ? t.modelHint : t.modelRequired}
        </span>
      </label>

      {askable && (
        <div className="mt-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
            {t.availableModels}
          </p>
          {loading && (
            <p className="mt-2 text-[15px] text-faint">{t.loadingModels}</p>
          )}
          {!loading && listing && listing.length === 0 && (
            <p className="mt-2 text-[15px] leading-snug text-faint">
              {t.modelsUnavailable}
            </p>
          )}
          {!loading && !!listing?.length && (
            <div className="no-scrollbar mt-2 max-h-56 space-y-1.5 overflow-y-auto">
              {listing.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onSetModel(current.id, entry.id)}
                  aria-pressed={entry.id === model}
                  className={`press block w-full rounded-[14px] px-4 py-2.5 text-left ${
                    entry.id === model ? "bg-iris-soft" : "bg-raised"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold">{entry.name}</span>
                    {entry.free && (
                      <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">
                        {t.freeLabel}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[12px] text-faint">
                    {entry.id}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
