import { useState } from 'react';
import { Eye, EyeOff, Flag, ShieldCheck } from 'lucide-react';
import { adminService, type AdminFlagData } from '../../services/adminService';

export default function AdminChallengeFlags({ id, canWrite }: { id: string; canWrite: boolean }) {
  const [data, setData] = useState<AdminFlagData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originals, setOriginals] = useState('');
  const reveal = async () => {
    setLoading(true); setError('');
    try { setData((await adminService.getChallengeFlags(id)).data); }
    catch (err: any) { setError(err.response?.data?.message || 'Flags could not be loaded.'); }
    finally { setLoading(false); }
  };
  const restore = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try { await adminService.restoreChallengeFlags(id, originals.split('\n').map(value => value.trim()).filter(Boolean)); setOriginals(''); setData((await adminService.getChallengeFlags(id)).data); }
    catch (err: any) { setError(err.response?.data?.message || 'Flag visibility could not be restored.'); }
    finally { setLoading(false); }
  };
  return <section className="admin-form-panel mt-6" aria-labelledby="admin-flags-title"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="admin-flags-title" className="flex gap-2 items-center"><Flag size={18} />Challenge flags</h2><button className="btn-outline" disabled={loading} onClick={() => { if (data) { setData(null); setOriginals(''); setError(''); } else void reveal(); }}>{data ? <EyeOff size={16} /> : <Eye size={16} />}{loading ? 'Loading…' : data ? 'Hide flags' : 'Show flags'}</button></div>
    <p className="text-sm text-text-muted mt-3"><ShieldCheck size={14} className="inline mr-1" />Visible only to staff with challenge access.</p>
    {error && <p role="alert" className="admin-inline-error mt-3">{error}</p>}
    {data?.flags && <ol className="admin-flag-list">{data.flags.map(flag => <li key={flag.sequence}><span>Flag {flag.sequence}</span><code>{flag.value}</code></li>)}</ol>}
    {data && !data.recoverable && <div className="mt-4"><p className="text-sm text-text-muted">These {data.totalFlags} existing flag(s) were saved as one-way hashes. Re-enter their original values to make them visible here. Solves and scores stay intact.</p>{canWrite && <form className="mt-4" onSubmit={restore}><div className="admin-field"><label htmlFor="original-flags">Existing flags, in sequence, one per line</label><textarea id="original-flags" className="input" value={originals} onChange={event => setOriginals(event.target.value)} autoComplete="off" spellCheck={false} required /></div><button className="btn-primary" disabled={loading}>Verify & restore visibility</button></form>}</div>}
  </section>;
}
