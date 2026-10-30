import { hasPermission, ROLE_LABELS } from '../../utils/roles';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { ChevronRight, LogOut, Menu, Plus, ShieldCheck, X } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { adminNavigation } from './adminNavigation';
import BrandLogo from '../common/BrandLogo';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/admin.css';

function AdminBrand() {
  return <Link to="/admin" className="admin-brand" aria-label="Fsociety PK administration"><BrandLogo /><span>Fsociety<small>Administration</small></span></Link>;
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore(state => state.user?.role);
  return <nav className="admin-nav" aria-label="Admin navigation">{['Platform', 'Workspace'].map(group => <div key={group}>
    <p className="admin-nav-group">{group}</p>
    {adminNavigation.filter(item => item.group === group && (!item.permission || hasPermission(role, item.permission))).map(({ to, label, icon: Icon }) => <NavLink to={to} end={to === '/admin'} key={to} onClick={onNavigate}><Icon size={18} /><span>{label}</span></NavLink>)}
  </div>)}</nav>;
}
export default function AdminLayout() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const current = adminNavigation.find(item => item.to !== '/admin' && pathname.startsWith(item.to));
  const title = pathname === '/admin/challenges/new' ? 'Create challenge' : current?.label || 'Overview';
  const required = pathname === '/admin/challenges/new' ? 'challenges.write' : current?.permission;
  const permitted = !required || hasPermission(user?.role, required);
  const closeNavigation = () => dialog.current?.close();
  useEffect(() => { dialog.current?.close(); window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  const signOut = async () => {
    setLoggingOut(true);
    try { await authService.logout(); client.clear(); logout(); navigate('/login', { replace: true }); toast.success('You are signed out.'); }
    catch { toast.error('Could not sign out. Please try again.'); }
    finally { setLoggingOut(false); }
  };
  const footer = <div className="admin-sidebar-footer"><div className="admin-access-note"><ShieldCheck size={17} /><div><strong>Staff access</strong><small>Platform management workspace</small></div></div><button onClick={signOut} disabled={loggingOut}><LogOut size={17} />{loggingOut ? 'Signing out…' : 'Sign out'}</button></div>;
  return <MotionConfig reducedMotion="user"><div className="admin-shell">
    <a href="#admin-content" className="skip-link">Skip to admin content</a>
    <aside className="admin-sidebar"><AdminBrand /><Navigation />{footer}</aside>
    <dialog ref={dialog} className="admin-mobile-navigation" aria-label="Admin navigation drawer"><div className="admin-drawer-heading"><AdminBrand /><button className="icon-button" onClick={closeNavigation} aria-label="Close admin navigation"><X size={19} /></button></div><Navigation onNavigate={closeNavigation} />{footer}</dialog>
    <div className="admin-main">
      <header className="admin-header"><div className="admin-breadcrumb"><button className="icon-button admin-menu-toggle" onClick={() => dialog.current?.showModal()} aria-label="Open admin navigation"><Menu size={19} /></button><span>Administration</span><ChevronRight size={14} /><strong>{title}</strong></div><div className="admin-header-actions">
        {hasPermission(user?.role, 'challenges.write') && <Link to="/admin/challenges/new" className="btn-primary admin-create" aria-label="Create challenge"><Plus size={16} /><span>Create challenge</span></Link>}
        <ThemeToggle /><NotificationBell to="/admin/notifications" label="Admin notifications" />
        <Link to="/admin/security" className="admin-identity" aria-label={`Staff account: ${user?.username}`}><span><ShieldCheck size={19} /></span><div><strong>{user?.username}</strong><small>{user ? ROLE_LABELS[user.role] : 'Staff'}</small></div></Link>
      </div></header>
      <main id="admin-content" className="admin-content" tabIndex={-1}><>{permitted ? <Outlet /> : <section className="admin-form-panel"><h1>Access is restricted</h1><p>Your assigned role does not include this tool.</p><Link className="btn-primary" to="/admin">Back to overview</Link></section>}</></main>
      <footer className="admin-footer"><span>Fsociety PK administration</span><Link to="/admin/security"><ShieldCheck size={13} /> Account security</Link></footer>
    </div>
  </div></MotionConfig>;
}
