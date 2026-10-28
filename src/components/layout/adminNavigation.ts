import { Headphones, LayoutDashboard, Flag, BookOpen, Users, FolderKanban, BarChart3, Megaphone, ShieldCheck, ContactRound, Bell, UserCog, Activity, type LucideIcon } from 'lucide-react';
import type { Permission } from '../../utils/roles';
export const adminNavigation: { to: string; label: string; description: string; icon: LucideIcon; group: string; permission?: Permission }[] = [
  { to: '/admin', label: 'Overview', description: 'Platform activity and the review queue', icon: LayoutDashboard, group: 'Platform', permission: 'overview' },
  { to: '/admin/support', label: 'Support inbox', description: 'Read and respond to member requests', icon: Headphones, group: 'Platform', permission: 'support' },
  { to: '/admin/challenges', label: 'Challenges', description: 'Create, review, edit, and publish challenges', icon: Flag, group: 'Platform', permission: 'challenges.read' },
  { to: '/admin/reviews', label: 'Community reviews', description: 'Moderate writeups and learning resources', icon: BookOpen, group: 'Platform', permission: 'reviews' },
  { to: '/admin/users', label: 'Members', description: 'Search accounts and manage member access', icon: Users, group: 'Platform', permission: 'members' },
  { to: '/admin/projects', label: 'Projects', description: 'Create, update, and curate community tools', icon: FolderKanban, group: 'Platform', permission: 'projects' },
  { to: '/admin/analytics', label: 'Analytics', description: 'Understand growth and challenge activity', icon: BarChart3, group: 'Platform', permission: 'analytics' },
  { to: '/admin/settings', label: 'Announcements', description: 'Send updates and review broadcast history', icon: Megaphone, group: 'Workspace', permission: 'announcements' },
  { to: '/admin/roles', label: 'Staff & roles', description: 'Assign staff responsibilities and permissions', icon: UserCog, group: 'Workspace', permission: 'roles' },
  { to: '/admin/system', label: 'Backend status', description: 'Monitor your EC2 backend and email delivery', icon: Activity, group: 'Workspace', permission: 'system' },
  { to: '/admin/notifications', label: 'Notifications', description: 'Review alerts about platform activity', icon: Bell, group: 'Workspace' },
  { to: '/admin/profile', label: 'Admin profile', description: 'Manage the profile shown to your community', icon: ContactRound, group: 'Workspace', permission: 'profile' },
  { to: '/admin/security', label: 'Account security', description: 'Update your password and manage your session', icon: ShieldCheck, group: 'Workspace' },
];
