"use client";

import { useSyncExternalStore } from "react";
import type { Theme } from "./brand";

// Light or dark. The choice lives on <html data-theme>, set before the first
// paint by the script in app/layout.tsx; CSS and the 3D scenes both read it.
import { THEME_KEY as KEY } from "./theme-script";

function current(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current, () => "light");
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  // The browser bar follows the choice, not the device setting.
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.setAttribute("content", theme === "dark" ? "#17181b" : "#ffffff");
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
}
