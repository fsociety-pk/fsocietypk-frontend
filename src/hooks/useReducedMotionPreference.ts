import { useSyncExternalStore } from 'react';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (notify: () => void) => {
  const preference = window.matchMedia(query);
  preference.addEventListener('change', notify);
  return () => preference.removeEventListener('change', notify);
};
const snapshot = () => window.matchMedia(query).matches;

/** Subscribe to live preference changes, including while a certificate is open. */
export const useReducedMotionPreference = () => useSyncExternalStore(subscribe, snapshot, () => true);
