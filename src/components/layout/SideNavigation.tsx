import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Home, Shield, Trophy, PlusCircle } from 'lucide-react';
import { clsx } from 'clsx';

const sideLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Missions', path: '/challenges', icon: Shield },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Submit', path: '/submit-challenge', icon: PlusCircle },
  { name: 'Cyber Cinema', path: '/cyber-cinema', icon: Film, featured: true },
];

type SideNavigationProps = {
  isMobileOpen: boolean;
  onMobileClose: () => void;
};

const SideNavigation: React.FC<SideNavigationProps> = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation();

  return (
    <>
      <button
        aria-label="Close side navigation"
        onClick={onMobileClose}
        className={clsx(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      <aside
        className={clsx(
          'fixed left-0 top-16 bottom-0 z-50 w-72 border-r border-neon-green/20 bg-zinc-950/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-neon-green/20 px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neon-green/80">Navigation</p>
            <p className="mt-2 text-xs text-zinc-500">Quick access to missions and rankings</p>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {sideLinks.map((link) => {
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onMobileClose}
                  className={clsx(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all',
                    isActive
                      ? 'border-neon-green/60 bg-neon-green/10 text-neon-green'
                      : link.featured
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:border-cyan-300'
                      : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-neon-green/40 hover:text-neon-green'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-neon-green/20 px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Device-aware navigation
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideNavigation;
