import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Navbar from './Navbar';
import SideNavigation from './SideNavigation';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const hideSideNavigation = ['/login', '/signup', '/dashboard'].includes(location.pathname) || location.pathname.startsWith('/admin');

  React.useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black flex flex-col font-mono selection:bg-neon-green/30 selection:text-neon-green overflow-x-hidden">
      {/* ── Background Grid (Global Decor) ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px]" />
      
      {/* ── Global Scanline Effect ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-gradient-to-b from-transparent via-neon-green/10 to-transparent bg-[length:100%_4px] animate-scanline" />

      <Navbar />

      {!hideSideNavigation && (
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 z-[60] rounded-full border border-neon-green/30 bg-zinc-950 p-3 text-neon-green shadow-lg shadow-black/30 transition-colors hover:bg-zinc-900 lg:hidden"
          aria-label={isMobileSidebarOpen ? 'Close side navigation' : 'Open side navigation'}
        >
          {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      <div className="flex-grow z-10 flex">
        {!hideSideNavigation && (
          <SideNavigation
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <main className="flex-grow min-w-0">
          <Outlet />
        </main>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-zinc-900 text-center text-[10px] text-zinc-600 tracking-[0.2em] font-mono z-10 bg-black">
        &copy; {new Date().getFullYear()} FSOCIETY_PK // SYSTEM_ONLINE // SECURE_COMMUNICATIONS_ONLY
      </footer>
    </div>
  );
};

export default MainLayout;
