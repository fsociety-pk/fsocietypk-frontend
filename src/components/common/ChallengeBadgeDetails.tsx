import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { badgeDesign, downloadChallengeBadge, type EarnedChallengeBadge } from '../../utils/challengeBadges';
import { safeDate } from './ProfileOverview';
import ChallengeBadgeMark from './ChallengeBadgeMark';
import '../../styles/challenge-badges.css';

export default function ChallengeBadgeDetails({ badge, username, onClose, isPublic = false, showProfileLink = false }: {
  badge: EarnedChallengeBadge | null; username: string; onClose: () => void; isPublic?: boolean; showProfileLink?: boolean;
}) {
  const dialog = useDialogFocus(!!badge, onClose);
  const [downloading, setDownloading] = useState(false);
  if (!badge) return null;
  const download = async () => {
    setDownloading(true);
    try { await downloadChallengeBadge(badge, username); toast.success('Badge downloaded'); }
    catch { toast.error('Could not download the badge. Please try again.'); }
    finally { setDownloading(false); }
  };
  const copyLink = async () => {
    try {
      const url = new URL(`/profile/${encodeURIComponent(username)}`, window.location.origin);
      url.searchParams.set('badge', badge.challengeId);
      await navigator.clipboard.writeText(url.toString());
      toast.success('Badge link copied');
    } catch { toast.error('Could not copy the link. Please try again.'); }
  };
  return createPortal(<div className="challenge-badge-overlay">
    <div className="challenge-badge-backdrop" onClick={onClose} aria-hidden="true" />
    <div ref={dialog} className="challenge-badge-dialog" role="dialog" aria-modal="true" tabIndex={-1} aria-labelledby="challenge-badge-dialog-title" aria-describedby="challenge-badge-dialog-owner">
      <header className="challenge-badge-dialog-header"><div><h2 id="challenge-badge-dialog-title">Challenge badge</h2><p id="challenge-badge-dialog-owner">Earned by @{username}</p></div><button className="icon-button" onClick={onClose} aria-label="Close badge"><X size={19} /></button></header>
      <div className="challenge-badge-dialog-body">
        <div className="challenge-badge-stage"><ChallengeBadgeMark category={badge.category} username={username} /></div>
        <div className="challenge-badge-earned"><CheckCircle2 size={15} aria-hidden="true" />Challenge completed</div>
        <h3>{badge.title}</h3>
        <dl className="challenge-badge-facts"><div><dt>Category</dt><dd>{badgeDesign(badge.category).label}</dd></div><div><dt>Difficulty</dt><dd className="capitalize">{badge.difficulty || 'Not specified'}</dd></div><div><dt>Points earned</dt><dd>{badge.points.toLocaleString()} pts</dd></div><div><dt>Completed</dt><dd>{badge.earnedAt ? safeDate(badge.earnedAt) : 'Date not recorded'}</dd></div></dl>
        <div className="challenge-badge-dialog-actions"><button className="btn-primary" disabled={downloading} onClick={download}><Download size={16} />{downloading ? 'Preparing badge…' : 'Download badge'}</button>{isPublic && <button className="btn-outline" onClick={copyLink}><Copy size={15} />Copy badge link</button>}</div>
        {showProfileLink && <Link className="challenge-badge-profile-link" to="/profile?tab=badges" onClick={onClose}>View my badge collection</Link>}
      </div>
      <footer className="challenge-badge-dialog-footer"><span>Fsociety PK · Earned through practice</span><button className="btn-ghost" onClick={onClose}>Done</button></footer>
    </div>
  </div>, document.body);
}
