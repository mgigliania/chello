"use client";

import type { ReactNode } from "react";
import { Brand } from "@/components/Brand";
import { SlidersIcon } from "@/components/Icons";

interface Props {
  onOpenSettings(): void;
  settingsLabel: string;
  children: ReactNode;
}

/**
 * A fixed-height frame with one scrolling region.
 *
 * The height is definite rather than a minimum so the Talk screen can size
 * itself to what is left: its orb shrinks to fit, instead of the page growing
 * and pushing the microphone under the tab bar. Taller screens simply scroll.
 */
export function Shell({ onOpenSettings, settingsLabel, children }: Props) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-5">
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
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
