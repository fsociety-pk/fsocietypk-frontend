import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Trash2,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { notificationService, INotification } from '../services/notificationService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let data;
      if (filter === 'unread') {
        data = await notificationService.getNotifications({ read: false });
      } else if (filter === 'read') {
        data = await notificationService.getNotifications({ read: true });
      } else {
        data = await notificationService.getNotifications();
      }
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      toast.success('Marked as read');
    } catch (error: any) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error: any) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error: any) {
      toast.error('Failed to clear notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'challenge_rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'challenge_submitted':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'challenge_solved':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-neon-green" />;
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
        return 'bg-zinc-900/40 border-zinc-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-8 md:px-8 md:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neon-green/30 bg-neon-green/10">
              <Bell className="h-5 w-5 text-neon-green" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-zinc-400">Updates about your challenges and account</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-4 sm:mb-6">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`min-h-11 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  filter === f
                    ? 'bg-neon-green text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-neon-green/50'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex min-h-11 items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
              >
                <CheckCheck className="w-3 sm:w-4 h-3 sm:h-4" />
                MARK ALL READ
              </button>
              <button
                onClick={handleClearAll}
                className="flex min-h-11 items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                CLEAR ALL
              </button>
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">No notifications yet</p>
            <p className="text-zinc-600 text-sm mt-2">
              {filter === 'unread' && 'All caught up!'}
              {filter === 'read' && 'No read notifications'}
              {filter === 'all' && 'Stay tuned for updates about your challenges'}
            </p>
          </motion.div>
        )}

        {/* Notifications List */}
        <AnimatePresence>
          <div className="space-y-3">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border p-4 transition-colors sm:p-5 ${
                  notif.read
                    ? 'bg-zinc-900/30 border-zinc-800/30'
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
                          notif.read ? 'text-zinc-400' : 'text-white'
                        }`}>
                          {notif.title}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <div className="w-2 h-2 bg-neon-green rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800/30">
                      <span className="text-[10px] text-zinc-600">
                        {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            aria-label={`Mark ${notif.title} as read`}
                            className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-neon-green/10 hover:text-neon-green"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif._id)}
                          aria-label={`Delete ${notif.title}`}
                          className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
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
