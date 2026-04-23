import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  Settings, 
  ChevronLeft, 
  BarChart4,
  Folder,
  Menu
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import companyLogo from '../../../images/logo.png';

const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Final check: only admins should ever see this layout
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black flex font-mono selection:bg-neon-green/30 selection:text-neon-green overflow-x-hidden">
      {/* ── Background Grid (Global Decor) ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px]" />
      
      {/* ── Global Scanline Effect ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-gradient-to-b from-transparent via-neon-green/10 to-transparent bg-[length:100%_4px] animate-scanline" />

      {/* ── SIDEBAR ────────────────────────────────────────────────── */}
      <aside className={clsx(
        "fixed left-0 top-0 h-screen border-r border-zinc-900 bg-black/95 backdrop-blur-md transition-all duration-300 z-40",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Top Section - Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-900">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <img src={companyLogo} alt="FsocietyPK logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-white text-xs tracking-widest whitespace-nowrap">ADMIN</span>
            </Link>
          )}
          {!sidebarOpen && (
            <Link to="/" className="mx-auto">
              <img src={companyLogo} alt="FsocietyPK logo" className="w-8 h-8 object-contain" />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-zinc-900 rounded transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} className="text-neon-green" />
            ) : (
              <Menu size={18} className="text-neon-green" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider whitespace-nowrap",
                  isActive(item.path) 
                    ? "text-neon-green bg-neon-green/10 border border-neon-green/20" 
                    : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                )}
                title={!sidebarOpen ? item.name : ""}
              >
                <Icon size={16} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Exit Button */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Link
            to="/"
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider border border-zinc-800 hover:border-neon-green/30 hover:text-neon-green w-full",
              sidebarOpen ? "justify-start" : "justify-center"
            )}
            title={!sidebarOpen ? "Exit Admin" : ""}
          >
            <ChevronLeft size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Exit Admin</span>}
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main className={clsx(
        "flex-grow z-10 relative transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-20"
      )}>
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>

        <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.2em] font-mono bg-black">
          &copy; {new Date().getFullYear()} FSOCIETY_PK // ADMIN_SHELL // LOG_LEVEL_VERBOSE
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
