import { useSurfaceMotion } from './hooks/useSurfaceMotion';
import { Suspense, lazy, useEffect } from "react";
import PageState from "./components/common/PageState";
import { Routes, Route, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuthStore } from "./store/authStore";
import { authService } from "./services/auth.service";

// ── Layouts & Components ────────────────────────────────────────
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";

// ── Pages ────────────────────────────────────────────────────────
const Support = lazy(() => import("./pages/Support"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Challenges = lazy(() => import("./pages/Challenges"));
const ChallengeDetail = lazy(() => import("./pages/ChallengeDetail"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Writeups = lazy(() => import("./pages/Writeups"));
const WriteupDetail = lazy(() => import("./pages/WriteupDetail"));
const MySubmissions = lazy(() => import("./pages/MySubmissions"));
const CommunityReviews = lazy(() => import("./pages/admin/CommunityReviews"));
const SubmitWriteup = lazy(() => import("./pages/SubmitWriteup"));
const AdminRoles = lazy(() => import("./pages/admin/Roles"));
const BackendSystem = lazy(() => import("./pages/admin/System"));
const AdminSecurity = lazy(() => import("./pages/admin/Security"));
const AdminChallengeEditor = lazy(() => import("./pages/admin/ChallengeEditor"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageChallenges = lazy(() => import("./pages/admin/ManageChallenges"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const SubmitChallenge = lazy(() => import("./pages/SubmitChallenge"));
const Projects = lazy(() => import("./pages/Projects"));
const ManageProjects = lazy(() => import("./pages/admin/ManageProjects"));
const AboutAdmin = lazy(() => import("./pages/AboutAdmin"));
const AboutTeamManager = lazy(() => import('./pages/admin/AboutTeamManager'));
const AdminAboutAdmin = lazy(() => import("./pages/admin/AdminAboutAdmin"));
const Resources = lazy(() => import("./pages/Resources"));
const NotFound = lazy(() => import('./pages/NotFound'));

import { API_URL } from "./services/apiConfig";

function App() {
  useSurfaceMotion();
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const socket = io(API_URL || window.location.origin, {
      withCredentials: true,
    });

    socket.on("newAnnouncement", (data: { title: string; message: string }) => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-background/90 border border-orange-500/50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 font-sans`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-orange-500 font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-text-primary uppercase tracking-tighter">
                    Update: {data.title}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary leading-relaxed uppercase">
                    {data.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-surface-border/10">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-semibold text-orange-500 hover:text-orange-400 focus:outline-none"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        { duration: 10000, position: "top-right" },
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // Remove the legacy persisted user; only /auth/me establishes authentication.
    try {
      localStorage.removeItem("fsocietypk-auth");
    } catch {
      // Authentication also works when browser storage is unavailable.
    }
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const initAuth = async () => {
      setLoading(true);

      try {
        const response = await authService.getMe(controller.signal);
        if (!active) return;
        // getMe returns user directly in data, not wrapped in { user }
        setUser(response.data);
      } catch (error: any) {
        if (!active) return;
        setUser(null);
        // Silently handle 401 on initial load (user not logged in)
        if (
          error.response?.status === 401 &&
          !["/login", "/signup"].includes(window.location.pathname)
        ) {
          // Only show toast if it's a session expired (not initial load)
          if (error.response?.data?.message?.includes("expired")) {
            toast.error("Your session expired. Please log in again.", { id: "session-expired" });
          }
        }
      } finally {
        clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    };

    initAuth();
    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [setUser, setLoading]);

  return (
    <>
      <Suspense fallback={<PageState loading fullPage />}>
        <Routes>
            {/* Admin pages */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="support" element={<Support admin />} />
              <Route path="profile" element={<AdminAboutAdmin />} />
              <Route path="team" element={<AboutTeamManager />} />
              <Route path="reviews" element={<CommunityReviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="challenges" element={<ManageChallenges />} />
              <Route path="challenges/new" element={<SubmitChallenge />} />
              <Route path="challenges/:id" element={<AdminChallengeEditor />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="system" element={<BackendSystem />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="projects" element={<ManageProjects />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          <Route element={<MainLayout />}>
            {/* Public Entrance */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Auth Routes (Public but redirected if logged in) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Public Area */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/resources" element={<Resources />} />

            {/* Protected Area */}
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Challenges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges/:id"
              element={
                <ProtectedRoute>
                  <ChallengeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route
              path="/submit-challenge"
              element={
                <ProtectedRoute>
                  <SubmitChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-writeup"
              element={
                <ProtectedRoute>
                  <SubmitWriteup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/writeups"
              element={
                <ProtectedRoute>
                  <Writeups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/writeups/challenge/:challengeId"
              element={
                <ProtectedRoute>
                  <Writeups />
                </ProtectedRoute>
              }
            />

            <Route
              path="/writeups/:id"
              element={
                <ProtectedRoute>
                  <WriteupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions"
              element={
                <ProtectedRoute>
                  <MySubmissions />
                </ProtectedRoute>
              }
            />

            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/about-admin" element={<ProtectedRoute><AboutAdmin /></ProtectedRoute>} />


          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
