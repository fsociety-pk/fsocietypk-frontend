import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const seenKey = 'fsociety-cinematic-intro-v1';
const shouldPlay = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return sessionStorage.getItem(seenKey) !== 'seen'; } catch { return true; }
};

/** A short, skippable first visit to the public landing page. */
export default function CinematicIntro() {
  const [active, setActive] = useState(shouldPlay);
  const [scene, setScene] = useState(0);
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!active) return;
    try { sessionStorage.setItem(seenKey, 'seen'); } catch { /* Playback remains skippable. */ }
    const root = document.getElementById('root');
    const previousInert = root?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    skip.current?.focus({ preventScroll: true });
    const second = window.setTimeout(() => setScene(1), 1450);
    const finish = window.setTimeout(() => setActive(false), 3600);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = () => { if (motion.matches) setActive(false); };
    motion.addEventListener('change', reduce);
    return () => {
      window.clearTimeout(second); window.clearTimeout(finish);
      motion.removeEventListener('change', reduce);
      if (root) root.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
    };
  }, [active]);
  if (!active) return null;
  return createPortal(<div className="cinematic-intro" role="dialog" aria-modal="true" aria-label="Welcome to Fsociety PK" onKeyDown={event => {
    if (event.key === 'Escape') setActive(false);
    if (event.key === 'Tab') { event.preventDefault(); skip.current?.focus(); }
  }}>
    <p className={`cinematic-intro-text intro-scene-${scene}`} key={scene} aria-live="polite">{scene === 0 ? 'Hello Friends' : 'Welcome to the Fsociety PK'}</p>
    <button ref={skip} type="button" className="cinematic-intro-skip" onClick={() => setActive(false)}>Skip intro</button>
  </div>, document.body);
}
