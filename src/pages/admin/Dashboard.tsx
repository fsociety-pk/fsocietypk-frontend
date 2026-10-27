import { hasPermission } from '../../utils/roles';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, BookOpen, ChevronRight, Flag, Library, RefreshCw, Send, Users } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { adminNavigation } from '../../components/layout/adminNavigation';
import CyberLoader from '../../components/common/CyberLoader';
import PageState from '../../components/common/PageState';

function ActivityTrend({ data }: { data: { date: string; solves: number }[] }) {
  const points = data.slice(-14);
  if (!points.some(point => point.solves > 0)) return <div className="admin-trend-empty">Completed challenge solves will appear here as members make progress.</div>;
  const maximum = Math.max(...points.map(point => point.solves), 1);
  const plot = points.map((point, index) => `${index / Math.max(points.length - 1, 1) * 400},${130 - point.solves / maximum * 110}`).join(' ');
  return <figure className="admin-trend"><svg viewBox="0 0 400 144" role="img" aria-label={`Daily completed solves over ${points.length} days: ${points.map(p => `${p.date}: ${p.solves}`).join(', ')}`}><path d="M0 20H400 M0 75H400 M0 130H400" fill="none" stroke="rgb(var(--line))" strokeDasharray="3 5" /><polyline points={plot} fill="none" stroke="rgb(var(--brand))" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg><figcaption><span>{points[0]?.date.slice(5)}</span><span>{points[points.length - 1]?.date.slice(5)}</span></figcaption></figure>;
}

export default function AdminDashboard() {
  const role = useAuthStore(state => state.user?.role);
  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: adminService.getStats, select: r => r.data });
  const analytics = useQuery({ queryKey: ['admin-analytics'], queryFn: adminService.getAnalytics, enabled: hasPermission(role, 'analytics'), select: r => r.data });
  const pending = useQuery({ queryKey: ['admin-challenges', 'pending'], queryFn: () => adminService.getChallenges('pending'), enabled: hasPermission(role, 'challenges.read'), select: r => r.data });
  const refresh = () => { void Promise.allSettled([stats.refetch(), ...(hasPermission(role, 'analytics') ? [analytics.refetch()] : []), ...(hasPermission(role, 'challenges.read') ? [pending.refetch()] : [])]); };
  const reviewTotal = (stats.data?.pendingChallenges ?? 0) + (stats.data?.pendingWriteups ?? 0) + (stats.data?.pendingResources ?? 0);
  return <div>
    <div className="admin-page-heading"><div><h1>Platform overview</h1><p>A clear view of your community. Everything you need to keep it moving.</p></div><button className="btn-outline" disabled={stats.isFetching || analytics.isFetching || pending.isFetching} onClick={refresh}><RefreshCw size={15} />Refresh</button></div>
    {stats.isLoading ? <PageState loading /> : stats.isError ? <PageState title="Platform statistics could not be loaded" retry={() => stats.refetch()} /> : <div className="admin-stat-row">{[
      { label: 'Community members', value: stats.data?.totalUsers, note: 'Member accounts only', icon: Users, to: '/admin/users' },
      { label: 'Published challenges', value: stats.data?.totalChallenges, note: 'Approved for the community', icon: Flag, to: '/admin/challenges?status=approved' },
      { label: 'Awaiting review', value: reviewTotal, note: 'Challenges, writeups & resources', icon: BookOpen, to: '/admin/reviews', review: true },
      { label: 'Flag submissions', value: stats.data?.totalSubmissions, note: 'Across all challenges', icon: Send, to: '/admin/analytics' },
    ].map(({ label, value, note, icon: Icon, review }) => <div className={`admin-stat ${review ? 'needs-review' : ''}`} key={label}><span className="admin-stat-label">{label}<Icon size={17} /></span><strong>{(value ?? 0).toLocaleString()}</strong><small>{note}</small></div>)}</div>}
    <div className="admin-overview-grid">
      {(hasPermission(role, 'reviews') || hasPermission(role, 'challenges.read')) && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Your review queue</h2><p>Thoughtful moderation keeps the community moving.</p></div><span className="admin-status-pill">{stats.isError ? 'Unavailable' : stats.isLoading ? 'Loading' : `${reviewTotal} pending`}</span></div>
        {stats.isError ? <div className="admin-empty">Review counts are unavailable. Refresh to try again.</div> : [
          { label: 'Challenges', text: 'Check flags, difficulty, and attachments', count: stats.data?.pendingChallenges, to: '/admin/challenges?status=pending', icon: Flag },
          { label: 'Writeups', text: 'Review walkthroughs and author feedback', count: stats.data?.pendingWriteups, to: '/admin/reviews?tab=writeups', icon: BookOpen },
          { label: 'Learning resources', text: 'Curate useful tools and references', count: stats.data?.pendingResources, to: '/admin/reviews?tab=resources', icon: Library },
        ].filter(item => hasPermission(role, item.label === 'Challenges' ? 'challenges.read' : 'reviews')).map(({ label, text, count, to, icon: Icon }) => <Link className="admin-queue-row" to={to} key={label}><span className="admin-queue-icon"><Icon size={18} /></span><div><strong>{label}</strong><small>{text}</small></div><span className="admin-queue-count">{stats.isLoading ? '—' : count ?? 0}</span><ChevronRight size={16} /></Link>)}
      </section>}
      {hasPermission(role, 'analytics') && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Learning in motion</h2><p>Completed solves over the last 14 days</p></div><Link to="/admin/analytics">Analytics <ArrowUpRight size={13} /></Link></div>
        {analytics.isLoading ? <CyberLoader compact title="Loading activity" description="Gathering recent community solves." /> : analytics.isError ? <div className="admin-empty">Activity could not be loaded.<button className="btn-ghost" onClick={() => analytics.refetch()}>Try again</button></div> : <><div className="admin-chart-summary">{analytics.data?.submissionTrend.slice(-14).reduce((sum, p) => sum + p.solves, 0).toLocaleString() ?? '0'}<span>completed challenges</span></div><ActivityTrend data={analytics.data?.submissionTrend ?? []} /></>}
      </section>}
    </div>
    {hasPermission(role, 'challenges.read') && <section className="admin-panel mb-6"><div className="admin-panel-heading"><div><h2>Next up for review</h2><p>The newest challenges waiting for a decision</p></div><Link to="/admin/challenges?status=pending">View queue <ArrowUpRight size={13} /></Link></div>
      {pending.isLoading ? <CyberLoader compact title="Loading the review queue" description="Checking for new challenge submissions." /> : pending.isError ? <div className="admin-empty">The queue could not be loaded.<button className="btn-ghost" onClick={() => pending.refetch()}>Try again</button></div> : !pending.data?.length ? <div className="admin-empty"><strong>You’re all caught up.</strong>New challenge submissions will appear here when they are ready for review.</div> : <div className="admin-review-list">{pending.data.slice(0, 4).map(challenge => <div className="admin-review-item" key={challenge._id}><div><strong>{challenge.title}</strong><small>{challenge.category} · {challenge.difficulty} · {new Date(challenge.createdAt).toLocaleDateString()}</small></div><span className="admin-status-pill">Pending review</span><Link className="btn-outline" to={`/admin/challenges/${challenge._id}`}>Review <ArrowUpRight size={13} /></Link></div>)}</div>}
    </section>}
    <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Every tool, one workspace</h2><p>Manage the content, people, and settings behind Fsociety PK.</p></div></div><div className="admin-tools">{adminNavigation.filter(item => item.to !== '/admin' && item.to !== '/admin/notifications' && (!item.permission || hasPermission(role, item.permission))).map(({ to, label, description, icon: Icon }) => <Link className="admin-tool" to={to} key={to}><Icon size={18} /><div><strong>{label}</strong><small>{description}</small></div><ArrowUpRight size={14} /></Link>)}</div></section>
    {stats.dataUpdatedAt > 0 && <p className="admin-updated">Updated at {new Date(stats.dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
  </div>;
}
