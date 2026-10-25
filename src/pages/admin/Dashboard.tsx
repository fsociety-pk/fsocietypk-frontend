import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Flag, Clock, Send, ArrowUpRight, BookOpen, BarChart3, Settings } from 'lucide-react';
import { adminService } from '../../services/adminService';
import PageState from '../../components/common/PageState';

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin-stats'], queryFn: adminService.getStats, select: r => r.data });
  return <div>
    <div className="page-heading"><div><span className="eyebrow">Admin workspace</span><h1>Admin overview</h1><p>Review submissions and manage the community.</p></div></div>
    {isLoading ? <PageState loading /> : isError ? <PageState title="Platform statistics could not be loaded" retry={() => refetch()} /> : <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-10">{[
      { label: 'Community members', value: data?.totalUsers, icon: Users },
      { label: 'Challenges', value: data?.totalChallenges, icon: Flag },
      { label: 'Awaiting review', value: data?.pendingChallenges, icon: Clock },
      { label: 'Flag submissions', value: data?.totalSubmissions, icon: Send },
    ].map(({ label, value, icon: Icon }) => <div className="soft-panel" key={label}><Icon size={22} className="text-brand mb-4" /><strong className="text-3xl block">{(value ?? 0).toLocaleString()}</strong><span className="text-xs text-text-muted">{label}</span></div>)}</div>}
    <div className="section-title"><h2>Manage the platform</h2></div>
    <div className="action-grid">{[
      { to: '/admin/challenges', title: 'Review challenges', text: 'Check difficulty, clarity, and flags before publishing.', icon: Flag },
      { to: '/admin/reviews', title: 'Community contributions', text: 'Review pending writeups and learning resources.', icon: BookOpen },
      { to: '/admin/users', title: 'Manage members', text: 'Find members and manage their account access.', icon: Users },
      { to: '/admin/analytics', title: 'Understand activity', text: 'See real platform trends and category performance.', icon: BarChart3 },
      { to: '/admin/projects', title: 'Showcase projects', text: 'Curate the tools your community is building.', icon: Send },
      { to: '/admin/settings', title: 'Keep everyone informed', text: 'Manage announcements and community settings.', icon: Settings },
    ].map(({ to, title, text, icon: Icon }) => <Link className="action-card" key={to} to={to}><div className="flex justify-between text-brand"><Icon size={23} /><ArrowUpRight size={17} /></div><h3>{title}</h3><p>{text}</p></Link>)}</div>
  </div>;
}
