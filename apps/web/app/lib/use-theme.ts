"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "ralph:report-theme";
const EVT = "ralph:report-theme-change";

// Theme for the report / cinema rendering ONLY — it does NOT theme the site,
// which stays light. State is mirrored to localStorage + a window event so the
// header toggle and the cinema stay in sync. Default is light.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Theme | null) ?? "light";
    setThemeState(saved);
    const onChange = (e: Event) => setThemeState((e as CustomEvent<Theme>).detail);
    window.addEventListener(EVT, onChange as EventListener);
    return () => window.removeEventListener(EVT, onChange as EventListener);
  }, []);

  const setTheme = (t: Theme) => {
    localStorage.setItem(KEY, t);
    window.dispatchEvent(new CustomEvent<Theme>(EVT, { detail: t }));
  };

  return { theme, toggle: () => setTheme(theme === "light" ? "dark" : "light"), setTheme };
}
