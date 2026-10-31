import { useId, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { memberLevel } from '../../utils/memberLevel';

/** A dimensional level emblem, with progress tied to real earned points. */
export default function ProfileLevel({ score }: { score: number }) {
  const data = memberLevel(score);
  const id = useId().replace(/:/g, '');
  const number = String(data.level).padStart(2, '0');
  return <section className="profile-level-console" aria-label="Level progress" style={{ '--profile-progress': data.progress } as CSSProperties}>
    <div className="profile-level-header">
      <svg className="profile-level-medal" viewBox="0 0 144 144" width="144" height="144" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f4faf6" /><stop offset=".3" stopColor="#8da99b" /><stop offset=".48" stopColor="#f4faf6" /><stop offset=".7" stopColor="#6d897a" /><stop offset="1" stopColor="#b5c9be" /></linearGradient>
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a4baae" /><stop offset="1" stopColor="#405f50" /></linearGradient>
        </defs>
        <circle cx="72" cy="74" r="65" fill={`url(#${id}-edge)`} />
        <circle cx="72" cy="71" r="65" fill={`url(#${id}-rim)`} />
        <circle cx="72" cy="71" r="59" className="profile-medal-face" />
        <circle cx="72" cy="71" r="55" className="profile-medal-guide" />
        <circle cx="72" cy="71" r="55" pathLength="100" className="profile-medal-progress" transform="rotate(-90 72 71)" />
        <path className="profile-medal-engraving" d="M24 71h5M115 71h5M72 23v5M72 114v5" />
        <text x="72" y="49" className="profile-medal-label" textAnchor="middle">LEVEL</text>
        <text x="72" y="91" className="profile-medal-number" textAnchor="middle" style={{ fontSize: Math.min(46, 90 / (number.length * .64)) }}>{number}</text>
        <path className="profile-medal-engraving" d="M51 105h42" />
      </svg>
      <div className="profile-level-title"><h2>Level {number}</h2><span className="profile-level-percent">{Math.floor(data.progress * 100)}<small>%</small></span><small>toward level {data.nextLevel}</small></div>
    </div>
    <div className="profile-level-facts"><span>Level progress</span><span>{data.points.toLocaleString()} / 1,000 pts</span></div>
    <div className="profile-level-track" role="progressbar" aria-label={`Progress to level ${data.nextLevel}`} aria-valuemin={0} aria-valuemax={1000} aria-valuenow={data.points} aria-valuetext={`${data.points.toLocaleString()} of 1,000 points toward level ${data.nextLevel}`}><span style={{ width: `${data.progress * 100}%` }} /></div>
    <p>{data.remaining.toLocaleString()} points to level {data.nextLevel}</p>
    <div className="profile-level-milestone"><span>Next milestone</span><strong>Level {data.nextLevel} <span>at {data.nextTotal.toLocaleString()} total points</span></strong></div>
    <Link to="/challenges">Keep solving <ArrowUpRight size={15} aria-hidden="true" /></Link>
  </section>;
}
