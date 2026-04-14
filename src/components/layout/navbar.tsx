import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Trophy, User, LogOut, Menu, X, Bell, Folder } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { notificationService } from '../../services/notificationService';
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
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const count = await notificationService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          // Silently fail
        }
      };

      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
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
    <nav className="bg-black border-b border-neon-green/20 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-16">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-neon-green/10 rounded-full border border-neon-green/30 flex items-center justify-center group-hover:bg-neon-green/20 transition-all overflow-hidden shadow-neon-sm">
                <img src={companyLogo} alt="FsocietyPK logo" className="w-8 h-8 object-contain rounded-full" />
              </div>
              <span className="text-xl md:text-2xl font-display font-bold text-white tracking-[0.2em] hidden sm:block">
                FSOCIETY<span className="text-neon-green text-glow">PK</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2.5 px-1 py-1.5 text-[10px] font-mono font-bold tracking-[0.2em] transition-all hover:text-neon-green group/link ${
                    isActive(link.path) ? 'text-neon-green border-b-2 border-neon-green' : 'text-zinc-500'
                  }`}
                >
                  <link.icon className={`w-3.5 h-3.5 ${isActive(link.path) ? 'text-neon-green' : 'text-zinc-600 group-hover/link:text-neon-green'}`} />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Section (Right Side) */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <div className="flex items-center gap-6">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group border-r border-zinc-800 pr-6"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-neon-green transition-all overflow-hidden bg-gradient-to-br from-neon-green/10 to-transparent shadow-neon-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-zinc-500 group-hover:text-neon-green w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 tracking-tighter uppercase font-mono">OPERATOR</span>
                    <span className="text-[11px] font-bold text-white group-hover:text-neon-green transition-colors font-mono">{user?.username.toUpperCase()}</span>
                  </div>
                </Link>

                <div className="flex items-center gap-3">
                  <Link
                    to="/notifications"
                    className="relative p-2 text-zinc-500 hover:text-neon-green transition-colors bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-neon-green/30 group"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-neon"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-red-500/30"
                    title="LOGOUT"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="flex items-center gap-4">
                 <Link to="/login" className="text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">LOGIN</Link>
                 <Link to="/signup" className="px-4 py-2 bg-neon-green text-black text-[10px] font-mono font-black tracking-[0.2em] rounded border border-neon-green hover:bg-transparent hover:text-neon-green transition-all shadow-neon">JOIN_US</Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-500 hover:text-neon-green"
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
            className="md:hidden bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                    isActive(link.path) ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'border-zinc-800 text-zinc-400'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-mono tracking-widest text-sm">{link.name}</span>
                </Link>
              ))}
              
              {isAuthenticated && (
                <div className="pt-4 border-t border-zinc-800 space-y-3">
                  <Link to="/notifications" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:border-neon-green/30 hover:text-neon-green transition-all">
                    <div className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-bold">Notifications</span>
                  </Link>
                  
                  <div className="flex justify-between items-center px-2">
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-zinc-700 bg-black flex items-center justify-center shadow-neon-sm">
                        <User className="w-5 h-5 text-zinc-500" />
                      </div>
                      <span className="font-bold text-white text-sm uppercase font-mono">{user?.username}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-3 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
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
