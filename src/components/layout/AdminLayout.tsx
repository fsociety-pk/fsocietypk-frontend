import React, { Suspense, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart4,
  ChevronLeft,
  Folder,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  Flag,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import companyLogo from '../../../images/logo.png';

const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart4 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Challenges', path: '/admin/challenges', icon: Flag },
    { name: 'Projects', path: '/admin/projects', icon: Folder },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(`${path}/`));

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] min-w-0 overflow-x-clip">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={clsx(
          'fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r border-surface-border bg-background-secondary transition-[width,transform] duration-200',
          sidebarOpen ? 'w-64 lg:w-64' : 'w-64 lg:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <Link to="/admin" className="flex min-w-0 items-center gap-2">
            <img src={companyLogo} alt="" className="h-8 w-8 shrink-0 rounded-full object-contain" />
            <span className={clsx('whitespace-nowrap text-xs font-semibold tracking-wide text-zinc-200', !sidebarOpen && 'lg:hidden')}>
              ADMINISTRATION
            </span>
          </Link>
          <button
            type="button"
            aria-label={sidebarOpen ? 'Collapse admin navigation' : 'Expand admin navigation'}
            onClick={() => setSidebarOpen((open) => !open)}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-neon-green lg:flex"
          >
            {sidebarOpen ? <ChevronLeft aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-neon-green lg:hidden"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <nav aria-label="Admin navigation" className="flex flex-col gap-1 overflow-y-auto p-3">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(path) ? 'page' : undefined}
              title={!sidebarOpen ? name : undefined}
              className={clsx(
                'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                !sidebarOpen && 'lg:justify-center lg:px-0',
                isActive(path)
                  ? 'bg-neon-green/10 text-neon-green'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              )}
            >
              <Icon aria-hidden="true" size={17} className="shrink-0" />
              <span className={clsx('whitespace-nowrap', !sidebarOpen && 'lg:hidden')}>{name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-surface-border p-3">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            title={!sidebarOpen ? 'Exit admin' : undefined}
            className={clsx(
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white',
              !sidebarOpen && 'lg:justify-center lg:px-0'
            )}
          >
            <ChevronLeft aria-hidden="true" size={17} className="shrink-0" />
            <span className={clsx('whitespace-nowrap', !sidebarOpen && 'lg:hidden')}>Exit admin</span>
          </Link>
        </div>
      </aside>

      <div
        className={clsx(
          'min-w-0 flex-1 transition-[margin] duration-200',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        <div className="flex h-14 items-center gap-3 border-b border-surface-border px-4 lg:hidden">
          <button
            type="button"
            aria-label="Open admin navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-surface-border text-zinc-300 transition-colors hover:border-neon-green/40 hover:text-neon-green"
          >
            <Menu aria-hidden="true" size={18} />
          </button>
          <span className="text-sm font-semibold text-zinc-200">Administration</span>
        </div>

        <main className="min-h-[calc(100dvh-8.5rem)] min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
                <span className="text-sm text-zinc-400">Loading admin page...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
