import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Navbar from "./navbar";
import { useAuthStore } from "../../store/authStore";
export default function MainLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <MotionConfig reducedMotion="user">
      <div className={"app-shell " + (authenticated ? "is-authenticated" : "")}>
        <Navbar />
        <main id="main-content" className="app-content" tabIndex={-1}>
          <Outlet />
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
