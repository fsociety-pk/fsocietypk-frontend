import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Trophy, User, LogOut, Menu, X, Bell, Folder } from 'lucide-react';
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

  // Fetch unread notification count
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        // Silently fail
      }
    };

    const handleUnreadCountUpdated = (
      event: Event
    ) => {
      const customEvent = event as CustomEvent<{ count: number }>;
      setUnreadCount(Number(customEvent.detail?.count ?? 0));
    };

    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    window.addEventListener(NOTIFICATION_UNREAD_COUNT_UPDATED, handleUnreadCountUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener(NOTIFICATION_UNREAD_COUNT_UPDATED, handleUnreadCountUpdated);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('DECONNECTED_SUCCESSFULLY');
      navigate('/login');
    } catch (error: any) {
      toast.error('LOGOUT_FAILURE');
    }
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'DASHBOARD', path: '/dashboard', icon: Terminal },
        { name: 'MISSIONS', path: '/challenges', icon: Shield },
        { name: 'HALL_OF_FAME', path: '/leaderboard', icon: Trophy },
        { name: 'SUBMIT_MISSION', path: '/submit-challenge', icon: Terminal },
        { name: 'PROJECTS', path: '/projects', icon: Folder },
      ]
    : [
        { name: 'LOGIN', path: '/login', icon: User },
        { name: 'JOIN_US', path: '/signup', icon: Terminal },
      ];

  if (user?.role === 'admin' && isAuthenticated) {
    navLinks.push({ name: 'ADMIN_CONTROL', path: '/admin', icon: Shield });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black/90 border-b border-neon-green/20 sticky top-0 z-50 backdrop-blur-xl group/nav">
      {/* Dynamic Scanline Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,65,0.05)_50%)] bg-[length:100%_4px] animate-scan-line" />
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 xl:px-8 2xl:px-12 relative z-10">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4 md:gap-8 lg:gap-12 xl:gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-8 lg:gap-12 min-w-0">
            <Link to="/" className="flex items-center gap-3 group/logo flex-shrink-0">
              <div className="relative w-10 h-10 bg-neon-green/5 rounded-full border border-neon-green/30 flex items-center justify-center group-hover/logo:bg-neon-green/10 transition-all duration-500 overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.1)] group-hover/logo:shadow-[0_0_25px_rgba(0,255,65,0.3)]">
                <img src={companyLogo} alt="FsocietyPK logo" className="w-8 h-8 object-contain rounded-full transition-transform duration-500 group-hover/logo:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-tr from-neon-green/20 to-transparent opacity-0 group-hover/logo:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg xl:text-xl font-display font-bold text-white tracking-[0.1em] xl:tracking-[0.25em] hidden sm:block">
                FSOCIETY<span className="text-neon-green text-glow animate-pulse">PK</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden xl:flex items-center gap-1 xl:gap-2 h-full">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-2 text-[10px] xl:text-[11px] font-mono font-bold tracking-[0.05em] xl:tracking-[0.15em] transition-all duration-300 group/link whitespace-nowrap overflow-hidden ${
                    isActive(link.path) ? 'text-neon-green' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  <link.icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-300 ${isActive(link.path) ? 'text-neon-green' : 'text-zinc-600 group-hover/link:text-neon-green'}`} />
                  <span className="relative z-10 uppercase">{link.name}</span>
                  
                  {/* Hover/Active Underline */}
                  <motion.div 
                    className={`absolute bottom-0 left-0 h-[2px] bg-neon-green shadow-neon-sm transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover/link:w-full'}`}
                  />
                  
                  {/* Subtle Background Glow on Hover */}
                  <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 -z-1" />
                </Link>
              ))}
            </div>
          </div>

          {/* User Section (Right Side) */}
          <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
            {isAuthenticated && (
              <div className="flex items-center h-full gap-4">
                <div className="h-8 w-px bg-zinc-800/50 mx-2" />
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 group border border-zinc-800/50 hover:border-neon-green/30 bg-zinc-900/30 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-zinc-900/50"
                >
                  <div className="relative w-8 h-8 rounded-full border border-zinc-800 group-hover:border-neon-green transition-all overflow-hidden flex-shrink-0 bg-black">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-neon-green/30 font-bold text-xs uppercase">
                        {user?.username?.[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[6px] xl:text-[7px] text-zinc-600 tracking-[0.2em] xl:tracking-[0.3em] font-black uppercase mb-1.5 group-hover:text-neon-green/50 transition-colors">ROOT_SESSION</span>
                    <span className="text-[10px] xl:text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors font-mono truncate leading-tight uppercase">{user?.username}</span>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to="/notifications"
                    className="relative p-2.5 text-zinc-500 hover:text-neon-green transition-all bg-zinc-900/50 rounded-lg border border-zinc-800/50 hover:border-neon-green/30 hover:shadow-neon-sm group h-10 w-10 flex items-center justify-center"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-neon-green text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-neon z-20"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-zinc-600 hover:text-red-500 transition-all bg-zinc-900/50 rounded-lg border border-zinc-800/50 hover:border-red-500/30 h-10 w-10 flex items-center justify-center"
                    title="TERMINATE_SESSION"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="flex items-center gap-4">
                 <Link to="/login" className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">LOGIN</Link>
                 <Link to="/signup" className="px-5 py-2 bg-neon-green/10 text-neon-green text-[10px] font-mono font-black tracking-[0.2em] rounded border border-neon-green/30 hover:bg-neon-green hover:text-black transition-all shadow-neon-sm hover:shadow-neon">JOIN_US</Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="xl:hidden flex items-center">
            {isAuthenticated && unreadCount > 0 && (
              <div className="mr-4 w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-neon" />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-zinc-500 hover:text-neon-green bg-zinc-900/50 border border-zinc-800/50 rounded-lg transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="xl:hidden bg-zinc-950/98 border-t border-zinc-900 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-8 space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 ${
                      isActive(link.path) 
                        ? 'bg-neon-green/10 border-neon-green/30 text-neon-green shadow-neon-sm' 
                        : 'border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive(link.path) ? 'text-neon-green' : 'text-zinc-500'}`} />
                    <span className="font-mono tracking-[0.2em] text-xs font-black uppercase">{link.name}</span>
                  </Link>
                ))}
              </div>
              
              {isAuthenticated && (
                <div className="pt-6 border-t border-zinc-900 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-zinc-800 bg-black flex items-center justify-center p-0.5 group-hover:border-neon-green transition-all shadow-neon-sm">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <User className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none mb-1">{user?.username}</span>
                        <span className="text-[8px] text-zinc-600 font-mono tracking-tighter uppercase">OPERATOR_ACCESS</span>
                      </div>
                    </Link>
                    
                    <div className="flex gap-2">
                       <Link 
                          to="/notifications" 
                          onClick={() => setIsOpen(false)}
                          className="relative p-3 text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-xl"
                        >
                          <Bell className="w-5 h-5" />
                          {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-neon-green rounded-full shadow-neon" />}
                       </Link>
                       <button
                        onClick={handleLogout}
                        className="p-3 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 active:scale-95 transition-transform"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
