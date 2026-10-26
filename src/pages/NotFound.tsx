import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, CornerDownRight, Terminal } from 'lucide-react';
import { Brand } from '../components/layout/navbar';
import ThemeToggle from '../components/common/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { isStaff } from '../utils/roles';
import '../styles/system-states.css';

export default function NotFound() {
  const { pathname } = useLocation();
  const user = useAuthStore(state => state.user);
  const home = isStaff(user?.role) ? '/admin' : '/dashboard';
  useEffect(() => {
    const previous = document.title;
    document.title = '404 — Page not found | Fsociety PK';
    document.getElementById('not-found-title')?.focus();
    return () => { document.title = previous; };
  }, []);
  return <div className="lost-page">
    <a href="#lost-main" className="skip-link">Skip to content</a>
    <header className="access-header"><Brand /><ThemeToggle /></header>
    <main id="lost-main" className="lost-main">
      <div className="lost-story">
        <p className="lost-number" aria-label="Error 404">404<span aria-hidden="true">/</span></p>
        <h1 id="not-found-title" tabIndex={-1}>Page not found.</h1>
        <p>This page may have moved, or the address took a wrong turn. Let’s get you back to familiar ground.</p>
        <div className="lost-actions"><Link to={home} className="btn-primary"><ArrowLeft size={17} />{user ? 'Back to my workspace' : 'Back to the community'}</Link><Link to="/resources" className="lost-resource">Explore resources <ArrowUpRight size={16} /></Link></div>
      </div>
      <section className="lost-terminal" aria-label="Missing page details">
        <div className="lost-terminal-bar"><Terminal size={15} /><span>fsociety / route lookup</span><span className="lost-status">404</span></div>
        <div className="lost-terminal-body">
          <img src="/brand/fsociety-logo-transparent.png" width="128" height="128" alt="Fsociety PK masked figure" />
          <p className="lost-terminal-heading">Destination not found.</p>
          <div className="lost-request"><span>GET</span><code>{pathname}</code></div>
          <p className="lost-result"><CornerDownRight size={14} aria-hidden="true" /> Route not found.</p>
          <p className="lost-joke">Nice recon. No flag here, though.</p>
        </div>
      </section>
    </main>
    <footer className="lost-footer">Fsociety PK. Learn. Practice. Share.</footer>
  </div>;
}
