import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return (
    <div>
      <nav className="admin-subnav" aria-label="Admin navigation">
        {[
          ["/admin", "Overview"],
          ["/admin/challenges", "Challenges"],
          ["/admin/reviews", "Community reviews"],
          ["/admin/users", "Users"],
          ["/admin/projects", "Projects"],
          ["/admin/analytics", "Analytics"],
          ["/admin/settings", "Settings"],
          ["/admin/profile", "Admin profile"],
        ].map(([to, label]) => (
          <NavLink key={to} to={to} end={to === "/admin"}>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-body">
        <Outlet />
      </div>
    </div>
  );
}
