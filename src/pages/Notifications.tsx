import { useAuthStore } from '../store/authStore';
import { isStaff } from '../utils/roles';
import PageHeading from "../components/common/PageHeading";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Mail,
  Trash2,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const Notifications: React.FC = () => {
  const staff = isStaff(useAuthStore(state => state.user?.role));
  const { data = [], isLoading: loading, isError, refetch, mutation } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const notifications = data.filter(item => filter === 'all' || item.read === (filter === 'read'));
  const busy = mutation.isPending;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_approved':
        return <CheckCircle2 className="w-5 h-5 text-status-success" />;
      case 'challenge_rejected':
        return <XCircle className="w-5 h-5 text-status-error" />;
      case 'challenge_submitted':
        return <AlertCircle className="w-5 h-5 text-status-info" />;
      case 'challenge_solved':
        return <Trophy className="w-5 h-5 text-status-warning" />;
      default:
        return <Bell className="w-5 h-5 text-brand" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'challenge_approved':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'challenge_rejected':
        return 'bg-red-500/10 border-red-500/30';
      case 'challenge_submitted':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'challenge_solved':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-background-elevated/40 border-surface-border/50';
    }
  };

  return (
    <div className="page-wrap">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <PageHeading eyebrow="Your updates" title="Notifications" description={staff ? "Platform submissions, announcements, and staff alerts." : "Updates about your challenges and submissions."} />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-4 sm:mb-6">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-brand text-on-brand'
                    : 'bg-background-elevated text-text-secondary border border-surface-border hover:border-brand/50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Actions */}
          {data.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                onClick={() => mutation.mutate({ type: 'readAll', ids: data.filter(item => !item.read).map(item => item._id) })}
                disabled={busy || !data.some(item => !item.read)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-600/20 border border-blue-500/50 rounded text-xs sm:text-xs font-bold text-status-info hover:bg-blue-600/30 transition-all"
              >
                <CheckCheck className="w-3 sm:w-4 h-3 sm:h-4" />
                Mark all as read
              </button>
              <button
                onClick={() => mutation.mutate({ type: 'clear', ids: data.map(item => item._id) })}
                disabled={busy}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-red-600/20 border border-red-500/50 rounded text-xs sm:text-xs font-bold text-status-error hover:bg-red-600/30 transition-all"
              >
                <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
          </div>
        )}

        {isError && <div className="notification-error" role="alert">Notifications could not be refreshed. <button className="btn-outline" onClick={() => void refetch()}>Try again</button></div>}
        {/* Empty State */}
        {!loading && !isError && notifications.length === 0 && (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bell className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No notifications yet</p>
            <p className="text-text-muted text-sm mt-2">
              {filter === 'unread' && 'All caught up!'}
              {filter === 'read' && 'No read notifications'}
              {filter === 'all' && 'Stay tuned for updates about your challenges'}
            </p>
          </motion.div>
        )}

        {/* Notifications List */}
        <AnimatePresence>
          <div className="space-y-3" aria-busy={busy}>
            {notifications.map(notif => (
              <motion.div
                key={notif._id}
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: .15 }}
                data-notification-id={notif._id}
                data-read={notif.read}
                className={`notification-card border rounded-lg p-4 transition-all ${
                  notif.read
                    ? 'bg-background-elevated/30 border-surface-border/30'
                    : `${getNotificationBgColor(notif.type)} active:scale-95`
                } ${!notif.read ? 'border-solid' : 'border-dashed'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-bold text-sm uppercase tracking-widest ${
                          notif.read ? 'text-text-secondary' : 'text-text-primary'
                        }`}>
                          {notif.title}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/30">
                      <span className="text-xs text-text-muted">
                        {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                          <button
                            onClick={() => mutation.mutate({ type: 'read', id: notif._id, read: !notif.read })}
                            disabled={busy}
                            className="p-1.5 text-text-muted hover:text-brand hover:bg-brand/10 rounded transition-all"
                            title={notif.read ? 'Mark as unread' : 'Mark as read'}
                            aria-label={notif.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notif.read ? <Mail className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        <button
                          onClick={() => mutation.mutate({ type: 'delete', id: notif._id })}
                          disabled={busy}
                          className="p-1.5 text-text-muted hover:text-status-error hover:bg-red-500/10 rounded transition-all"
                          title="Delete"
                            aria-label="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
