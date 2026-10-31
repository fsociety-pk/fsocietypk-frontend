import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';
import type { EarnedChallengeBadge } from '../../utils/challengeBadges';
import ChallengeBadgeMark from './ChallengeBadgeMark';
import '../../styles/challenge-completion.css';

const pieces = Array.from({ length: 36 }, (_, index) => {
  const angle = index * Math.PI * 2 / 36;
  const radius = 160 + index % 5 * 36;
  return { '--confetti-x': `${Math.sin(angle) * radius}px`, '--confetti-y': `${Math.cos(angle) * radius * .7 + 100}px`,
    '--confetti-rotation': `${index % 2 ? 210 : -240}deg`, '--confetti-delay': `${index % 6 * 25}ms`,
    '--confetti-color': ['rgb(var(--brand))', 'rgb(var(--warning))', 'rgb(var(--info))', 'rgb(var(--violet))', 'rgb(var(--coral))'][index % 5],
  } as CSSProperties;
});

export default function ChallengeCompletionCelebration({ badge, username, points, onClose, onViewBadge }: {
  badge: EarnedChallengeBadge | null; username: string; points: number; onClose: () => void; onViewBadge: () => void;
}) {
  const reduced = useReducedMotionPreference();
  const [phase, setPhase] = useState<'celebrate' | 'points' | 'complete'>('celebrate');
  const counter = useRef<HTMLSpanElement>(null);
  const dialog = useDialogFocus(!!badge, onClose);
  useEffect(() => {
    if (!badge) return;
    setPhase(reduced ? 'complete' : 'celebrate');
    if (reduced) return;
    let frame = 0;
    const start = window.setTimeout(() => {
      setPhase('points');
      const startedAt = performance.now();
      const count = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / 850);
        if (counter.current) counter.current.textContent = `+${Math.round(points * (1 - (1 - progress) ** 3)).toLocaleString()}`;
        if (progress < 1) frame = requestAnimationFrame(count);
      };
      frame = requestAnimationFrame(count);
    }, 700);
    const finish = window.setTimeout(() => setPhase('complete'), 1750);
    return () => { clearTimeout(start); clearTimeout(finish); cancelAnimationFrame(frame); };
  }, [badge?.id, points, reduced]);
  if (!badge) return null;
  const complete = reduced || phase === 'complete';
  return createPortal(<div className="challenge-completion-overlay">
    <div className="challenge-completion-backdrop" onClick={onClose} aria-hidden="true" />
    {!reduced && <div className="completion-confetti" aria-hidden="true">{pieces.map((style, index) => <span key={index} style={style} />)}</div>}
    <div ref={dialog} className={`challenge-completion-dialog phase-${complete ? 'complete' : phase}`} role="dialog" aria-modal="true" aria-labelledby="completion-title" aria-describedby="completion-description" tabIndex={-1}>
      <button className="icon-button completion-close" aria-label="Close celebration" onClick={onClose}><X size={19} /></button>
      <div className="completion-art" aria-hidden="true">
        {complete ? <div className="completion-earned-mark"><ChallengeBadgeMark category={badge.category} username={username} decorative /></div> : phase === 'celebrate' ? <div className="completion-check"><Check size={44} /></div> : <div className="completion-points"><span ref={counter}>+0</span><small>points earned</small></div>}
      </div>
      <div className="completion-message" aria-live="polite" aria-atomic="true"><h2 id="completion-title">{complete ? 'Challenge successfully completed' : phase === 'points' ? 'Points earned' : 'All flags captured!'}</h2><p id="completion-description">{complete ? 'Your badge has been added to your profile.' : phase === 'points' ? `${points.toLocaleString()} points added to your score.` : 'Every flag verified. You earned this.'}</p></div>
      <p className="completion-challenge-title">{badge.title}</p>
      {complete && <><div className="completion-points-total">+{points.toLocaleString()} points earned</div><div className="completion-actions"><button className="btn-primary" onClick={onViewBadge}>View badge</button><Link className="btn-outline" to="/profile?tab=badges" onClick={onClose}>My badges</Link></div></>}
    </div>
  </div>, document.body);
}
