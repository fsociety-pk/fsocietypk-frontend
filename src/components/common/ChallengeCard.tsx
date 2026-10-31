import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CheckCircle2 } from 'lucide-react';
import type { IChallenge } from '../../types';
import { CATEGORY_LABELS } from '../../utils/categories';
import FlagProgress from './FlagProgress';
import '../../styles/challenge-cards.css';

export default function ChallengeCard({ challenge: c }: { challenge: IChallenge }) {
  // Only the server's completion flag unlocks the solved treatment.
  const solved = c.isSolved === true;
  const total = c.totalFlags ?? 1;
  const completed = c.completedFlags ?? (solved ? total : 0);
  const started = completed > 0;
  const state = solved ? 'solved' : started ? 'in-progress' : 'not-started';
  const destination = `/challenges/${c._id}`;

  return (
    <article className={`challenge-card${solved ? ' challenge-card-solved' : ''}`} data-category={c.category} data-state={state}>
      <div className="challenge-card-body">
        <div className="challenge-card-heading">
          <span className="category-label">{CATEGORY_LABELS[c.category] || c.category}</span>
          <span className={`challenge-difficulty badge-${c.difficulty}`}>{c.difficulty}</span>
        </div>
        <h2><Link to={destination}>{c.title}</Link></h2>
        <p className="challenge-card-description">{c.description}</p>
        <FlagProgress completed={completed} total={total} />
        <footer className="challenge-card-facts">
          <strong>{c.points}<span> pts</span></strong>
          <span>{c.solveCount || 0} {(c.solveCount || 0) === 1 ? 'solver' : 'solvers'}</span>
        </footer>
        <div className="challenge-writeups">
          {(c.writeupCount ?? 0) > 0
            ? <Link to={`/writeups/challenge/${c._id}`}><BookOpen size={15} aria-hidden="true" />{c.writeupCount} {c.writeupCount === 1 ? 'writeup' : 'writeups'} available</Link>
            : <span><BookOpen size={15} aria-hidden="true" />No writeups yet</span>}
        </div>
      </div>
      <div className="challenge-card-status">
        <span>{solved ? <CheckCircle2 size={17} aria-hidden="true" /> : <span className="challenge-state-mark" aria-hidden="true" />}{solved ? 'Challenge solved' : started ? 'In progress' : 'Not started'}</span>
        {solved && <span>All flags captured</span>}
      </div>
      <Link className="challenge-card-action" to={destination}>
        <strong>{solved ? 'Review challenge' : started ? 'Continue challenge' : 'Start challenge'}</strong>
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </article>
  );
}
