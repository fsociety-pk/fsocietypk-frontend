import { lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from './store/authStore';
import { authService } from './services/auth.service';

// ── Layouts & Components ────────────────────────────────────────
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// ── Pages ────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Challenges = lazy(() => import('./pages/Challenges'));
const ChallengeDetail = lazy(() => import('./pages/ChallengeDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Profile = lazy(() => import('./pages/Profile'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Writeups = lazy(() => import('./pages/Writeups'));
const SubmitWriteup = lazy(() => import('./pages/SubmitWriteup'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageChallenges = lazy(() => import('./pages/admin/ManageChallenges'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const SubmitChallenge = lazy(() => import('./pages/SubmitChallenge'));
const Projects = lazy(() => import('./pages/Projects'));
const ManageProjects = lazy(() => import('./pages/admin/ManageProjects'));
const Resources = lazy(() => import('./pages/Resources'));

import { API_URL } from './services/apiConfig';

function App() {
  const { user, setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const socket = io(API_URL || window.location.origin, {
      withCredentials: true,
    });

    socket.on('newAnnouncement', (data: { title: string; message: string }) => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-background-card border border-neon-green/30 shadow-card rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                   <span className="text-neon-green font-bold">!</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white">
                  ANNOUNCEMENT: {data.title}
                </p>
                <p className="mt-1 text-sm text-zinc-300 leading-relaxed">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/10">
            <button
              onClick={() => toast.dismiss(t.id)}
            className="min-h-11 border-l border-surface-border px-4 text-xs font-semibold text-neon-green hover:text-white focus:outline-none"
            >
              ACK
            </button>
          </div>
        </div>
      ), { duration: 10000, position: 'top-right' });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Set 10 second timeout for auth check
      const timeoutId = setTimeout(() => {
        console.warn('Auth check timed out after 10s');
        setLoading(false);
      }, 10000);

      try {
        const response = await authService.getMe();
        clearTimeout(timeoutId);
        // getMe returns user directly in data, not wrapped in { user }
        setUser(response.data);
      } catch (error: any) {
        clearTimeout(timeoutId);
        setUser(null);
        // Silently handle 401 on initial load (user not logged in)
        if (error.response?.status === 401 && !['/login', '/signup'].includes(window.location.pathname)) {
          // Only show toast if it's a session expired (not initial load)
          if (error.response?.data?.message?.includes('expired')) {
            toast.error('SESSION_EXPIRED', { id: 'session-expired' });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Check if stored auth is valid before attempting verification
    const storedAuth = localStorage.getItem('fsocietypk-auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        // Only verify if we have a valid user object
        if (parsed.state?.user?.username && parsed.state?.user?._id) {
          initAuth();
        } else {
          // Invalid stored auth state - clear and skip verification
          localStorage.removeItem('fsocietypk-auth');
          setLoading(false);
        }
      } catch (error) {
        // Corrupted localStorage - clear it and skip verification
        console.warn('Corrupted auth storage, clearing...');
        localStorage.removeItem('fsocietypk-auth');
        setLoading(false);
      }
    } else {
      // No stored auth, quick verification
      initAuth();
    }
  }, [setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-mono">
        <div className="text-center">
          <p className="text-2xl text-neon-green animate-pulse tracking-widest">
            AUTHENTICATING...
          </p>
          <div className="mt-4 w-48 h-1 bg-zinc-900 mx-auto overflow-hidden">
             <div className="h-full bg-neon-green animate-progress" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Entrance */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth Routes (Public but redirected if logged in) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Public Area */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/resources" element={<Resources />} />

          {/* Protected Area */}
          <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/submit-challenge" element={<ProtectedRoute><SubmitChallenge /></ProtectedRoute>} />
          <Route path="/submit-writeup" element={<ProtectedRoute><SubmitWriteup /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/writeups" element={<ProtectedRoute><Writeups /></ProtectedRoute>} />
          <Route path="/writeups/challenge/:challengeId" element={<ProtectedRoute><Writeups /></ProtectedRoute>} />

          {/* Admin Command Center */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="challenges" element={<ManageChallenges />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="projects" element={<ManageProjects />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 Rescue */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}


export default App;
