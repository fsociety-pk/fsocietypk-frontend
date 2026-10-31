import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Headphones,
  LayoutDashboard,
  Flag,
  Trophy,
  BookOpen,
  Folder,
  Library,
  Send,
  User,
  Shield,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  Users,
  Home,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/auth.service";
import NotificationBell from '../common/NotificationBell';
import BrandLogo from "../common/BrandLogo";
import ThemeToggle from "../common/ThemeToggle";
import MemberAvatar from '../common/MemberAvatar';
import { toast } from "react-hot-toast";
import { TEAM_ABOUT_URL } from '../../data/team';
import { useReducedMotionPreference } from '../../hooks/useReducedMotionPreference';

const publicLinks = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/challenges", label: "Challenges", icon: Flag },
  { to: "/resources", label: "Resources", icon: Library },
  { to: "/projects", label: "Projects", icon: Folder },
];

const workspaceLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/challenges", label: "Challenges", icon: Flag },
  { to: "/leaderboard", label: "Hall of Fame", icon: Trophy },
  { to: "/writeups", label: "Writeups", icon: BookOpen },
  { to: "/resources", label: "Resources", icon: Library },
  { to: "/projects", label: "Projects", icon: Folder },
];
export function Brand() {
  return (
    <Link to="/" className="brand-lockup" aria-label="Fsociety PK home">
      <BrandLogo />
      <span>
        Fsociety<small>PK</small>
      </span>
    </Link>
  );
}
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [focusedLink, setFocusedLink] = useState<string | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const location = useLocation();
  const navigate = useNavigate();
  const drawer = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const activePublicLink = publicLinks.find(({ to }) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`)
  )?.to;
  const highlightedLink = focusedLink ?? hoveredLink ?? activePublicLink;
  useEffect(() => {
    setOpen(false);
    setHoveredLink(null);
    setFocusedLink(null);
  }, [location.pathname]);
  useEffect(() => {
    if (!open || isAuthenticated) return;
    const desktop = window.matchMedia('(min-width: 1200px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    closeOnDesktop();
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [open, isAuthenticated]);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("a,button")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (e.key === "Tab") {
        const elements =
          drawer.current?.querySelectorAll<HTMLElement>("a,button");
        if (!elements?.length) return;
        if (e.shiftKey && document.activeElement === elements[0]) {
          e.preventDefault();
          elements[elements.length - 1].focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === elements[elements.length - 1]
        ) {
          e.preventDefault();
          elements[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      logout();
      navigate("/login");
      toast.success("You are signed out.");
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };
  const personal = [
    { to: "/support", label: "Support", icon: Headphones },
    { to: "/submissions", label: "My submissions", icon: Send },
    { to: "/profile", label: "My profile", icon: User },
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Admin workspace", icon: Shield }]
      : []),
  ];
  const communityNavigation = <nav className="sidebar-nav" aria-label="Community">
    <a className="sidebar-team-link" href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer"><Users size={17} aria-hidden="true" /><span>About the team</span><ArrowUpRight size={14} aria-hidden="true" /></a>
  </nav>;
  const navigation = (
    <>
      <div className="sidebar-caption">Workspace</div>
      <nav className="sidebar-nav" aria-label="Workspace">
        {workspaceLinks.map(({ to, label, icon: Icon }) => (
          <NavLink to={to} key={to} data-nav={to.slice(1)}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-caption">Personal</div>
      <nav className="sidebar-nav" aria-label="Personal">
        {personal.map(({ to, label, icon: Icon }) => (
          <NavLink to={to} key={to}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
  const title =
    [
      ...workspaceLinks,
      ...personal,
      { to: "/submit-challenge", label: "Create challenge" },
      { to: "/submit-writeup", label: "Write a solution" },
      { to: "/notifications", label: "Notifications" },
      { to: "/about-admin", label: "About the admin" },
    ].find((item) => location.pathname.startsWith(item.to))?.label ||
    "Workspace";
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {isAuthenticated && (
        <aside className="app-sidebar">
          <Brand />
          <div className="sidebar-scroll">
          {navigation}
            <div className="sidebar-community">
              <Flag size={20} />
              <strong>Have a challenge idea?</strong>
              <p>Turn what you learn into someone else's next challenge.</p>
              <Link
                to="/submit-challenge"
                className="inline-flex items-center gap-2 mt-3 text-brand"
              >
                Create a challenge <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <div className="sidebar-footer">
            {communityNavigation}
            <button
              className="btn-ghost w-full justify-start"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>
      )}
      <header className={`site-header${isAuthenticated ? '' : ' public-site-header'}`}>
        {isAuthenticated ? (
          <div className="app-header-title">
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{title}</strong>
          </div>
        ) : (
          <Brand />
        )}
        {!isAuthenticated && (
          <nav className="public-nav" aria-label="Main" onMouseLeave={() => setHoveredLink(null)}>
            {publicLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/dashboard'}
                onMouseEnter={() => { setHoveredLink(to); setFocusedLink(null); }}
                onFocus={() => { setFocusedLink(to); setHoveredLink(null); }}
                onBlur={() => setFocusedLink(null)}
              >
                {highlightedLink === to && (
                  <motion.span
                    className="public-nav-highlight"
                    layoutId="public-navigation-highlight"
                    initial={false}
                    transition={{ duration: reducedMotion ? 0 : .24, ease: [.16, 1, .3, 1] }}
                    aria-hidden="true"
                  />
                )}
                <span className="public-nav-label">{label}</span>
              </NavLink>
            ))}
            <a
              className="nav-team-link"
              href={TEAM_ABOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => { setHoveredLink('team'); setFocusedLink(null); }}
              onFocus={() => { setFocusedLink('team'); setHoveredLink(null); }}
              onBlur={() => setFocusedLink(null)}
            >
              {highlightedLink === 'team' && (
                <motion.span
                  className="public-nav-highlight"
                  layoutId="public-navigation-highlight"
                  initial={false}
                  transition={{ duration: reducedMotion ? 0 : .24, ease: [.16, 1, .3, 1] }}
                  aria-hidden="true"
                />
              )}
              <span className="public-nav-label">About the team</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </nav>
        )}
        <div className="header-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <NavLink
                to="/profile"
                className="user-chip"
                aria-label={`View profile for ${user?.username || "your account"}`}
              >
                <span className="avatar-small user-chip-avatar" aria-hidden="true">
                  <MemberAvatar src={user?.avatar} username={user?.username} decorative />
                </span>
                <span className="user-chip-copy">
                  <strong>{user?.username || "Your account"}</strong>
                  <span>My profile</span>
                </span>
                <ArrowUpRight className="user-chip-arrow" size={15} aria-hidden="true" />
              </NavLink>
            </>
          ) : (
            <>
              <Link to="/login" className="login-link text-sm nav-login">
                <span>Log in</span>
              </Link>
              <Link to="/signup" className="btn-primary join-button nav-signup">
                <span>Create account</span><ArrowRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
      {open && !isAuthenticated && (
        <div
          className="public-navigation-backdrop"
          aria-hidden="true"
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}
      {open && (
        <div
          ref={drawer}
          className={`mobile-drawer${isAuthenticated ? '' : ' public-mobile-drawer'}`}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            className="btn-ghost mb-2"
            onClick={() => {
              setOpen(false);
              menuButton.current?.focus();
            }}
          >
            <X size={16} />
            Close navigation
          </button>
          {isAuthenticated ? (
            <>{navigation}<div className="sidebar-caption">Community</div>{communityNavigation}</>
          ) : (
            <nav className="sidebar-nav" aria-label="Main">
              {publicLinks.map(({ to, label, icon: Icon }) => (
                <NavLink to={to} key={to} end={to === '/dashboard'} onClick={() => setOpen(false)}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                  <ChevronRight className="mobile-nav-arrow" size={16} aria-hidden="true" />
                </NavLink>
              ))}
              <a className="nav-team-link" href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}><Users size={18} aria-hidden="true" /><span>About the team</span><ArrowUpRight className="mobile-nav-arrow" size={16} aria-hidden="true" /></a>
            </nav>
          )}
          <div className="mobile-drawer-footer">
            {isAuthenticated ? (
              <button
                className="btn-outline"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut size={16} />
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-outline">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Create account <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
