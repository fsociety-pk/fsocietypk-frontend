import { useEffect, useRef, useState } from 'react';
import { Hand } from 'lucide-react';
import CompanionPrivacyArms from './CompanionPrivacyArms';
import '../../styles/access-mascot.css';

interface Props { focused: string | null; characterCount: number; covered: boolean; pending: boolean; message?: string; welcomeMessage?: string; }

function Face() {
  return <div className="companion-face">
    <span className="companion-eye left"><i /></span><span className="companion-eye right"><i /></span>
    <span className="companion-nose" /><span className="companion-cheek left" /><span className="companion-cheek right" /><span className="companion-mouth" />
  </div>;
}

/** Only focus and character count reach the illustration, never password contents. */
export default function AccessMascot({ focused, characterCount, covered, pending, message, welcomeMessage }: Props) {
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
        setGaze(character, x * 5, y * 3, x * 4);
      });
    };
    const lookAtForm = () => {
      if (covered || privateEntry) {
        characters.forEach(character => setGaze(character, privateEntry ? -4 : 0, privateEntry ? -2 : 0, privateEntry ? -5 : 0));
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
      // Active fields own attention; revealed passwords let the friends cover each other's eyes.
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
  const caption = message || (covered ? 'No peeking! Friends cover for friends.' : privateEntry ? 'Eyes up! We respect your privacy.' : greeting ? 'Hey, friend! The whole crew says hello.' : pending ? 'Check your inbox. You’ve got this.' : focused ? 'Looking good. Keep going!' : welcomeMessage || 'Hi! Ready for a challenge?');
  return <div ref={root} data-emotion="neutral" className={`access-companions cartoon-crew ${covered ? 'is-covered' : ''} ${privateEntry ? 'is-private' : ''} ${greeting ? 'is-greeting' : ''}`}>
    <p className="companion-bubble" aria-live="polite">{caption}</p>
    <div className="companion-stage" aria-hidden="true">
      {(['coral', 'green', 'lilac'] as const).map(color => <div key={color} className={`companion companion-${color}`}>
        <span className="companion-side left" /><span className="companion-side right" />
        <div className="companion-body" />
        <div className="companion-head">{color === 'green' && <span className="companion-antenna" />}<Face /></div>
      </div>)}
      <CompanionPrivacyArms covered={covered} />
    </div>
    <button type="button" className="companion-greet" title="Say hello to the crew" aria-label="Say hello to the crew" onClick={() => setGreeting(true)}><Hand size={16} /></button>
  </div>;
}
