import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "fsociety-theme";
const listeners = new Set<() => void>();
const snapshot = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key === KEY)
      applyTheme(event.newValue === "dark" ? "dark" : "light", false);
  };
  window.addEventListener("storage", sync);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", sync);
  };
};
export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#04060f" : "#ffffff");
  if (persist) {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* Theme still works without storage. */
    }
  }
  listeners.forEach((listener) => listener());
}
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "light" as Theme,
  );
  return {
    theme,
    toggleTheme: () => applyTheme(theme === "light" ? "dark" : "light"),
  };
}
