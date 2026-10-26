import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, Laugh, Loader2, ShieldCheck } from 'lucide-react';

const punchlines = [
  'Bobby Tables called. He wants his 2002 login trick back. The admin panel was acting the whole time.',
  'Achievement unlocked: promoted to Senior Login Page Entertainer. Salary: zero admin permissions.',
  'You ordered admin privileges. We delivered a plot twist. Five stars, please.',
  'Your SQL passed the vibe check. Unfortunately, the database does not accept vibes as credentials.',
  'For four beautiful seconds, you were the CEO of Absolutely Nothing. Try a CTF next.',
  'The database said no. The login page said let’s make this awkward. Here we are.',
];

interface Props { round: number; signup: boolean; onReturn: () => void; }

/** A local visual joke. It never creates a session or contacts an admin endpoint. */
export default function SqlPrank({ round, signup, onReturn }: Props) {
  const [phase, setPhase] = useState<'connecting' | 'welcome' | 'reveal'>('connecting');
  const heading = useRef<HTMLHeadingElement>(null);
  const revealed = phase === 'reveal';

  useEffect(() => {
    const welcome = window.setTimeout(() => setPhase('welcome'), 1400);
    const reveal = window.setTimeout(() => setPhase('reveal'), 4000);
    return () => { window.clearTimeout(welcome); window.clearTimeout(reveal); };
  }, []);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  return <section className={`sql-prank ${revealed ? 'is-revealed' : ''}`} aria-labelledby="sql-prank-title">
    <div className="sql-prank-emblem" aria-hidden="true">{revealed ? <Laugh size={32} /> : <ShieldCheck size={32} />}</div>
    <div role="status" aria-live="polite" aria-atomic="true">
      <h1 ref={heading} id="sql-prank-title" tabIndex={-1}>
        {revealed ? 'Lol! Did you think that worked?' : phase === 'welcome' ? 'Welcome back, admin.' : 'Logging in as admin…'}
      </h1>
      <p className="sql-prank-description">{revealed ? punchlines[round % punchlines.length] : phase === 'welcome' ? 'Your admin workspace is ready. Make yourself comfortable.' : 'Preparing your administrator workspace. One moment…'}</p>
    </div>

    {!revealed && <div className="sql-prank-workspace" aria-hidden="true">
      <div className="sql-prank-identity"><span><ShieldCheck size={21} /></span><div><strong>admin</strong><small>Fsociety PK workspace</small></div><span className="sql-prank-role">Administrator</span></div>
      <ul className="sql-prank-checks">
        <li><Check size={16} /><span>Credentials accepted</span></li>
        <li>{phase === 'connecting' ? <Loader2 size={16} className="sql-prank-spinner" /> : <Check size={16} />}<span>Opening admin workspace</span></li>
      </ul>
    </div>}

    {revealed && <div className="sql-prank-reveal">
      <Laugh size={22} aria-hidden="true" />
      <div><strong>Just a prank. You’re still signed out.</strong><p>Put that curiosity to work in a CTF challenge. There are real flags waiting for you.</p></div>
    </div>}

    <div className="sql-prank-actions">
      <button type="button" className={revealed ? 'btn-primary' : 'btn-ghost'} onClick={onReturn}><ArrowLeft size={16} />{signup ? 'Back to signup' : 'Back to login'}</button>
      {revealed && <Link to="/challenges" className="btn-outline">Find a challenge <ArrowUpRight size={16} /></Link>}
    </div>
    {revealed && <p className="sql-prank-footnote">No admin access was granted. Good curiosity, though.</p>}
  </section>;
}
