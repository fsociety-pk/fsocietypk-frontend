import PageHeading from "../../components/common/PageHeading";
import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, RefreshCw, ShieldCheck, Megaphone, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationService } from '../../services/notificationService';
import { adminService } from '../../services/adminService';

const AdminSettings: React.FC = () => {
  const [isWorking, setIsWorking] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState({ title: '', message: '' });

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) {
      return toast.error('Please fill in all fields');
    }

    try {
      setIsWorking(true);
      await adminService.createAnnouncement(announcement);
      toast.success('Announcement broadcasted successfully');
      setAnnouncement({ title: '', message: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send announcement');
    } finally {
      setIsWorking(false);
    }
  };

  const runAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
    try {
      setIsWorking(true);
      await action();
      toast.success(successMessage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || errorMessage);
    } finally {
      setIsWorking(false);
    }
  };

  const handleMarkAllRead = () =>
    runAction(
      () => notificationService.markAllAsRead(),
      'All notifications marked as read',
      'Failed to mark notifications as read'
    );

  const handleClearAll = () => {
    const confirmed = window.confirm('Clear all notifications from your account?');
    if (!confirmed) return;

    runAction(() => notificationService.clearAll(), 'All notifications cleared', 'Failed to clear notifications');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <div>
        <PageHeading eyebrow="Admin workspace" title="Settings" description="Manage your notifications and post community updates." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-text-primary uppercase tracking-widest">Notification Controls</h2>
              <p className="text-xs text-text-muted font-sans uppercase">Manage your admin notification center</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleMarkAllRead}
              disabled={isWorking}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-status-info hover:bg-blue-500/20 transition-all text-xs font-semibold tracking-widest disabled:opacity-60"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>

            <button
              onClick={handleClearAll}
              disabled={isWorking}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-status-error/30 bg-status-error/10 text-status-error hover:bg-status-error/20 transition-all text-xs font-semibold tracking-widest disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              Clear all notifications
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-text-primary uppercase tracking-widest">Admin Session</h2>
              <p className="text-xs text-text-muted font-sans uppercase">Refresh these pages</p>
            </div>
          </div>

          <button
            onClick={handleReload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-brand/30 bg-brand/10 text-brand hover:bg-brand/20 transition-all text-xs font-semibold tracking-widest"
          >
            <RefreshCw className="w-4 h-4" />
            Reload admin pages
          </button>

          <p className="text-xs text-text-muted font-sans leading-relaxed">
            Reload the page to get the latest data.
          </p>
        </motion.section>

        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 space-y-4 lg:col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-text-primary uppercase tracking-widest">Community announcements</h2>
              <p className="text-xs text-text-muted font-sans uppercase">Send an update to all members</p>
            </div>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest text-text-muted uppercase">Announcement Title</label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                className="w-full bg-background/40 border border-surface-border rounded-lg px-4 py-3 text-text-primary focus:border-brand/50 focus:outline-none transition-all font-sans text-sm"
                placeholder="Platform update"
                disabled={isWorking}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest text-text-muted uppercase">Message Content</label>
              <textarea
                rows={4}
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                className="w-full bg-background/40 border border-surface-border rounded-lg px-4 py-3 text-text-primary focus:border-brand/50 focus:outline-none transition-all font-sans text-sm"
                placeholder="Write an update for the community."
                disabled={isWorking}
              />
            </div>
            <button
              type="submit"
              disabled={isWorking}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand text-on-brand hover:shadow-sm transition-all text-xs font-semibold tracking-widest disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              Post announcement
            </button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminSettings;
