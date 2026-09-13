"use client";

import { useMemo, useState } from "react";
import { ArrowIcon, ThemeIcons, WaveformIcon } from "@/components/Icons";
import { PageHeading } from "@/components/PageHeading";
import { SearchField } from "@/components/SearchField";
import type { Strings } from "@/lib/i18n";
import { THEME_CATEGORIES, themesFor } from "@/lib/themes";

const PANELS = ["bg-rose", "bg-lilac", "bg-mint", "bg-butter"] as const;

interface Props {
  t: Strings;
  languageID: string;
  onChoose(themeID?: string): void;
}

export function ThemesScreen({ t, languageID, onChoose }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const themes = useMemo(() => themesFor(languageID), [languageID]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return themes.filter((theme) => {
      if (category !== "All" && theme.category !== category) return false;
      if (!needle) return true;
      return (
        theme.title.toLowerCase().includes(needle) ||
        theme.subtitle.toLowerCase().includes(needle) ||
        theme.category.toLowerCase().includes(needle)
      );
    });
  }, [themes, query, category]);

  return (
    <div className="pb-28">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={t.findConversation}
      />

      <PageHeading
        eyebrow={t.aPlaceToBegin}
        title={t.whatsOnYourMind}
        subtitle={t.sameFriend}
      />

      <button
        type="button"
        onClick={() => onChoose(undefined)}
        className="press mt-6 flex w-full items-center gap-3 rounded-[26px] bg-raised px-5 py-5 text-left shadow-[0_2px_14px_rgba(36,31,41,0.06)]"
      >
        <WaveformIcon size={24} />
        <span className="flex-1 text-[19px] font-semibold">{t.justTalk}</span>
        <ArrowIcon size={20} />
      </button>

      <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5">
        {THEME_CATEGORIES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategory(name)}
            aria-pressed={category === name}
            className={`press shrink-0 rounded-full px-4 py-2.5 text-[15px] ${
              category === name
                ? "bg-iris-soft font-medium text-ink"
                : "bg-raised text-muted"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {visible.map((theme) => {
          const Icon = ThemeIcons[theme.symbol] ?? ThemeIcons.sparkles;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChoose(theme.id)}
              className={`press flex aspect-square flex-col justify-between rounded-card p-4 text-left ${
                PANELS[theme.colorIndex % PANELS.length]
              }`}
            >
              <span className="text-ink/70">
                <Icon size={30} />
              </span>
              <span>
                <span className="block text-[17px] font-semibold leading-tight text-ink">
                  {theme.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-[14px] leading-snug text-ink/55">
                  {theme.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
