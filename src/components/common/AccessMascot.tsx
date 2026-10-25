import { useEffect, useRef, useState } from 'react';
import { Hand } from 'lucide-react';

interface Props { focused: string | null; characterCount: number; covered: boolean; verified: boolean; pending: boolean; message?: string; passwordScore?: number; welcomeMessage?: string; }

function Arms() {
  return <>{(['left', 'right'] as const).map(side => <span key={side} className={`companion-arm ${side}`}><span className="companion-forearm"><svg className="companion-hand" viewBox="0 0 38 54" focusable="false"><path d="M11 0H25V8C25 11 28 12 31 15L35 19C38 23 34 28 31 25L28 23V43C28 48 22 48 22 43V32H21V48C21 53 15 53 15 48V32H14V47C14 52 8 52 8 47V31H7V41C7 46 1 46 1 41V23C1 17 11 12 11 8Z"/></svg></span></span>)}</>;
}

/** Only focus and character count reach the illustration, never password contents. */
export default function AccessMascot({ focused, characterCount, covered, verified, pending, message, passwordScore, welcomeMessage }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState(false);
  const privateEntry = focused === 'password' && !covered;
  useEffect(() => {
    if (!greeting) return;
    const timer = window.setTimeout(() => setGreeting(false), 1800);
    return () => window.clearTimeout(timer);
  }, [greeting]);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const characters = Array.from(element.querySelectorAll<HTMLElement>('.companion'));
    const setGaze = (character: HTMLElement, x: number, y: number, turn: number) => {
      character.style.setProperty('--look-x', `${x}px`);
      character.style.setProperty('--look-y', `${y}px`);
      character.style.setProperty('--head-turn', `${turn}deg`);
    };
    const lookAt = (point: { x: number; y: number }) => {
      characters.forEach(character => {
        const face = character.querySelector('.companion-face')?.getBoundingClientRect();
        if (!face) return;
        const x = Math.tanh((point.x - face.left - face.width / 2) / 100);
        const y = Math.tanh((point.y - face.top - face.height / 2) / 140);
        setGaze(character, x * 4.5, y * 5, x * 3);
      });
    };
    const lookAtForm = () => {
      if (covered || privateEntry) {
        characters.forEach(character => { const side = character.classList.contains('companion-mint') ? 1 : -1; setGaze(character, privateEntry ? side * 4 : 0, privateEntry ? -5 : 0, privateEntry ? side * 7 : 0); });
        return;
      }
      const input = focused ? document.getElementById(`auth-${focused}`) : null;
      if (input instanceof HTMLInputElement) {
        const rect = input.getBoundingClientRect();
        const style = getComputedStyle(input);
        const padding = parseFloat(style.paddingLeft) || 16;
        const available = rect.width - padding - (parseFloat(style.paddingRight) || 16);
        // Approximate the caret without reading the value. Each field has its own screen position.
        const offset = Math.min(characterCount * parseFloat(style.fontSize) * .55, available);
        lookAt({ x: rect.left + padding + offset, y: rect.top + rect.height / 2 });
      } else characters.forEach(character => setGaze(character, 0, 0, 0));
    };
    let frame = 0;
    let pointer = { x: 0, y: 0 };
    const follow = (event: PointerEvent) => {
      // Active fields own attention; masked password entry looks away and revealed entry covers up.
      if (focused || covered || motion.matches || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = window.requestAnimationFrame(() => { frame = 0; lookAt(pointer); });
    };
    const reset = () => { window.cancelAnimationFrame(frame); frame = 0; lookAtForm(); };
    lookAtForm();
    window.addEventListener('pointermove', follow, { passive: true });
    document.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('resize', reset);
    window.addEventListener('scroll', reset, { passive: true });
    motion.addEventListener('change', reset);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', follow);
      document.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', reset);
      window.removeEventListener('scroll', reset);
      motion.removeEventListener('change', reset);
    };
  }, [focused, characterCount, covered, privateEntry]);
  const caption = message || (covered ? 'Your password, your business. Hands up!' : privateEntry ? passwordScore === 5 ? 'All five checks passed. Eyes up—we respect that!' : 'Eyes up! We respect your privacy.' : greeting ? 'Hey, future flag finder!' : pending ? 'Check your inbox. You’ve got this.' : verified ? 'All checks passed. We respect that!' : focused ? 'Looking good. Keep going!' : welcomeMessage || 'Hi! Ready for a challenge?');
  return <div ref={root} className={`access-companions ${covered ? 'is-covered' : ''} ${privateEntry ? 'is-private' : ''} ${greeting ? 'is-greeting' : ''} ${verified ? 'is-ready' : ''}`}>
    <p className="companion-bubble" aria-live="polite">{caption}</p>
    <div className="companion-stage" aria-hidden="true">
      <div className="companion companion-coral"><div className="companion-face"><span className="companion-eye"><i /></span><span className="companion-eye"><i /></span><span className="companion-mouth" /></div><Arms /></div>
      <div className="companion companion-green"><span className="companion-antenna" /><div className="companion-head"><div className="companion-face"><span className="companion-eye"><i /></span><span className="companion-eye"><i /></span><span className="companion-mouth" /></div></div><div className="companion-body"><span /><span /><span /></div><Arms /></div>
      <div className="companion companion-mint"><div className="companion-face"><span className="companion-eye"><i /></span><span className="companion-eye"><i /></span><span className="companion-mouth" /></div><Arms /></div>
      <span className="companion-ground" />
    </div>
    <button type="button" className="companion-greet" title="Say hello to the crew" onClick={() => setGreeting(true)}><Hand size={15} />Say hello to the crew</button>
  </div>;
}
