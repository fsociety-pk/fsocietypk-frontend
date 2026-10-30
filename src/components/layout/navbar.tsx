import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
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
  Bell,
  LogOut,
  ArrowUpRight,
  ChevronRight,
  Users,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/auth.service";
import {
  notificationService,
  NOTIFICATION_UNREAD_COUNT_UPDATED,
} from "../../services/notificationService";
import BrandLogo from "../common/BrandLogo";
import ThemeToggle from "../common/ThemeToggle";
import { toast } from "react-hot-toast";
import { TEAM_ABOUT_URL } from '../../data/team';
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
  const [unread, setUnread] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawer = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
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
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }
    let active = true;
    const fetchCount = () =>
      notificationService
        .getUnreadCount()
        .then((n) => {
          if (active) setUnread(n);
        })
        .catch(() => {});
    const update = (e: Event) =>
      setUnread(
        Number((e as CustomEvent<{ count: number }>).detail?.count || 0),
      );
    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    window.addEventListener(NOTIFICATION_UNREAD_COUNT_UPDATED, update);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(NOTIFICATION_UNREAD_COUNT_UPDATED, update);
    };
  }, [isAuthenticated]);
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
        <a className="nav-team-link" href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer"><Users size={17} />About the team<ArrowUpRight size={14} /></a>
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
          <nav className="public-nav" aria-label="Main">
            <NavLink to="/challenges">Challenges</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <a className="nav-team-link" href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer"><Users size={15} aria-hidden="true" /><span>About the team</span><ArrowUpRight size={14} aria-hidden="true" /></a>
          </nav>
        )}
        <div className="header-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link
                to="/notifications"
                className="icon-button relative"
                aria-label={
                  "Notifications" + (unread ? ", " + unread + " unread" : "")
                }
              >
                <Bell size={17} />
                {unread > 0 && <i className="notification-dot" />}
              </Link>
              <NavLink
                to="/profile"
                className="user-chip"
                aria-label={`View profile for ${user?.username || "your account"}`}
              >
                <span className="avatar-small user-chip-avatar" aria-hidden="true">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || <User size={18} />
                  )}
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
                <span>Log in</span><ArrowUpRight size={15} aria-hidden="true" />
              </Link>
              <Link to="/signup" className="btn-primary join-button nav-signup">
                <span>Create account</span><ArrowUpRight size={15} aria-hidden="true" />
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
      {open && (
        <div
          ref={drawer}
          className="mobile-drawer"
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
            navigation
          ) : (
            <nav className="sidebar-nav">
              {workspaceLinks
                .filter((x) => x.to !== "/writeups")
                .map(({ to, label, icon: Icon }) => (
                  <NavLink to={to} key={to}>
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              <a className="nav-team-link" href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer"><Users size={18} />About the team<ArrowUpRight size={14} /></a>
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
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
