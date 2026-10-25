import { useEffect } from "react";
import { Link, useOutlet, useLocation } from "react-router-dom";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import Navbar from "./navbar";
import { useAuthStore } from "../../store/authStore";
export default function MainLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const authPage = ["/login", "/signup"].includes(pathname);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  const landing = !authenticated && ["/", "/dashboard"].includes(pathname);
  return (
    <MotionConfig reducedMotion="user">
      <div className={"app-shell " + (authenticated ? "is-authenticated" : landing ? "is-landing" : "")}>
        <Navbar />
        <main id="main-content" className="app-content" tabIndex={-1}>
          {/* Unmount route guards immediately when auth changes. Retaining an
              exiting outlet can redirect again or stall behind a lazy route. */}
          <motion.div key={authPage ? pathname : 'workspace'} initial={authPage && !reduced ? { opacity: 0, x: pathname === '/signup' ? 18 : -18 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : .2, ease: 'easeOut' }}>{outlet}</motion.div>
        </main>
        <footer className="site-footer">
          <span>
            © {new Date().getFullYear()} Fsociety PK. Learn. Practice. Share.
          </span>
          <span className="flex gap-5">
            <Link to="/resources">Learn</Link>
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
        </footer>
      </div>
    </MotionConfig>
  );
}
