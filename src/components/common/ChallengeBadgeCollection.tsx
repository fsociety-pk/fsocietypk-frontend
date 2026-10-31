import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Award, Search } from 'lucide-react';
import type { UserProfile } from '../../services/userService';
import { badgeDesign, profileBadges, type EarnedChallengeBadge } from '../../utils/challengeBadges';
import { CHALLENGE_CATEGORIES, CATEGORY_LABELS } from '../../utils/categories';
import { safeDate } from './ProfileOverview';
import ChallengeBadgeMark from './ChallengeBadgeMark';
import ChallengeBadgeDetails from './ChallengeBadgeDetails';
import '../../styles/challenge-badges.css';

export default function ChallengeBadgeCollection({ profile, limit, onViewAll }: { profile: UserProfile; limit?: number; onViewAll?: () => void }) {
  const badges = useMemo(() => profileBadges(profile), [profile]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);
  const [selected, setSelected] = useState<EarnedChallengeBadge | null>(null);
  const [params, setParams] = useSearchParams();
  const requested = params.get('badge');
  useEffect(() => {
    if (requested) setSelected(badges.find(badge => badge.challengeId === requested) || null);
  }, [requested, badges]);
  const filtered = badges.filter(badge => (category === 'all' || badge.category === category) && badge.title.toLowerCase().includes(search.trim().toLowerCase()));
  const visible = filtered.slice(0, limit || visibleCount);
  const close = () => {
    setSelected(null);
    if (requested) { const next = new URLSearchParams(params); next.delete('badge'); setParams(next, { replace: true }); }
  };
  return <section className="challenge-badge-collection" aria-labelledby="challenge-badges-heading">
    <header className="challenge-badge-collection-heading"><div><h2 id="challenge-badges-heading">Challenge badges <span>{badges.length}</span></h2><p>A badge for every challenge completed. Your practice, collected.</p></div>{onViewAll && badges.length > (limit || 0) && <button className="btn-ghost" onClick={onViewAll}>View all badges<ArrowUpRight size={16} /></button>}</header>
    {!limit && badges.length > 0 && <div className="challenge-badge-controls"><label className="challenge-badge-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Search earned badges</span><input className="input" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by challenge" /></label><label><span className="sr-only">Filter badges by category</span><select className="input" value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{CHALLENGE_CATEGORIES.filter(value => badges.some(badge => badge.category === value)).map(value => <option value={value} key={value}>{CATEGORY_LABELS[value]}</option>)}</select></label></div>}
    {visible.length ? <div className="challenge-badge-grid">{visible.map((badge, index) => <button className="challenge-badge-card" key={badge.id} onClick={() => setSelected(badge)} aria-label={`View ${badge.title} badge`} data-badge-category={badge.category}>
      <ChallengeBadgeMark category={badge.category} username={profile.username} decorative shine shineDelay={-(index % 8) * .55} />
      <strong>{badge.title}</strong><span className="challenge-badge-category">{badgeDesign(badge.category).label}</span>
      <span className="challenge-badge-card-footer"><span className="capitalize">{badge.difficulty || 'Completed'}</span><span>+{badge.points.toLocaleString()} pts</span></span><time dateTime={badge.earnedAt || undefined}>{badge.earnedAt ? safeDate(badge.earnedAt) : 'Completion date not recorded'}</time>
    </button>)}</div> : <div className="challenge-badge-empty"><Award size={30} aria-hidden="true" /><h3>{badges.length ? 'No matching badges' : 'Your first badge is waiting.'}</h3><p>{badges.length ? 'Try another challenge name or category.' : 'Complete every flag in a challenge to earn its category badge.'}</p>{!badges.length && <Link className="btn-primary" to="/challenges">Explore challenges<ArrowUpRight size={16} /></Link>}</div>}
    {!limit && filtered.length > visibleCount && <button className="btn-outline challenge-badge-more" onClick={() => setVisibleCount(value => value + 24)}>Show more badges ({filtered.length - visibleCount})</button>}
    <ChallengeBadgeDetails badge={selected} username={profile.username} onClose={close} isPublic={profile.isProfilePublic !== false} />
  </section>;
}
