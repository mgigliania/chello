"use client";

import { useEffect } from "react";
import type { Preferences } from "@/lib/types";

const DARK_GROUND = "#14111a";
const LIGHT_GROUND = "#faf8f5";

/**
 * Keeps the document in step with the chosen appearance.
 *
 * The stylesheet already handles "system" on its own, so `data-theme` is only
 * set for an explicit choice — that way the media query stays in charge when
 * the learner has not overridden it, and the attribute wins when they have.
 */
export function ThemeSync({ theme }: { theme: Preferences["theme"] }) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;

    const dark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Also repaint the browser chrome, so the iOS status bar and the address
    // bar match the page rather than flashing the other theme.
    for (const meta of document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )) {
      meta.content = dark ? DARK_GROUND : LIGHT_GROUND;
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      for (const meta of document.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
      )) {
        meta.content = query.matches ? DARK_GROUND : LIGHT_GROUND;
      }
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [theme]);

  return null;
}
