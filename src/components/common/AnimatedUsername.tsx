import { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

/** The accessible name and typeset character widths stay stable while only
 * decorative ink decodes. Real usernames are never replaced in the data. */
export default function AnimatedUsername({ username }: { username: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const play = useRef(() => {});
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    const node = heading.current;
    if (!node) return;
    const ink = Array.from(node.querySelectorAll<HTMLElement>('[data-username-ink]'));
    const letters = [...username];
    let frame = 0;
    let running = false;
    let lastTick = -1;
    const finish = () => {
      cancelAnimationFrame(frame);
      ink.forEach((span, i) => { span.textContent = letters[i]; delete span.dataset.decoding; });
      running = false;
      node.dataset.usernameState = 'settled';
    };
    const start = () => {
      if (reduced || running || document.hidden) return;
      running = true;
      lastTick = -1;
      node.dataset.usernameState = 'decoding';
      const started = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - started) / 850);
        const tick = Math.floor((now - started) / 44);
        if (tick !== lastTick) {
          ink.forEach((span, i) => {
            const resolved = p >= .18 + (i / Math.max(1, ink.length)) * .72;
            span.textContent = resolved ? letters[i] : '01ABCDEF'[(tick * 3 + i * 5) % 8];
            if (resolved) delete span.dataset.decoding;
            else span.dataset.decoding = '';
          });
          lastTick = tick;
        }
        if (p < 1) frame = requestAnimationFrame(step);
        else finish();
      };
      frame = requestAnimationFrame(step);
    };
    play.current = start;
    const onHidden = () => { if (document.hidden) finish(); };
    document.addEventListener('visibilitychange', onHidden);
    finish();
    start();
    return () => {
      finish();
      play.current = () => {};
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [username, reduced]);

  return <div className="profile-username-row">
    <h1 className="profile-name" ref={heading} aria-label={username} onPointerEnter={event => {
      if (event.pointerType === 'mouse') play.current();
    }}>
      <span aria-hidden="true">{[...username].map((letter, i) => <span className="username-letter" key={i}>
        <span className="username-letter-measure">{letter}</span><span data-username-ink>{letter}</span>
      </span>)}</span>
    </h1>
    {!reduced && <button type="button" className="profile-replay-name" aria-label="Replay username animation" title="Replay username animation" onClick={() => play.current()}><RotateCcw size={15} aria-hidden="true" /></button>}
  </div>;
}
