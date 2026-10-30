import { useEffect } from 'react';
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { notificationService, type INotification } from '../services/notificationService';
import { socketService } from '../utils/socket';

export const NOTIFICATION_RECEIVED = 'notification-received';

const keys = (userId?: string) => ({
  all: ['notifications', userId] as const,
  list: ['notifications', userId, 'list'] as const,
  count: ['notifications', userId, 'count'] as const,
  mutation: ['notification-action', userId] as const,
});

export function useUnreadNotifications() {
  const userId = useAuthStore(state => state.user?._id);
  const pending = useIsMutating({ mutationKey: keys(userId).mutation });
  const query = useQuery({
    queryKey: keys(userId).count,
    queryFn: ({ signal }) => notificationService.getUnreadCount(signal),
    enabled: !!userId && !pending,
    staleTime: 15000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  return { ...query, isChanging: !!pending };
}

/** One authenticated connection updates the member and staff inboxes and bells. */
export function useNotificationSync() {
  const userId = useAuthStore(state => state.user?._id);
  const client = useQueryClient();
  useEffect(() => {
    const key = keys(userId);
    const refresh = () => {
      if (userId && !client.isMutating({ mutationKey: key.mutation })) {
        void client.invalidateQueries({ queryKey: key.all });
      }
    };
    const received = new Set<string>();
    const incoming = (notification: INotification) => {
      if (!userId || notification.userId !== userId || received.has(notification._id)) return;
      received.add(notification._id);
      if (received.size > 1000) received.delete(received.values().next().value!);
      const previous = client.getQueryData<INotification[]>(key.list);
      if (previous?.some(item => item._id === notification._id)) { refresh(); return; }
      // Abort older snapshots so they cannot overwrite this arrival.
      void client.cancelQueries({ queryKey: key.all });
      if (previous) client.setQueryData(key.list, [notification, ...previous]);
      const count = client.getQueryData<number>(key.count);
      if (count !== undefined) client.setQueryData(key.count, count + (notification.read ? 0 : 1));
      if (count === undefined || !previous) refresh();
      if (!notification.read) window.dispatchEvent(new CustomEvent(NOTIFICATION_RECEIVED, { detail: { userId } }));
    };
    socketService.on('notificationCreated', incoming);
    socketService.on('notificationsChanged', refresh);
    socketService.on('connect', refresh);
    // Reauthenticate the existing socket when login/logout changes its cookie.
    socketService.reconnect();
    return () => {
      socketService.off('notificationCreated', incoming);
      socketService.off('notificationsChanged', refresh);
      socketService.off('connect', refresh);
      void client.cancelQueries({ queryKey: key.all });
      client.removeQueries({ queryKey: key.all });
    };
  }, [userId, client]);
}

type Action = { type: 'read'; id: string; read: boolean } | { type: 'delete'; id: string }
  | { type: 'readAll' | 'clear'; ids: string[] };

export function useNotifications() {
  const userId = useAuthStore(state => state.user?._id);
  const client = useQueryClient();
  const key = keys(userId);
  const pending = useIsMutating({ mutationKey: key.mutation });
  const query = useQuery({
    queryKey: key.list,
    queryFn: ({ signal }) => notificationService.getNotifications(undefined, signal),
    enabled: !!userId && !pending,
    staleTime: 15000,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  const mutation = useMutation({
    mutationKey: key.mutation,
    mutationFn: (action: Action) => {
      switch (action.type) {
        case 'read': return notificationService.setRead(action.id, action.read).then(() => {});
        case 'delete': return notificationService.deleteNotification(action.id);
        case 'readAll': return notificationService.markAllAsRead(action.ids);
        case 'clear': return notificationService.clearAll(action.ids);
      }
    },
    onMutate: async (action: Action) => {
      await client.cancelQueries({ queryKey: key.all });
      const previous = client.getQueryData<INotification[]>(key.list) || [];
      const affected = previous.filter(item => 'id' in action ? item._id === action.id : action.ids.includes(item._id));
      const ids = new Set(affected.map(item => item._id));
      const next = previous.flatMap(item => {
        if (!ids.has(item._id)) return [item];
        if (action.type === 'clear' || action.type === 'delete') return [];
        return [{ ...item, read: action.type === 'read' ? action.read : true }];
      });
      const delta = next.filter(item => !item.read).length - previous.filter(item => !item.read).length;
      client.setQueryData(key.list, next);
      client.setQueryData<number>(key.count, count => Math.max(0, (count ?? previous.filter(item => !item.read).length) + delta));
      return { affected, delta };
    },
    onError: (_error, _action, context) => {
      if (context) {
        const originals = new Map(context.affected.map(item => [item._id, item]));
        client.setQueryData<INotification[]>(key.list, current => {
          const restored = (current || []).map(item => originals.get(item._id) || item);
          const present = new Set(restored.map(item => item._id));
          return [...restored, ...context.affected.filter(item => !present.has(item._id))]
            .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
        });
        client.setQueryData<number>(key.count, count => Math.max(0, (count ?? 0) - context.delta));
      }
      toast.error('Could not save that change. Please try again.');
    },
    onSettled: () => { void client.invalidateQueries({ queryKey: key.all }); },
  });
  return { ...query, mutation };
}
