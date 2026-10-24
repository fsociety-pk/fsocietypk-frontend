import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, ShieldCheck, Terminal } from 'lucide-react';

interface AuthScaffoldProps { mode: 'login' | 'signup'; children: React.ReactNode; }

const AuthScaffold: React.FC<AuthScaffoldProps> = ({ mode, children }) => (
  <div className="auth-page page-frame">
    <aside className="auth-story">
      <p className="section-index">[ FSOCIETYPK — COLLECTIVE ACCESS ]</p>
      <h1>There is always<br />more beneath<br />the <em>surface.</em></h1>
      <p>Bring your curiosity. Build your skills. The next breakthrough starts with a question.</p>
      <div className="auth-graphic" aria-hidden="true">
        <div className="auth-ring" /><div className="auth-ring ring-inner" />
        <Fingerprint size={100} strokeWidth={.7} />
        <span>IDENTITY / ENCRYPTED</span>
      </div>
      <div className="auth-story-note"><ShieldCheck size={15} /> Authorized practice. Shared knowledge.</div>
    </aside>
    <motion.section className="auth-panel" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
      <div className="auth-panel-top"><Terminal size={16} /><span>ACCESS / {mode === 'login' ? '001' : '002'}</span><i /></div>
      <p className="section-index">{mode === 'login' ? '// RETURNING OPERATOR' : '// NEW OPERATOR'}</p>
      <h2>{mode === 'login' ? 'Welcome back.' : 'Join the collective.'}</h2>
      <p className="auth-panel-description">{mode === 'login' ? 'Sign in to continue your training.' : 'Create your identity and start learning with us.'}</p>
      {children}
      <div className="auth-panel-footnote"><span className="live-mark" /> FSOCIETYPK / SECURE ACCOUNT ACCESS</div>
    </motion.section>
  </div>
);

export default AuthScaffold;
