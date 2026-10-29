import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileBadge, Plus, Pencil, Save, Trash2, ArrowUpRight, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { teamService, type TeamCertificate, type TeamCertificateInput } from '../../services/teamService';
import PageState from '../common/PageState';
import { TeamField, teamError } from './TeamProfileEditor';

const blank: TeamCertificateInput = { title: '', eventDate: '', placement: '', description: '', eventUrl: '', isPublished: false };
function CertificateEditor({ certificate, onClose }: { certificate: TeamCertificate | null; onClose: () => void }) {
  const [details, setDetails] = useState<TeamCertificateInput>(certificate ? { title: certificate.title, eventDate: certificate.eventDate, placement: certificate.placement, description: certificate.description, eventUrl: certificate.eventUrl, isPublished: certificate.isPublished } : blank);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const client = useQueryClient();
  useEffect(() => {
    if (!file?.type.startsWith('image/')) { setPreview(''); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const save = useMutation({ mutationFn: teamService.saveCertificate, onSuccess: async () => { await client.invalidateQueries({ queryKey: ['admin-team-certificates'] }); toast.success('Certificate saved.'); onClose(); }, onError: error => setError(teamError(error, 'Certificate could not be saved. Your changes are still here.')) });
  const submit = (event: FormEvent) => { event.preventDefault(); setError(''); if (!certificate && !file) { setError('Choose a certificate file.'); return; } save.mutate({ id: certificate?.id, version: certificate?.version, details, file }); };
  return <form className="admin-form-panel team-certificate-editor" onSubmit={submit}>
    <h2>{certificate ? 'Edit certificate' : 'Add a CTF certificate'}</h2>
    {error && <p className="admin-inline-error" role="alert">{error}</p>}
    <fieldset disabled={save.isPending}>
      <div className="team-manager-fields"><TeamField id="certificate-title" label="CTF / event name" value={details.title} onChange={title => setDetails({ ...details, title })} required maxLength={160} /><TeamField id="certificate-date" label="Event date" value={details.eventDate} onChange={eventDate => setDetails({ ...details, eventDate })} maxLength={10} /><TeamField id="certificate-placement" label="Placement or award (optional)" value={details.placement} onChange={placement => setDetails({ ...details, placement })} maxLength={100} /><TeamField id="certificate-event-url" label="Event or scoreboard URL (HTTPS, optional)" type="url" value={details.eventUrl} onChange={eventUrl => setDetails({ ...details, eventUrl })} maxLength={2048} /></div>
      <p className="admin-help">Event date is optional. Use YYYY, YYYY-MM or YYYY-MM-DD to match the date you know.</p>
      <TeamField id="certificate-description" label="About this CTF (optional)" value={details.description} onChange={description => setDetails({ ...details, description })} multiline />
      <div className="team-upload-field"><label htmlFor="team-certificate-file"><Upload size={18} />{certificate ? 'Replace certificate (optional)' : 'Certificate file'}</label><input id="team-certificate-file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required={!certificate} onChange={event => { const selected = event.target.files?.[0]; if (selected && selected.size > 8 * 1024 * 1024) { setError('Choose a certificate that is 8 MB or smaller.'); event.target.value = ''; setFile(undefined); return; } setError(''); setFile(selected); }} /><p className="admin-help">PDF, PNG, JPG or WebP, up to 8 MB. Certificates and scoreboard screenshots appear on the public book shelf.</p>{preview ? <img className="team-upload-preview" src={preview} alt="Selected certificate preview" /> : certificate && !file ? <a href={teamService.fileUrl(certificate.id, true)} target="_blank" rel="noopener noreferrer">Current file: {certificate.certificate.name} <ArrowUpRight size={14} /></a> : file && <p>{file.name}</p>}</div>
      <label className="team-publish-toggle"><input type="checkbox" checked={details.isPublished} onChange={event => setDetails({ ...details, isPublished: event.target.checked })} /><span>Publish on the public team page<small>Keep this off to save a private draft.</small></span></label>
      <div className="team-manager-actions"><button className="btn-primary" type="submit"><Save size={16} />{save.isPending ? 'Uploading and saving…' : 'Save certificate'}</button><button className="btn-outline" type="button" onClick={onClose}>Cancel</button></div>
    </fieldset>
  </form>;
}
export default function TeamCertificateManager() {
  const [editing, setEditing] = useState<TeamCertificate | 'new' | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-team-certificates', page, status], queryFn: () => teamService.listAdminCertificates(page, status) });
  const remove = useMutation({ mutationFn: teamService.deleteCertificate, onSuccess: async () => { if (page > 1 && query.data?.certificates.length === 1) setPage(page - 1); await client.invalidateQueries({ queryKey: ['admin-team-certificates'] }); toast.success('Certificate deleted.'); }, onError: error => setError(teamError(error, 'Certificate could not be deleted.')) });
  return <div className="team-certificate-manager">
    <div className="team-manager-section-heading"><div><h2>CTF certificates</h2><p className="admin-help">Upload certificates, edit event details, and choose what visitors can see.</p></div><button className="btn-primary" onClick={() => { setEditing('new'); setError(''); }} disabled={!!editing}><Plus size={16} />Add certificate</button></div>
    {error && <p className="admin-inline-error" role="alert">{error}</p>}
    {editing && <CertificateEditor key={editing === 'new' ? 'new' : editing.id} certificate={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    <label className="team-admin-filter">Show<select className="input" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">All certificates</option><option value="published">Published</option><option value="draft">Drafts</option></select></label>
    {query.isLoading ? <PageState loading /> : query.isError ? <PageState title="Certificates could not be loaded" retry={() => query.refetch()} /> : !query.data?.certificates.length ? <div className="admin-form-panel admin-empty"><FileBadge size={32} /><h3>No certificates here yet.</h3><p>Add a CTF certificate to start your team’s competition history.</p></div> : <div className="team-admin-certificate-list">{query.data.certificates.map(record => <article className="admin-form-panel team-admin-certificate" key={`${record.id}-${record.version}`}>
      <a className="team-admin-certificate-preview" href={teamService.fileUrl(record.id, true)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${record.title} certificate`}>{record.certificate.contentType.startsWith('image/') ? <img src={teamService.fileUrl(record.id, true)} alt={`${record.title} certificate`} loading="lazy" /> : <FileBadge size={40} />}</a>
      <div className="team-admin-certificate-details"><div className="team-manager-section-heading"><h3>{record.title}</h3><span className={`team-publish-status ${record.isPublished ? 'published' : ''}`}>{record.isPublished ? 'Published' : 'Draft'}</span></div><p>{record.eventDate || 'Undated'}{record.placement ? ` · ${record.placement}` : ''}</p><small>{record.certificate.name} · {(record.certificate.size / 1024 / 1024).toFixed(1)} MB</small><div className="team-manager-actions"><button className="btn-outline" disabled={!!editing} onClick={() => { setEditing(record); setError(''); window.scrollTo({ top: 0, behavior: 'instant' }); }}><Pencil size={14} />Edit</button><a className="btn-outline" href={teamService.fileUrl(record.id, true)} target="_blank" rel="noopener noreferrer">Open certificate <ArrowUpRight size={14} /></a><button className="btn-ghost" disabled={remove.isPending} onClick={() => { if (window.confirm(`Delete “${record.title}” and its certificate file?`)) remove.mutate(record); }}><Trash2 size={14} />Delete</button></div></div>
    </article>)}</div>}
    {query.data && query.data.pagination.totalPages > 1 && <nav className="team-manager-actions" aria-label="Admin certificate pages"><button className="btn-outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {query.data.pagination.totalPages}</span><button className="btn-outline" disabled={page >= query.data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button></nav>}
  </div>;
}
