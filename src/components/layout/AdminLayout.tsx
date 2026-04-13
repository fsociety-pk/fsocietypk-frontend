import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  Settings, 
  ChevronLeft, 
  ShieldAlert,
  Menu,
  X,
  BarChart4,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';
import { notificationService } from '../../services/notificationService';
import companyLogo from '../../../images/logo.png';

const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // Keep admin shell responsive even if notification endpoint fails.
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Final check: only admins should ever see this layout
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart4 },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Challenges', path: '/admin/challenges', icon: Flag },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black flex flex-col font-mono selection:bg-neon-green/30 selection:text-neon-green overflow-x-hidden">
      {/* ── Background Grid (Global Decor) ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px]" />
      
      {/* ── Global Scanline Effect ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-gradient-to-b from-transparent via-neon-green/10 to-transparent bg-[length:100%_4px] animate-scanline" />

      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <img src={companyLogo} alt="FsocietyPK logo" className="w-8 h-8 object-contain" />
                <span className="font-display font-bold text-white tracking-widest hidden sm:block">FSOCIETY_ADMIN</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all uppercase tracking-wider",
                        isActive(item.path) 
                          ? "text-neon-green bg-neon-green/10 border border-neon-green/20" 
                          : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                      )}
                    >
                      <Icon size={14} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all uppercase tracking-wider border border-zinc-800"
              >
                <ChevronLeft size={14} />
                <span>Exit Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow z-10 relative">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.2em] font-mono z-10 bg-black">
        &copy; {new Date().getFullYear()} FSOCIETY_PK // ADMIN_SHELL // LOG_LEVEL_VERBOSE
      </footer>
    </div>
  );
};

export default AdminLayout;
