import type { CSSProperties } from 'react';
import { Github, Linkedin, Instagram, Globe, Lock, MapPin, Calendar, ArrowUpRight, Fingerprint, Flag, Zap, Trophy, Layers, TerminalSquare, Pencil } from 'lucide-react';
import type { UserProfile } from '../../services/userService';
import { safeDate } from '../../utils/profileFormat';
import AnimatedUsername from './AnimatedUsername';
import MemberAvatar from './MemberAvatar';
import ProfileLevel from './ProfileLevel';
import { memberLevel } from '../../utils/memberLevel';
import '../../styles/profile-refresh.css';

export default function ProfileIdentity({ profile, onEdit, editing = false }: { profile: UserProfile; onEdit?: () => void; editing?: boolean }) {
  const { score, level } = memberLevel(profile.score);
  const stats = [
    { label: 'Challenges solved', value: profile.solvedChallenges?.length || 0, icon: Flag },
    { label: 'Total points', value: score.toLocaleString(), icon: Zap },
    { label: 'Global rank', value: profile.rank ? `#${profile.rank}` : '—', icon: Trophy },
    { label: 'Current level', value: level, icon: Layers },
  ];
  return <div className="profile-summary">
    <section className="profile-banner" aria-label="Member identity">
      <div className="profile-terminal-bar">
        <span><TerminalSquare size={16} aria-hidden="true" />fsociety<span aria-hidden="true">/</span>members</span>
        <div className="profile-header-actions"><span className="profile-terminal-edition">CTF COMMUNITY</span>{onEdit && <button id="profile-edit-action" type="button" className="profile-edit-action" onClick={onEdit} aria-controls="panel-edit" aria-expanded={editing}><Pencil size={14} aria-hidden="true" />Edit profile</button>}</div>
      </div>
      <div className="profile-banner-main">
        <div className="profile-identity">
          <div className="profile-portrait">
            <div className="profile-avatar-frame">
              <div className="profile-avatar"><MemberAvatar src={profile.avatar} username={profile.username} /></div>
              <span className="profile-avatar-scan" aria-hidden="true" />
            </div>
            <span className="profile-portrait-caption" aria-hidden="true"><Fingerprint size={12} />FSOCIETY PK</span>
          </div>
          <div className="profile-identity-copy">
            <div className="profile-command" aria-hidden="true"><span>❯</span> whoami</div>
            <AnimatedUsername username={profile.username} />
            <span className="profile-member-role"><Fingerprint size={14} aria-hidden="true" />{profile.role === 'admin' ? 'Community admin' : 'Community member'}</span>
            <p className={`profile-bio${profile.bio ? '' : ' profile-bio-empty'}`}>{profile.bio || 'No bio yet. The solves tell the story.'}</p>
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
        <ProfileLevel score={score} />
      </div>
      <div className="profile-meta">
        {profile.country && <span><MapPin size={13} aria-hidden="true" />{profile.country}</span>}
        <span><Calendar size={13} aria-hidden="true" />Joined {safeDate(profile.createdAt)}</span>
        <span>{profile.isProfilePublic ? <Globe size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />}{profile.isProfilePublic ? 'Public profile' : 'Private profile'}</span>
      </div>
    </section>
    <div className="stats-strip profile-stat-strip" aria-label="Member statistics">
      {stats.map(({ label, value, icon: Icon }, i) => <div className="profile-stat" key={label} style={{ '--profile-stat-delay': `${i * 55}ms` } as CSSProperties}>
        <div className="profile-stat-value"><strong>{value}</strong><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></div><span>{label}</span>
      </div>)}
    </div>
  </div>;
}
