import { isStaff } from '../../utils/roles';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { loginSchema, registerSchema, type IUser } from '../../types';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import AccessMascot from './AccessMascot';
import PasswordStrengthRobot, { type PasswordCheckState } from './PasswordStrengthRobot';
import SqlPrank from './SqlPrank';
import { useUsernameAvailability } from '../../hooks/useUsernameAvailability';
import { returnLocation } from '../../utils/returnLocation';
import { detectAuthPayload, authPayloadMessage } from '../../utils/authInputFeedback';

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
export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const [values, setValues] = useState({ username: '', email: '', password: '' });
  const [touched, setTouched] = useState<Partial<Record<'username' | 'email' | 'password', boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [pending, setPending] = useState<Pending | null>(() => signup ? readPending() : null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState<keyof typeof values | null>(null);
  const [usernameIdeasOpen, setUsernameIdeasOpen] = useState(false);
  const [failure, setFailure] = useState('');
  const [playful, setPlayful] = useState(false);
  const [sqlPrankRound, setSqlPrankRound] = useState<number | null>(null);
  const sqlPrankCount = useRef(0);
  const returningFromPrank = useRef(false);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  const client = useQueryClient();
  const setUser = useAuthStore(state => state.setUser);
  const usernameAvailability = useUsernameAvailability(values.username, signup && !pending && sqlPrankRound === null);
  const passed = passwordRules.filter(rule => rule.test(values.password)).length;
  const passwordTooLong = new TextEncoder().encode(values.password).length > 72;
  const passwordStrength: PasswordCheckState = !values.password ? 'empty' : passwordTooLong ? 'invalid' : passed <= 2 ? 'weak' : passed === 3 ? 'fair' : passed === 4 ? 'good' : 'complete';
  const validateField = (name: keyof typeof values, value: string): string | undefined => {
    if (name !== 'password') {
      const kind = detectAuthPayload(value);
      if (kind === 'sql') return undefined;
      if (kind) return authPayloadMessage(kind);
    }
    const schema = signup ? registerSchema.shape[name] : name === 'username' ? loginSchema.shape.username : loginSchema.shape.password;
    const result = schema.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  };
  const fieldErrors = Object.fromEntries((['username', 'email', 'password'] as const).map(name => {
    const show = touched[name] || (name !== 'password' && !!values[name]) || (name === 'password' && passwordTooLong && signup);
    return [name, name === 'username' && signup && usernameAvailability.status === 'taken' ? 'That username is taken. Choose another or try an idea below.' : errors[name] || (show ? validateField(name, values[name]) : undefined)];
  })) as typeof errors;
  const valid = (name: keyof typeof values) => !!values[name] && !(name !== 'password' && detectAuthPayload(values[name]) === 'sql') && !validateField(name, values[name]);
  const payload = detectAuthPayload(values.username) || (signup ? detectAuthPayload(values.email) : null);
  const usernameSeed = values.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 20).replace(/[_-]+$/, '');
  const usernameIdeas = signup && !payload && usernameSeed.length >= 2 ? ['ops', 'cipher', '404'].map(suffix => `${usernameSeed}_${suffix}`).filter(idea => idea !== values.username) : [];
  const mascotMessage = payload === 'sql' ? undefined : payload ? `${payload === 'xss' ? 'XSS' : 'Query'} payload spotted. Save it for the challenges!` : focused === 'username' && values.username ? signup && usernameAvailability.status === 'taken' ? `That name is taken. Try ${usernameIdeas[0] || 'another one'}?` : signup && usernameAvailability.status === 'available' ? 'Nice choice! That username is available.' : signup && usernameIdeasOpen && usernameIdeas.length ? `Try ${usernameIdeas[0]}?` : valid('username') ? signup ? 'Username format looks good. Nice choice!' : 'Welcome back! Ready for new challenges?' : signup ? 'A little tweak to your username. You’ve got this.' : 'Check your username or email. You’ve got this.' : focused === 'email' && values.email ? valid('email') ? 'Email looks good. We’ll verify it next.' : 'That email needs a little tune-up.' : undefined;
  const passwordMessage = passwordTooLong ? 'A little shorter: keep it within 72 bytes.' : !values.password ? 'Your password starts at level zero. Let’s build it.' : passed === 5 && valid('password') ? 'All five checks passed. We respect that!' : passed === 4 ? 'One more upgrade. You’ve got this!' : `Password progress: ${passed}/5. Getting there!`;
  const cooldown = pending ? Math.max(0, Math.ceil((pending.resendAt - now) / 1000)) : 0;
  useEffect(() => {
    if (sqlPrankRound !== null || !returningFromPrank.current) return;
    returningFromPrank.current = false;
    const name = detectAuthPayload(values.username) === 'sql' ? 'username' : 'email';
    const input = document.getElementById(`auth-${name}`);
    if (input instanceof HTMLInputElement) { input.focus(); input.select(); }
  }, [sqlPrankRound, values.username]);
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
    const path = returnLocation(location.state?.from);
    navigate(isStaff(user.role) ? path.startsWith('/admin') ? path : '/admin' : path.startsWith('/admin') ? '/dashboard' : path, { replace: true });
  };
  const field = (name: keyof typeof values) => ({
    value: values[name],
    onFocus: () => { setFocused(name); if (name === 'username' && signup) setUsernameIdeasOpen(true); },
    onBlur: () => { setFocused(null); setTouched(current => ({ ...current, [name]: true })); },
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues(current => ({ ...current, [name]: event.target.value }));
      setErrors(current => ({ ...current, [name]: undefined }));
      if (playful) { setFailure(''); setPlayful(false); }
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
    if (payload) {
      if (payload === 'sql') {
        setSqlPrankRound(sqlPrankCount.current++);
        return;
      }
      setPlayful(true); setFailure(authPayloadMessage(payload)); return;
    }
    if (signup && usernameAvailability.status === 'taken') {
      document.getElementById('auth-username')?.focus();
      return;
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
      setPlayful(!!(error.response?.data?.data?.payloadType || error.response?.data?.data?.isSQLInjection || error.response?.data?.data?.isXSS));
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
  if (sqlPrankRound !== null) return <div className="auth-page access-page sql-prank-page">
    <SqlPrank round={sqlPrankRound} signup={signup} onReturn={() => {
      returningFromPrank.current = true;
      setSqlPrankRound(null);
    }} />
  </div>;

  return <div className={`auth-page access-page ${signup ? 'signup-mode' : 'login-mode'}`}>
    <section className="auth-form access-form">
      <AccessMascot focused={focused} characterCount={focused && focused !== 'password' ? values[focused].length : 0} covered={visible} pending={!!pending} welcomeMessage={signup ? undefined : 'Welcome back! Ready for new challenges?'} message={mascotMessage} />
      <nav className="auth-switch" aria-label="Account access"><Link to="/login" state={location.state} className={!signup ? 'selected' : ''} aria-current={!signup ? 'page' : undefined}>Log in</Link><Link to="/signup" state={location.state} className={signup ? 'selected' : ''} aria-current={signup ? 'page' : undefined}>Sign up</Link><span className={signup ? 'switch-right' : ''} aria-hidden="true"/></nav>
      <div className="auth-title"><h1>{pending ? 'Check your inbox.' : signup ? 'Your journey starts here.' : 'Welcome back.'}</h1><p>{pending ? <>We sent a six-digit code to <strong>{pending.email}</strong>. It expires in 10 minutes.</> : signup ? 'A new challenge. A new skill. Your own community.' : 'Ready for new challenges?'}</p></div>
      <form onSubmit={submit} noValidate aria-busy={busy}>
        {failure && <div className={`auth-feedback ${playful ? 'playful-feedback' : ''}`} role="alert">{playful && <span className="feedback-label">PAYLOAD SPOTTED</span>}{failure}{playful && <Link to="/challenges">Take it to the challenge library <ArrowUpRight size={14}/></Link>}</div>}
        {pending ? <div className="otp-step" key="otp"><div className="otp-mail"><Mail size={25}/><Check size={14}/></div><div className="form-field"><label htmlFor="auth-code">Email verification code</label><input id="auth-code" className="input otp-input" autoFocus autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} aria-describedby="otp-help"/><small id="otp-help">Paste the full code. Check spam if the email hasn’t arrived.</small></div><button className="btn-primary w-full" disabled={busy || resending}>{busy ? <Loader2 className="animate-spin" size={17}/> : <>Verify email & join <ArrowRight size={17}/></>}</button><div className="otp-actions"><button type="button" onClick={resend} disabled={!!cooldown || resending || busy}>{resending ? 'Sending…' : cooldown ? `Resend in ${cooldown}s` : 'Resend code'}</button><button type="button" disabled={busy || resending} onClick={() => { savePending(null); setCode(''); setFailure(''); }}>Change details</button></div></div> : <>
          <div className="auth-identity-fields">
            {signup && <div className="form-field"><div className="field-label-row"><label htmlFor="auth-email">Email address</label>{valid('email') && <span className="field-valid"><CheckCircle2 size={12}/>Valid format</span>}</div><input id="auth-email" className="input" type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'email-error' : undefined}/>{fieldErrors.email && <span id="email-error" className="field-error" aria-live="polite">{fieldErrors.email}</span>}</div>}
            <div className="form-field" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setUsernameIdeasOpen(false); }}><div className="field-label-row"><label htmlFor="auth-username">{signup ? 'Username' : 'Username or email'}</label>{signup && usernameAvailability.status !== 'idle' ? <span id="username-availability" role="status" aria-live="polite" className={`username-availability is-${usernameAvailability.status}`} title={usernameAvailability.status === 'error' ? 'Could not check right now. You can still try signing up.' : undefined}>{usernameAvailability.status === 'checking' ? <><Loader2 size={12} className="animate-spin"/>Checking…</> : usernameAvailability.status === 'available' ? <><CheckCircle2 size={12}/>Available</> : usernameAvailability.status === 'taken' ? 'Taken' : 'Check unavailable'}</span> : valid('username') && <span className="field-valid"><CheckCircle2 size={12}/>Valid format</span>}</div><input id="auth-username" className="input" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder={signup ? 'Enter your username' : 'Enter your username or email'} {...field('username')} aria-invalid={!!fieldErrors.username} aria-describedby={[fieldErrors.username ? 'username-error' : '', signup && usernameAvailability.status !== 'idle' ? 'username-availability' : ''].filter(Boolean).join(' ') || undefined}/>{fieldErrors.username && <span id="username-error" className="field-error" aria-live="polite">{fieldErrors.username}</span>}{signup && usernameIdeasOpen && usernameIdeas.length > 0 && <div className="username-ideas" aria-label="Username suggestions"><span>Try a username</span><div>{usernameIdeas.map(idea => <button type="button" key={idea} onMouseDown={event => event.preventDefault()} onClick={() => { setValues(current => ({ ...current, username: idea })); setErrors(current => ({ ...current, username: undefined })); document.getElementById('auth-username')?.focus(); setUsernameIdeasOpen(false); }}>{idea}</button>)}</div><small>Pick an idea to check its availability.</small></div>}</div>
          </div>
          <div className="form-field"><label htmlFor="auth-password">Password</label><div className={signup ? 'signup-password-field' : undefined}><div className="password-input"><input id="auth-password" className="input" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'Create your password' : 'Enter your password'} {...field('password')} aria-invalid={!!fieldErrors.password} aria-describedby={signup ? `password-requirements${fieldErrors.password ? ' password-error' : ''}` : fieldErrors.password ? 'password-error' : undefined}/><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>{signup && <PasswordStrengthRobot strength={passwordStrength} />}</div>{fieldErrors.password && <span id="password-error" className="field-error" aria-live="polite">{fieldErrors.password}</span>}</div>
          {signup && <div className="password-checker" id="password-requirements" data-strength={passwordStrength}><div className="password-progress" aria-hidden="true">{passwordRules.map((rule, index) => <span key={rule.label} className={index < passed ? 'complete' : ''}/>)}</div><div className="password-status" aria-live="polite"><LockKeyhole size={13}/>{passwordMessage}</div><ul>{passwordRules.map(rule => <li key={rule.label} className={rule.test(values.password) ? 'met' : ''}><span>{rule.test(values.password) ? <Check size={11}/> : '·'}</span>{rule.label}</li>)}</ul></div>}
          <button className="btn-primary w-full auth-submit" disabled={busy}>{busy ? <><Loader2 className="animate-spin" size={17}/>{signup ? 'Sending your code…' : 'Checking credentials…'}</> : <>{signup ? 'Create account' : 'Log in'}<ArrowRight size={17}/></>}</button>
          {signup && <p className="auth-email-note"><Mail size={13}/> We’ll email a code to verify it’s you.</p>}
        </>}
      </form>
      <p className="auth-bottom-note">{signup ? 'Already part of the community?' : 'New to Fsociety PK?'} <Link to={signup ? '/login' : '/signup'} state={location.state}>{signup ? 'Log in' : 'Create an account'} <ArrowUpRight size={13}/></Link></p>
    </section>
  </div>;
}
