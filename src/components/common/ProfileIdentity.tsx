import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Instagram, Globe, Lock, MapPin, Calendar, ArrowUpRight, Fingerprint, Flag, Zap, Trophy, Layers } from 'lucide-react';
import type { UserProfile } from '../../services/userService';
import { safeDate } from '../../utils/profileFormat';
import AnimatedUsername from './AnimatedUsername';
import '../../styles/profile-refresh.css';

export default function ProfileIdentity({ profile, avatar }: { profile: UserProfile; avatar?: ReactNode }) {
  const score = Math.max(0, Number(profile.score) || 0);
  const level = Math.floor(score / 1000) + 1;
  const levelPoints = score % 1000;
  const stats = [
    { label: 'Challenges solved', value: profile.solvedChallenges?.length || 0, icon: Flag },
    { label: 'Total points', value: score.toLocaleString(), icon: Zap },
    { label: 'Global rank', value: profile.rank ? `#${profile.rank}` : '—', icon: Trophy },
    { label: 'Current level', value: level, icon: Layers },
  ];
  return <div className="profile-summary">
    <section className="profile-banner" aria-label="Member identity">
      <div className="profile-banner-main">
        <div className="profile-identity">
          <div className="profile-avatar-frame">
            {avatar || <div className="profile-avatar">{profile.avatar ? <img src={profile.avatar} alt={profile.username} /> : profile.username?.[0]?.toUpperCase()}</div>}
            <span className="profile-avatar-scan" aria-hidden="true" />
          </div>
          <div className="profile-identity-copy">
            <AnimatedUsername username={profile.username} />
            <span className="profile-member-role"><Fingerprint size={14} aria-hidden="true" />{profile.role === 'admin' ? 'Community admin' : 'Community member'}</span>
            <p className="profile-bio">{profile.bio || 'This member has not added a bio yet.'}</p>
            <div className="profile-socials">
              {[
                { key: 'github' as const, label: 'GitHub', icon: Github },
                { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
                { key: 'instagram' as const, label: 'Instagram', icon: Instagram },
              ].map(({ key, label, icon: Icon }) => {
                const url = profile.socialLinks?.[key];
                return url && /^https?:\/\//i.test(url) ? <a key={key} href={url} target="_blank" rel="noopener noreferrer"><Icon size={15} aria-hidden="true" />{label}<ArrowUpRight size={12} aria-hidden="true" /></a> : null;
              })}
            </div>
          </div>
        </div>
        <div className="profile-level-console" aria-label="Level progress">
          <div className="profile-level-title"><Layers size={18} aria-hidden="true" /><span>Level <strong>{String(level).padStart(2, '0')}</strong></span></div>
          <div className="profile-level-facts"><span>Next level</span><span>{levelPoints.toLocaleString()} / 1,000 pts</span></div>
          <div className="profile-level-track" role="progressbar" aria-label={`Progress to level ${level + 1}`} aria-valuemin={0} aria-valuemax={1000} aria-valuenow={levelPoints}><span style={{ width: `${levelPoints / 10}%` }} /></div>
          <p>{(1000 - levelPoints).toLocaleString()} points to level {level + 1}</p>
          <Link to="/challenges">Keep solving <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="profile-meta">
        {profile.country && <span><MapPin size={13} aria-hidden="true" />{profile.country}</span>}
        <span><Calendar size={13} aria-hidden="true" />Joined {safeDate(profile.createdAt)}</span>
        <span>{profile.isProfilePublic ? <Globe size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />}{profile.isProfilePublic ? 'Public profile' : 'Private profile'}</span>
      </div>
    </section>
    <div className="stats-strip profile-stat-strip" aria-label="Member statistics">
      {stats.map(({ label, value, icon: Icon }, i) => <div className="profile-stat" key={label} style={{ '--profile-stat-delay': `${i * 55}ms` } as React.CSSProperties}>
        <div className="profile-stat-value"><strong>{value}</strong><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></div><span>{label}</span>
      </div>)}
    </div>
  </div>;
}
