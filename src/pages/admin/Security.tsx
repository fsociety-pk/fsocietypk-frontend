import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerSchema } from '../../types';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';

export default function AdminSecurity() {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const client = useQueryClient();
  const navigate = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return; setError('');
    const parsed = registerSchema.shape.password.safeParse(passwords.newPassword);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message || 'Choose a stronger password.'); return; }
    if (passwords.newPassword !== passwords.confirmPassword) { setError('Your new passwords do not match.'); return; }
    setBusy(true);
    try { await userService.changePassword(passwords); client.clear(); logout(); navigate('/login', { replace: true }); toast.success('Password updated. Sign in again to start a new session.'); }
    catch (err: any) { setError(err.response?.data?.message || 'Could not update your password. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div><div className="admin-page-heading"><div><h1>Account security</h1><p>Protect your staff account and control your access.</p></div></div><div className="admin-overview-grid"><section className="admin-form-panel"><h2>Change your password</h2><p>Changing your password signs out existing sessions, including this one.</p>{error && <p className="admin-inline-error" role="alert">{error}</p>}<form onSubmit={submit} aria-busy={busy}>{([
    ['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password'],
  ] as const).map(([name, label]) => <div className="admin-field" key={name}><label htmlFor={`security-${name}`}>{label}</label><input className="input" id={`security-${name}`} type={visible ? 'text' : 'password'} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} value={passwords[name]} required onChange={e => setPasswords({ ...passwords, [name]: e.target.value })} />{name === 'newPassword' && <small>Use 8 or more characters with uppercase, lowercase, a number, and a symbol. Maximum 72 bytes.</small>}</div>)}<button type="button" className="btn-ghost mb-5" onClick={() => setVisible(!visible)} aria-pressed={visible}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}{visible ? 'Hide passwords' : 'Show passwords'}</button><button className="btn-primary w-full" disabled={busy}><KeyRound size={16} />{busy ? 'Updating password…' : 'Update password & sign out'}</button></form></section><section className="admin-form-panel"><h2>Staff access</h2><p>Signed in as <strong>{user?.username}</strong>.</p><ul className="admin-security-facts"><li><ShieldCheck size={20} /><div>Server-enforced staff permissions<small>Administrative actions check the current account role on the server.</small></div></li><li><LockKeyhole size={20} /><div>Authenticated session required<small>Expired, revoked, and suspended accounts cannot use protected administration APIs.</small></div></li><li><KeyRound size={20} /><div>Password changes revoke sessions<small>Earlier sessions are rejected after your password changes.</small></div></li></ul></section></div></div>;
}
