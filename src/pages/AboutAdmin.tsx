import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Globe, Linkedin, ShieldCheck, User } from 'lucide-react';
import { adminProfileService } from '../services/adminProfileService';
import { useAuthStore } from '../store/authStore';
import PageHeading from '../components/common/PageHeading';
import PageState from '../components/common/PageState';

export default function AboutAdmin() {
  const user = useAuthStore(state => state.user);
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => adminProfileService.getProfile(),
    select: response => response.data,
  });
  const links = [
    { label: 'GitHub', icon: Github, url: profile?.links?.github },
    { label: 'LinkedIn', icon: Linkedin, url: profile?.links?.linkedin },
    { label: 'Website', icon: Globe, url: profile?.links?.portfolio },
  ].filter(link => link.url);
  return <div className="form-page">
    <PageHeading eyebrow="Meet the community" title="About the admin" description="The person behind Fsociety PK." />
    {isLoading ? <PageState loading /> : isError ? <PageState title="Could not load this profile" retry={() => refetch()} /> : !profile?.name ? <div className="soft-panel p-8 text-center">
      <PageState title="No admin profile yet" description={user?.role === 'admin' ? 'Add your name, bio, and links to introduce yourself to the community.' : 'The admin has not added a profile yet. Check back soon.'} />
      {user?.role === 'admin' && <Link className="btn-primary" to="/admin/profile">Create profile</Link>}
    </div> : <article className="soft-panel p-6 md:p-10">
      <div className="flex flex-col sm:flex-row gap-7 items-start">
        <div className="w-28 h-28 shrink-0 rounded-2xl border border-surface-border overflow-hidden bg-background-elevated flex items-center justify-center">
          {profile.profileImage ? <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" /> : <User size={38} className="text-text-muted" />}
        </div>
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 text-sm text-brand"><ShieldCheck size={16} />Community admin</span>
          <h2 className="text-3xl font-semibold mt-3 mb-4">{profile.name}</h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{profile.bio || 'This admin has not added a bio yet.'}</p>
          <div className="flex flex-wrap gap-3 mt-6">{links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-outline"><link.icon size={16} />{link.label}<ExternalLink size={13} /></a>)}</div>
        </div>
      </div>
      {!!profile.socialLinks?.length && <div className="grid sm:grid-cols-2 gap-3 border-t border-surface-border mt-8 pt-6">{profile.socialLinks.map((link, index) => <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-outline justify-between">{link.platform}<ExternalLink size={16} /></a>)}</div>}
    </article>}
  </div>;
}
