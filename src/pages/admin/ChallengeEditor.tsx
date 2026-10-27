import AdminChallengeFlags from '../../components/admin/AdminChallengeFlags';
import { hasPermission } from '../../utils/roles';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Download, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, type AdminChallengeUpdate } from '../../services/adminService';
import { API_BASE_URL } from '../../services/apiConfig';
import { CHALLENGE_CATEGORIES, CATEGORY_LABELS } from '../../utils/categories';
import PageState from '../../components/common/PageState';

export default function ChallengeEditor() {
  const role = useAuthStore(state => state.user?.role);
  const canWrite = hasPermission(role, 'challenges.write');
  const canReview = hasPermission(role, 'challenges.review');
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-challenge', id], queryFn: () => adminService.getChallenge(id!), select: r => r.data });
  const [form, setForm] = useState({ title: '', description: '', challengeUrl: '', category: 'web', difficulty: 'easy', hints: '', flags: '' });
  const [error, setError] = useState('');
  useEffect(() => { if (query.data) { const challenge = query.data; setForm({ title: challenge.title, description: challenge.description, challengeUrl: challenge.challengeUrl || '', category: challenge.category, difficulty: challenge.difficulty, hints: challenge.hints.map(hint => hint.content).join('\n'), flags: '' }); } }, [query.data]);
  const save = useMutation({ mutationFn: (payload: AdminChallengeUpdate) => adminService.updateChallenge(id!, payload), onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-challenge', id] }); void client.invalidateQueries({ queryKey: ['admin-challenges'] }); void client.invalidateQueries({ queryKey: ['challenges'] }); toast.success('Challenge saved.'); setError(''); }, onError: (err: any) => setError(err.response?.data?.message || 'Could not save the challenge.') });
  const publish = useMutation({ mutationFn: () => adminService.updateChallengeStatus(id!, 'approved'), onSuccess: response => { void client.invalidateQueries({ queryKey: ['admin-challenge', id] }); void client.invalidateQueries({ queryKey: ['admin-challenges'] }); void client.invalidateQueries({ queryKey: ['admin-stats'] }); if (response.data.emailsQueued === false) setError('Published, but emails could not be queued. Publish again from the challenge list to retry.'); else toast.success('Challenge published.'); }, onError: (err: any) => setError(err.response?.data?.message || 'Could not publish the challenge.') });
  const submit = (event: FormEvent) => {
    event.preventDefault(); if (!canWrite) return; setError('');
    const payload: AdminChallengeUpdate = { title: form.title.trim(), description: form.description.trim(), challengeUrl: form.challengeUrl.trim(), category: form.category as AdminChallengeUpdate['category'] };
    if (form.difficulty !== query.data?.difficulty) payload.difficulty = form.difficulty as AdminChallengeUpdate['difficulty'];
    // Existing hint costs remain intact unless their text is explicitly edited.
    if (form.hints !== query.data?.hints.map(h => h.content).join('\n')) payload.hints = form.hints.split('\n').map(content => content.trim()).filter(Boolean).map(content => ({ content, cost: 0 }));
    if (form.flags.trim()) {
      const flags = form.flags.split('\n').map(value => value.trim()).filter(Boolean);
      if (flags.length > 20 || flags.some(flag => !/^fsociety\{.+\}$/i.test(flag) || flag.length > 500)) { setError('Use up to 20 flags, one per line, in fsociety{...} format.'); return; }
      payload.flags = flags.map((value, index) => ({ sequence: index + 1, value }));
    }
    save.mutate(payload);
  };
  if (query.isLoading) return <PageState loading />;
  if (query.isError) return <PageState title="Challenge could not be loaded" retry={() => query.refetch()} />;
  return <div><Link to="/admin/challenges" className="inline-flex items-center gap-2 text-sm text-text-muted mb-6"><ArrowLeft size={15} />All challenges</Link><div className="admin-page-heading"><div><h1>Review & edit challenge</h1><p>Inspect the content, manage publication, and keep member progress intact.</p></div><span className="admin-status-pill">{query.data?.status}</span></div>
    {error && <p className="admin-inline-error" role="alert">{error}</p>}
    <div className="admin-notice"><ShieldCheck size={18} /><p>Stored flags are kept private. Replacing flags or changing difficulty is blocked once a member has a correct submission.</p></div>
    <form className="admin-form-panel" onSubmit={submit}>
      <div className="admin-field"><label htmlFor="challenge-title">Title</label><input className="input" id="challenge-title" readOnly={!canWrite} value={form.title} maxLength={120} required onChange={e => setForm({ ...form, title: e.target.value })} /></div>
      <div className="admin-field"><label htmlFor="challenge-description">Challenge description</label><textarea className="input" id="challenge-description" rows={8} readOnly={!canWrite} value={form.description} maxLength={12000} required onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <div className="admin-form-grid"><div className="admin-field"><label htmlFor="edit-category">Category</label><select className="input" id="edit-category" disabled={!canWrite} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CHALLENGE_CATEGORIES.map(category => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}</select></div><div className="admin-field"><label htmlFor="edit-difficulty">Difficulty</label><select className="input" id="edit-difficulty" disabled={!canWrite} value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>{['easy', 'medium', 'hard', 'insane'].map(value => <option key={value}>{value}</option>)}</select></div></div>
      <div className="admin-field"><label htmlFor="edit-challenge-url">Challenge URL</label><input className="input" type="url" id="edit-challenge-url" readOnly={!canWrite} value={form.challengeUrl} maxLength={2048} onChange={e => setForm({ ...form, challengeUrl: e.target.value })} placeholder="https://" /></div>
      <div className="admin-field"><label htmlFor="edit-hints">Hints, one per line</label><textarea className="input" id="edit-hints" readOnly={!canWrite} value={form.hints} onChange={e => setForm({ ...form, hints: e.target.value })} /><small>Editing this list makes the updated hints free. Leave it unchanged to preserve existing costs.</small></div>
      {canWrite && <div className="admin-field"><label htmlFor="edit-flags">Replacement flags, one per line</label><textarea className="input" id="edit-flags" value={form.flags} onChange={e => setForm({ ...form, flags: e.target.value })} placeholder="fsociety{new_flag}" autoComplete="off" spellCheck={false} /><small>Optional. Leave empty to keep the current {query.data?.totalFlags || 1} flag(s). Replacement flags are stored securely.</small></div>}
      <div className="flex flex-wrap gap-3">{canWrite && <button className="btn-primary" disabled={save.isPending || publish.isPending}><Save size={16} />{save.isPending ? 'Saving…' : 'Save changes'}</button>}{canReview && <button className="btn-outline" type="button" disabled={save.isPending || publish.isPending} onClick={() => publish.mutate()}><Check size={16} />{query.data?.status === 'approved' ? 'Queue launch emails' : 'Publish saved version'}</button>}</div>
    </form>
    {id && <AdminChallengeFlags key={id + query.data?.updatedAt} id={id} canWrite={canWrite} />}
    {!!query.data?.attachments.length && <section className="admin-form-panel mt-6"><h2>Challenge attachments</h2><p>Download and inspect the submitted files before publishing.</p><div className="flex flex-wrap gap-3">{query.data.attachments.map((file, index) => typeof file !== 'string' && file._id ? <a className="btn-outline" key={file._id} href={`${API_BASE_URL}/challenges/${id}/attachments/${file._id}/download`}><Download size={15} />{file.originalName}</a> : typeof file === 'string' && /^https?:\/\//i.test(file) ? <a className="btn-outline" key={index} href={file} target="_blank" rel="noreferrer">Attachment {index + 1}</a> : null)}</div></section>}
  </div>;
}
