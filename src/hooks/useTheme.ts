import { useSyncExternalStore } from 'react';
export type Theme = 'dark' | 'light';
const storageKey = 'fsociety-theme';
const themeEvent = 'fsociety-theme-change';

export function applyTheme(theme: Theme = 'light') {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#101715' : '#f7f9f8');
    try { localStorage.setItem(storageKey, theme); } catch { /* The current tab still works without storage. */ }
    window.dispatchEvent(new Event(themeEvent));
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme);
  return {
    theme,
    toggleTheme: () => applyTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}

function getTheme(): Theme { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
function subscribe(callback: () => void) {
  const sync = (event: StorageEvent) => { if (event.key === storageKey) { applyTheme(event.newValue === 'dark' ? 'dark' : 'light'); } };
  window.addEventListener(themeEvent, callback);
  window.addEventListener('storage', sync);
  return () => { window.removeEventListener(themeEvent, callback); window.removeEventListener('storage', sync); };
}
