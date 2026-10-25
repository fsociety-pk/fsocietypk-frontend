import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Eye, EyeOff, Fingerprint, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { loginSchema, registerSchema, type IUser } from '../../types';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

const pendingKey = 'fsociety-pending-email';
type Pending = { registrationId: string; email: string; expiresAt: number; resendAt: number };
const readPending = (): Pending | null => {
  try { const value = JSON.parse(sessionStorage.getItem(pendingKey) || 'null'); return typeof value?.registrationId === 'string' && typeof value?.email === 'string' && value.expiresAt > Date.now() ? value : null; } catch { return null; }
};
const passwordRules = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: 'Uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Lowercase', test: (value: string) => /[a-z]/.test(value) },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
  { label: 'A symbol', test: (value: string) => /[^a-zA-Z0-9]/.test(value) },
];
const playfulPayload = (value: string) => /['"]\s*(?:or|and)\s+(?:['"]?\w+['"]?\s*=|true\b)|\bunion\s+(?:all\s+)?select\b|['"];?\s*;\s*(?:drop|delete|update|insert|alter)\s+/i.test(value);
export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const [values, setValues] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [pending, setPending] = useState<Pending | null>(() => signup ? readPending() : null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failure, setFailure] = useState('');
  const [playful, setPlayful] = useState(false);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  const client = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);
  const passed = passwordRules.filter(rule => rule.test(values.password)).length;
  const cooldown = pending ? Math.max(0, Math.ceil((pending.resendAt - now) / 1000)) : 0;
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [pending]);
  const savePending = (value: Pending | null) => {
    setPending(value);
    try { if (value) sessionStorage.setItem(pendingKey, JSON.stringify(value)); else sessionStorage.removeItem(pendingKey); } catch { /* Verification remains usable without storage. */ }
  };
  const finish = (user: IUser) => {
    savePending(null);
    client.clear();
    setUser(user);
    toast.success(signup ? 'Email verified. Welcome to the collective.' : 'Access granted. Welcome back.');
    const from = location.state?.from;
    const path = typeof from?.pathname === 'string' && from.pathname.startsWith('/') && !from.pathname.startsWith('//') ? from.pathname + (from.search || '') : '/dashboard';
    navigate(path, { replace: true });
  };
  const field = (name: keyof typeof values) => ({
    value: values[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues(current => ({ ...current, [name]: event.target.value }));
      setErrors(current => ({ ...current, [name]: undefined }));
    },
  });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setFailure(''); setPlayful(false);
    if (pending) {
      if (!/^\d{6}$/.test(code)) { setFailure('Enter the six-digit code from your email.'); return; }
      setBusy(true);
      try { finish((await authService.verifyEmail(pending.registrationId, code)).data.user); }
      catch (error: any) { setFailure(error.response?.data?.message || 'We could not verify that code. Please try again.'); }
      finally { setBusy(false); }
      return;
    }
    if (playfulPayload(values.username) || (signup && playfulPayload(values.email))) {
      setPlayful(true); setFailure('Nice try, little Bobby Tables. 😏 The login isn’t a CTF — save that payload for the challenges.'); return;
    }
    const parsed = (signup ? registerSchema : loginSchema).safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      parsed.error.issues.forEach(issue => { const key = issue.path[0] as keyof typeof values; if (!next[key]) next[key] = issue.message; });
      setErrors(next); return;
    }
    setBusy(true);
    try {
      if (signup) {
        const response = await authService.register(registerSchema.parse(values));
        const next = { registrationId: response.data.registrationId, email: values.email.trim(), expiresAt: Date.now() + response.data.expiresIn * 1000, resendAt: Date.now() + response.data.retryAfter * 1000 };
        savePending(next); setNow(Date.now()); setValues(current => ({ ...current, password: '' }));
        toast.success('Check your inbox. Your verification code is on its way.');
      } else finish((await authService.login(parsed.data)).data.user);
    } catch (error: any) {
      setPlayful(!!error.response?.data?.data?.isSQLInjection);
      setFailure(error.response?.data?.message || 'We couldn’t connect. Please try again.');
    } finally { setBusy(false); }
  };
  const resend = async () => {
    if (!pending || resending || cooldown) return;
    setResending(true); setFailure('');
    try {
      const response = await authService.resendOtp(pending.registrationId);
      savePending({ ...pending, resendAt: Date.now() + response.data.retryAfter * 1000, expiresAt: Date.now() + response.data.expiresIn * 1000 });
      setCode(''); setNow(Date.now()); toast.success('Fresh code sent. Use the newest email.');
    } catch (error: any) { setFailure(error.response?.data?.message || 'Could not resend the code. Please try again.'); }
    finally { setResending(false); }
  };
  return <div className={`auth-page access-page ${signup ? 'signup-mode' : 'login-mode'}`}>
    <aside className="access-art">
      <span className="eyebrow">FSOCIETY PK / COLLECTIVE ACCESS</span>
      <h2>Curiosity<br />is your<br /><span>credential.</span></h2>
      <div className={`identity-mark ${visible ? 'eyes-open' : ''}`} aria-hidden="true"><Fingerprint size={100} strokeWidth={1}/><span className="identity-scan"/><span>{pending ? 'CHECK YOUR INBOX' : signup ? passed === 5 ? 'PASSWORD: READY ✓' : 'BUILD YOUR IDENTITY' : visible ? 'NO PEEKING. (EXCEPT YOU.)' : 'WELCOME BACK, OPERATOR'}</span></div>
      <p>Practice CTFs, learn from others,<br />and share your skills.</p>
      <div className="access-art-footer"><ShieldCheck size={17}/><span>Learn. Practice. Share.</span><ArrowUpRight size={18}/></div>
    </aside>
    <section className="auth-form access-form">
      <Link to="/" className="auth-back"><ArrowLeft size={14}/> Back to Fsociety PK</Link>
      <nav className="auth-switch" aria-label="Account access"><Link to="/login" state={location.state} className={!signup ? 'selected' : ''} aria-current={!signup ? 'page' : undefined}>Log in</Link><Link to="/signup" state={location.state} className={signup ? 'selected' : ''} aria-current={signup ? 'page' : undefined}>Sign up</Link><span className={signup ? 'switch-right' : ''} aria-hidden="true"/></nav>
      <div className="auth-title"><span className="eyebrow">{pending ? '02 / Verify your email' : signup ? '01 / Create your identity' : '01 / Enter the workspace'}</span><h1>{pending ? 'One last checkpoint.' : signup ? 'Join the collective.' : 'Welcome back.'}</h1><p>{pending ? <>We sent a six-digit code to <strong>{pending.email}</strong>. It expires in 10 minutes.</> : signup ? 'Start solving challenges and track your progress.' : 'Your next challenge is waiting for you.'}</p></div>
      <form onSubmit={submit} noValidate aria-busy={busy}>
        {failure && <div className={`auth-feedback ${playful ? 'playful-feedback' : ''}`} role="alert">{playful && <span className="feedback-label">PAYLOAD SPOTTED</span>}{failure}{playful && <Link to="/challenges">Take it to the challenge library <ArrowUpRight size={14}/></Link>}</div>}
        {pending ? <div className="otp-step" key="otp"><div className="otp-mail"><Mail size={25}/><Check size={14}/></div><div className="form-field"><label htmlFor="auth-code">Email verification code</label><input id="auth-code" className="input otp-input" autoFocus autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} aria-describedby="otp-help"/><small id="otp-help">Paste the full code. Check spam if the email hasn’t arrived.</small></div><button className="btn-primary w-full" disabled={busy || resending}>{busy ? <Loader2 className="animate-spin" size={17}/> : <>Verify email & join <ArrowRight size={17}/></>}</button><div className="otp-actions"><button type="button" onClick={resend} disabled={!!cooldown || resending || busy}>{resending ? 'Sending…' : cooldown ? `Resend in ${cooldown}s` : 'Resend code'}</button><button type="button" disabled={busy || resending} onClick={() => { savePending(null); setCode(''); setFailure(''); }}>Change details</button></div></div> : <>
          {signup && <div className="form-field"><label htmlFor="auth-email">Email address</label><input id="auth-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}/>{errors.email && <span id="email-error" className="field-error">{errors.email}</span>}</div>}
          <div className="form-field"><label htmlFor="auth-username">{signup ? 'Username' : 'Username or email'}</label><input id="auth-username" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder={signup ? 'Choose your handle' : 'Your handle or email address'} {...field('username')} aria-invalid={!!errors.username} aria-describedby={errors.username ? 'username-error' : undefined}/>{errors.username && <span id="username-error" className="field-error">{errors.username}</span>}</div>
          <div className="form-field"><label htmlFor="auth-password">Password</label><div className="password-input"><input id="auth-password" className="input" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Make it a strong one' : 'Enter your password'} {...field('password')} aria-invalid={!!errors.password} aria-describedby={signup ? 'password-requirements password-error' : errors.password ? 'password-error' : undefined}/><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div><span id="password-error" className="field-error">{errors.password}</span></div>
          {signup && <div className="password-checker" id="password-requirements"><div className="password-progress" aria-hidden="true">{passwordRules.map((rule, index) => <span key={rule.label} className={index < passed ? 'complete' : ''}/>)}</div><div className="password-status" aria-live="polite"><LockKeyhole size={13}/>{passed === 5 ? 'All checks passed. Looking good.' : values.password ? `${passed} of 5 requirements met. Keep going.` : 'Build a password that holds its ground.'}</div><ul>{passwordRules.map(rule => <li key={rule.label} className={rule.test(values.password) ? 'met' : ''}><span>{rule.test(values.password) ? <Check size={11}/> : '·'}</span>{rule.label}</li>)}</ul></div>}
          <button className="btn-primary w-full auth-submit" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={17}/>{signup ? 'Sending your code…' : 'Checking credentials…'}</> : <>{signup ? 'Create account' : 'Log in'}<ArrowRight size={17}/></>}</button>
          {signup && <p className="auth-email-note"><Mail size={13}/> We’ll email a code to verify it’s you.</p>}
        </>}
      </form>
      <p className="auth-bottom-note">{signup ? 'Already part of the community?' : 'New to Fsociety PK?'} <Link to={signup ? '/login' : '/signup'} state={location.state}>{signup ? 'Log in' : 'Create an account'} <ArrowUpRight size={13}/></Link></p>
    </section>
  </div>;
}
