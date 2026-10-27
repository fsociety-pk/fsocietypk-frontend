import AdminChallengeFlags from '../../components/admin/AdminChallengeFlags';
import { hasPermission } from '../../utils/roles';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Flag, Pencil, Plus, Radio, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import PageState from '../../components/common/PageState';

export default function ManageChallenges() {
  const role = useAuthStore(state => state.user?.role);
  const canWrite = hasPermission(role, 'challenges.write');
  const canReview = hasPermission(role, 'challenges.review');
  const [params, setParams] = useSearchParams();
  const status = ['pending', 'approved', 'rejected'].includes(params.get('status') || '') ? params.get('status')! : '';
  const [search, setSearch] = useState('');
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const client = useQueryClient();
  const challenges = useQuery({ queryKey: ['admin-challenges', status], queryFn: () => adminService.getChallenges(status), select: r => r.data });
  const refresh = () => { void client.invalidateQueries({ queryKey: ['admin-challenges'] }); void client.invalidateQueries({ queryKey: ['admin-stats'] }); };
  const mutation = useMutation({ mutationFn: async ({ id, action }: { id: string; action: string }) => {
    if (action === 'delete') return adminService.deleteChallenge(id);
    if (action === 'live' || action === 'ended') return adminService.updateChallengeLiveStatus(id, action);
    return adminService.updateChallengeStatus(id, action, action === 'rejected' ? reason.trim() : undefined);
  }, onSuccess: response => { refresh(); setRejecting(null); setReason(''); if (response.data?.emailsQueued === false) toast.error('Challenge published, but emails could not be queued. Publish again to retry.'); else toast.success('Challenge updated.'); }, onError: (error: any) => toast.error(error.response?.data?.message || 'Could not update this challenge.') });
  const filtered = challenges.data?.filter(challenge => challenge.title.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <div><div className="admin-page-heading"><div><h1>Challenges</h1><p>Create, review, and publish the experiences your community learns from.</p></div>{canWrite && <Link className="btn-primary" to="/admin/challenges/new"><Plus size={16} />New challenge</Link>}</div>
    <div className="admin-toolbar"><input className="input" type="search" aria-label="Search challenges" placeholder="Search challenges" value={search} onChange={event => setSearch(event.target.value)} /><label htmlFor="challenge-status">Status</label><select className="input" id="challenge-status" value={status} onChange={event => setParams(event.target.value ? { status: event.target.value } : {})}><option value="">All statuses</option><option value="pending">Pending review</option><option value="approved">Published</option><option value="rejected">Rejected</option></select></div>
    {challenges.isLoading ? <PageState loading /> : challenges.isError ? <PageState title="Challenges could not be loaded" retry={() => challenges.refetch()} /> : !filtered.length ? <div className="admin-panel admin-empty"><Flag size={24} className="mb-3 text-brand" /><strong>No challenges match this view.</strong>Create a challenge or choose a different filter.</div> : <div className="space-y-4">{filtered.map(challenge => <article className="admin-form-panel" key={challenge._id}>
      <div className="flex flex-wrap justify-between gap-4"><div className="min-w-0"><Link to={`/admin/challenges/${challenge._id}`} className="text-lg font-semibold break-words hover:text-brand">{challenge.title}</Link><p className="mt-2 text-xs text-text-muted">{challenge.category} · {challenge.difficulty} · {challenge.points} points · {new Date(challenge.createdAt).toLocaleDateString()}</p></div><span className="admin-status-pill self-start">{challenge.status === 'approved' ? challenge.liveStatus === 'ended' ? 'Ended' : 'Published' : challenge.status === 'pending' ? 'Pending review' : 'Rejected'}</span></div>
      {challenge.challengeUrl && /^https?:\/\//i.test(challenge.challengeUrl) && <a className="inline-flex items-center gap-2 text-sm text-brand underline underline-offset-4 mt-4 break-all" href={challenge.challengeUrl} target="_blank" rel="noopener noreferrer">Challenge URL: {challenge.challengeUrl}</a>}
      <div className="flex flex-wrap gap-2 mt-5"><Link className="btn-outline" to={`/admin/challenges/${challenge._id}`}><Pencil size={14} />{canWrite ? 'Review & edit' : 'Review challenge'}</Link>{canReview && challenge.status !== 'approved' && <button className="btn-primary" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: challenge._id, action: 'approved' })}><Check size={14} />Publish</button>}{canReview && challenge.status === 'pending' && <button className="btn-outline" disabled={mutation.isPending} onClick={() => { setRejecting(challenge._id); setReason(''); }}><X size={14} />Reject</button>}{canReview && challenge.status === 'approved' && <button className="btn-outline" disabled={mutation.isPending} title="Queue launch emails for members without an existing delivery record" onClick={() => mutation.mutate({ id: challenge._id, action: 'approved' })}>Queue launch emails</button>}{canReview && challenge.status === 'approved' && <button className="btn-outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: challenge._id, action: challenge.liveStatus === 'ended' ? 'live' : 'ended' })}><Radio size={14} />{challenge.liveStatus === 'ended' ? 'Reopen challenge' : 'End challenge'}</button>}{canWrite && <button className="btn-outline text-status-error" aria-label={`Delete ${challenge.title}`} disabled={mutation.isPending} onClick={() => { if (window.confirm(`Permanently delete “${challenge.title}” and its submissions?`)) mutation.mutate({ id: challenge._id, action: 'delete' }); }}><Trash2 size={14} />Delete</button>}</div>
      <AdminChallengeFlags key={challenge.updatedAt} id={challenge._id} canWrite={canWrite} />
      {rejecting === challenge._id && <form className="mt-5" onSubmit={event => { event.preventDefault(); mutation.mutate({ id: challenge._id, action: 'rejected' }); }}><div className="admin-field"><label htmlFor={`reason-${challenge._id}`}>Feedback for the author</label><textarea id={`reason-${challenge._id}`} className="input" value={reason} maxLength={2000} required onChange={event => setReason(event.target.value)} autoFocus /></div><div className="flex gap-3"><button className="btn-primary" disabled={mutation.isPending || !reason.trim()}>Reject with feedback</button><button className="btn-outline" type="button" onClick={() => setRejecting(null)}>Cancel</button></div></form>}
    </article>)}</div>}
  </div>;
}
