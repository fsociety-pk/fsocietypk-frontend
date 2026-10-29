import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, FileBadge, Users } from 'lucide-react';
import { teamService } from '../../services/teamService';
import { TEAM_ABOUT_URL } from '../../data/team';
import TeamProfileEditor from '../../components/admin/TeamProfileEditor';
import TeamCertificateManager from '../../components/admin/TeamCertificateManager';
import PageState from '../../components/common/PageState';
import '../../styles/team-manager.css';

export default function AboutTeamManager() {
  const [section, setSection] = useState<'profile' | 'certificates'>('profile');
  const profile = useQuery({ queryKey: ['admin-team-profile'], queryFn: teamService.getAdminProfile });
  return <div><div className="admin-page-heading"><div><h1>About team manager</h1><p>Manage your team page, CTF history, and certificates.</p></div><a className="btn-outline" href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer">View team page <ArrowUpRight size={16} /></a></div>
    <nav className="team-manager-tabs" aria-label="Team management sections"><button aria-pressed={section === 'profile'} onClick={() => setSection('profile')}><Users size={17} />Team details</button><button aria-pressed={section === 'certificates'} onClick={() => setSection('certificates')}><FileBadge size={17} />Certificates</button></nav>
    {section === 'certificates' ? <TeamCertificateManager /> : profile.isLoading ? <PageState loading /> : profile.isError || !profile.data ? <PageState title="Team details could not be loaded" retry={() => profile.refetch()} /> : <TeamProfileEditor key={profile.data.version} initial={profile.data} />}
  </div>;
}
