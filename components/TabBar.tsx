"use client";

import { BookIcon, GridIcon, WaveformIcon } from "@/components/Icons";
import type { Strings } from "@/lib/i18n";

export type Tab = "talk" | "themes" | "words";

const ICONS = {
  talk: WaveformIcon,
  themes: GridIcon,
  words: BookIcon,
} as const;

interface Props {
  active: Tab;
  onChange(tab: Tab): void;
  t: Strings;
}

export function TabBar({ active, onChange, t }: Props) {
  const labels: Record<Tab, string> = {
    talk: t.talk,
    themes: t.themes,
    words: t.words,
  };

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="panel pointer-events-auto flex w-full max-w-sm items-center gap-1 rounded-full p-1.5 shadow-[0_8px_30px_rgba(36,31,41,0.10)]">
        {(Object.keys(ICONS) as Tab[]).map((tab) => {
          const Icon = ICONS[tab];
          const selected = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              aria-current={selected ? "page" : undefined}
              className={`press flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 ${
                selected ? "bg-iris-soft text-ink" : "text-muted"
              }`}
            >
              <Icon size={22} />
              <span className="text-[11px] font-semibold">{labels[tab]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
