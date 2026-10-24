import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BookOpen,
  ChevronDown,
  Folder,
  LogOut,
  Menu,
  Shield,
  Terminal,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import {
  NOTIFICATION_UNREAD_COUNT_UPDATED,
  notificationService,
} from '../../services/notificationService';
import { toast } from 'react-hot-toast';
import companyLogo from '../../../images/logo.png';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        setUnreadCount(await notificationService.getUnreadCount());
      } catch (error) {
        console.warn('Unable to refresh notification count', error);
      }
    };

    const handleUnreadCountUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ count: number }>;
      setUnreadCount(Number(customEvent.detail?.count ?? 0));
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    window.addEventListener(NOTIFICATION_UNREAD_COUNT_UPDATED, handleUnreadCountUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATION_UNREAD_COUNT_UPDATED, handleUnreadCountUpdated);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await authService.logout();
      logout();
      toast.success('DECONNECTED_SUCCESSFULLY');
      navigate('/login');
    } catch {
      toast.error('LOGOUT_FAILURE');
    }
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'DASHBOARD', path: '/dashboard', icon: Terminal },
        { name: 'MISSIONS', path: '/challenges', icon: Shield },
        { name: 'HALL_OF_FAME', path: '/leaderboard', icon: Trophy },
        { name: 'WRITEUPS', path: '/writeups', icon: BookOpen },
        { name: 'RESOURCES', path: '/resources', icon: BookOpen },
        { name: 'SUBMIT_MISSION', path: '/submit-challenge', icon: Terminal },
        { name: 'SUBMIT_WRITEUP', path: '/submit-writeup', icon: BookOpen },
        { name: 'PROJECTS', path: '/projects', icon: Folder },
      ]
    : [
        { name: 'LOGIN', path: '/login', icon: User },
        { name: 'JOIN_US', path: '/signup', icon: Terminal },
      ];

  if (user?.role === 'admin' && isAuthenticated) {
    navLinks.push({ name: 'ADMIN_CONTROL', path: '/admin', icon: Shield });
  }

  const primaryLinks = navLinks.filter(({ name }) =>
    ['DASHBOARD', 'MISSIONS', 'HALL_OF_FAME'].includes(name)
  );
  const moreLinks = navLinks.filter(({ name }) =>
    !['DASHBOARD', 'MISSIONS', 'HALL_OF_FAME'].includes(name)
  );
  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(`${path}/`));
  const linkLabel = (name: string) => name.replace(/_/g, ' ');
  const linkClass = (path: string) =>
    `inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-xs font-semibold tracking-wide transition-colors ${
      isActive(path)
        ? 'bg-neon-green/10 text-neon-green'
        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-4 sm:px-6">
        <Link to="/" aria-label="FSocietyPK home" className="flex shrink-0 items-center gap-2.5">
          <img src={companyLogo} alt="" className="h-9 w-9 rounded-full object-contain" />
          <span className="hidden whitespace-nowrap font-display text-base font-bold tracking-[0.12em] text-white sm:block">
            FSOCIETY<span className="text-neon-green">PK</span>
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
            {primaryLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                <link.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{linkLabel(link.name)}</span>
              </Link>
            ))}
            {moreLinks.length > 0 && (
              <details className="group relative">
                <summary
                  className={`inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-3 text-xs font-semibold tracking-wide transition-colors [&::-webkit-details-marker]:hidden ${
                    moreLinks.some((link) => isActive(link.path))
                      ? 'bg-neon-green/10 text-neon-green'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                  }`}
                >
                  <span>MORE</span>
                  <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute left-0 top-full z-50 mt-2 min-w-56 rounded-lg border border-surface-border bg-background-card p-1.5 shadow-card">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-xs font-medium transition-colors ${
                        isActive(link.path)
                          ? 'bg-neon-green/10 text-neon-green'
                          : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <link.icon aria-hidden="true" className="h-4 w-4 text-zinc-500" />
                      {linkLabel(link.name)}
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="hidden flex-1 items-center justify-end gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex min-h-11 items-center rounded-md px-4 text-xs font-semibold tracking-wide transition-colors ${
                  link.path === '/signup'
                    ? 'bg-neon-green text-background hover:brightness-105'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {linkLabel(link.name)}
              </Link>
            ))}
          </div>
        )}

        {isAuthenticated && (
          <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              to="/profile"
              aria-label={`View ${user?.username ?? 'your'} profile`}
              className="inline-flex min-h-11 max-w-40 items-center gap-2 rounded-md px-2.5 text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm text-neon-green">
                  {user?.username?.[0]?.toUpperCase() ?? 'U'}
                </span>
              )}
              <span className="truncate text-xs font-medium">{user?.username}</span>
            </Link>
            <Link
              to="/notifications"
              aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              className="relative flex h-11 w-11 items-center justify-center rounded-md border border-surface-border text-zinc-400 transition-colors hover:border-neon-green/40 hover:text-neon-green"
            >
              <Bell aria-hidden="true" className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 min-w-4 rounded-full bg-neon-green px-1 text-center text-[9px] font-bold leading-4 text-background">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-surface-border text-zinc-400 transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-surface-border text-zinc-300 transition-colors hover:border-neon-green/40 hover:text-neon-green lg:hidden"
        >
          {isOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden border-t border-surface-border bg-background-card lg:hidden"
          >
            <div className="mx-auto grid max-w-[1480px] gap-1 px-4 py-3 sm:grid-cols-2 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-neon-green/10 text-neon-green'
                      : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <link.icon aria-hidden="true" className="h-4 w-4" />
                  {linkLabel(link.name)}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    <User aria-hidden="true" className="h-4 w-4" />
                    {user?.username}
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    <Bell aria-hidden="true" className="h-4 w-4" />
                    Notifications{unreadCount > 0 ? ` (${unreadCount > 99 ? '99+' : unreadCount})` : ''}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Log out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
