import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/auth-fluid.css';

const channel = 'fsociety-auth-fluid-v1';

/** An isolated visual layer. Only pointer coordinates and pause state cross the boundary. */
export default function AuthFluidBackground() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [enabled, setEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [ready, setReady] = useState('loading');
  const post = useCallback((data: Record<string, unknown>) => frame.current?.contentWindow?.postMessage({ channel, ...data }, '*'), []);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setEnabled(!motion.matches);
    motion.addEventListener('change', change);
    return () => motion.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!enabled) return;
    setReady('loading');
    let raf = 0;
    let pointer = { x: 0, y: 0 };
    const move = (event: PointerEvent) => {
      if (document.hidden || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
      pointer = { x: Math.max(0, Math.min(1, event.clientX / window.innerWidth)), y: Math.max(0, Math.min(1, event.clientY / window.innerHeight)) };
      if (!raf) raf = window.requestAnimationFrame(() => { raf = 0; post({ pointer: true, ...pointer }); });
    };
    const status = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.channel !== channel || typeof event.data.ready !== 'boolean') return;
      setReady(event.data.ready ? 'active' : 'unavailable');
    };
    const visibility = () => post({ paused: document.hidden });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('message', status);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('message', status);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [enabled, post]);
  return createPortal(<div className="auth-fluid" aria-hidden="true" data-ready={enabled ? ready : 'reduced'}>
    {enabled && <iframe ref={frame} src="/auth-fluid/index.html" title="Decorative fluid background" tabIndex={-1} sandbox="allow-scripts" onLoad={() => post({ init: true, paused: document.hidden })} />}
  </div>, document.body);
}
