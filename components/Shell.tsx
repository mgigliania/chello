"use client";

import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { SlidersIcon } from "@/components/Icons";

interface Props {
  onOpenSettings(): void;
  settingsLabel: string;
  children: ReactNode;
}

export function Shell({ onOpenSettings, settingsLabel, children }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      <header
        className="flex shrink-0 items-center justify-between"
        style={{ paddingTop: "max(14px, env(safe-area-inset-top))" }}
      >
        <Brand />
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={settingsLabel}
          className="press grid size-11 place-items-center rounded-full bg-raised text-ink shadow-[0_2px_10px_rgba(36,31,41,0.08)]"
        >
          <SlidersIcon size={21} />
        </button>
      </header>
      {children}
    </div>
  );
}
