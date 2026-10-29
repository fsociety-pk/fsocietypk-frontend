import { isStaff } from '../../utils/roles';
import { useEffect } from "react";
import { Link, Navigate, useOutlet, useLocation } from "react-router-dom";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import Navbar from "./navbar";
import { useAuthStore } from "../../store/authStore";
import { Brand } from "./navbar";
import ThemeToggle from "../common/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import PageState from '../common/PageState';
import { TEAM_ABOUT_URL } from '../../data/team';
export default function MainLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const authPage = ["/login", "/signup"].includes(pathname);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  const landing = !authenticated && ["/", "/dashboard"].includes(pathname);
  if (authenticated && isLoading) return <PageState loading fullPage />;
  if (authenticated && isStaff(role)) return <Navigate to="/admin" replace />;
  if (authPage && !authenticated) return (
    <MotionConfig reducedMotion="user">
      <div className="access-shell">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <header className="access-header"><Brand /><div><Link to="/" className="access-home" aria-label="Back to the community"><ArrowLeft size={15} /><span>Back to the community</span></Link><ThemeToggle /></div></header>
        <main id="main-content" tabIndex={-1}>{outlet}</main>
      </div>
    </MotionConfig>
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className={"app-shell " + (authenticated ? "is-authenticated" : landing ? "is-landing" : "")}>
        <Navbar />
        <main id="main-content" className="app-content" tabIndex={-1}>
          {/* Unmount route guards immediately when auth changes. Retaining an
              exiting outlet can redirect again or stall behind a lazy route. */}
          <motion.div key={authPage ? pathname : 'workspace'} initial={authPage && !reduced ? { opacity: 0, x: pathname === '/signup' ? 18 : -18 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : .2, ease: 'easeOut' }}>{outlet}</motion.div>
        </main>
        {!landing && <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} Fsociety PK. Learn. Practice. Share.
          </span>
          <span className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/resources">Learn</Link>
            <a href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer">About the team</a>
            {authenticated && <Link to="/support">Support</Link>}
            {authenticated && <Link to="/about-admin">About the admin</Link>}
            <Link to="/submit-challenge">Contribute</Link>
            <a
              href="https://github.com/fsociety-pk"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </span>
        </footer>}
      </div>
    </MotionConfig>
  );
}
