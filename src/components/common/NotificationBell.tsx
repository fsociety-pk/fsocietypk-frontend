import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { NOTIFICATION_RECEIVED, useUnreadNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../store/authStore';
import '../../styles/notifications.css';

export default function NotificationBell({ to = '/notifications', label = 'Notifications' }: { to?: string; label?: string }) {
  const userId = useAuthStore(state => state.user?._id);
  const { data, isChanging } = useUnreadNotifications();
  const unread = data ?? 0;
  const previous = useRef<{ userId?: string; count?: number }>({});
  const [arrival, setArrival] = useState(0);
  const lastLiveArrival = useRef(0);
  useEffect(() => {
    const receive = (event: Event) => {
      if ((event as CustomEvent<{ userId: string }>).detail.userId !== userId) return;
      lastLiveArrival.current = Date.now();
      setArrival(value => value + 1);
    };
    window.addEventListener(NOTIFICATION_RECEIVED, receive);
    return () => window.removeEventListener(NOTIFICATION_RECEIVED, receive);
  }, [userId]);
  useEffect(() => {
    if (!isChanging && Date.now() - lastLiveArrival.current > 1000 && previous.current.userId === userId && previous.current.count !== undefined && data !== undefined && data > previous.current.count) {
      setArrival(value => value + 1);
    }
    previous.current = { userId, count: data };
  }, [data, userId, isChanging]);
  return <Link to={to} className="icon-button notification-bell" aria-label={`${label}${unread ? `, ${unread} unread` : ''}`}>
    <span key={arrival} className={`notification-bell-symbol${arrival ? ' has-arrival' : ''}`} aria-hidden="true"><Bell size={17} /></span>
    {unread > 0 && <span className="notification-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{data !== undefined ? `${unread} unread notifications` : ''}</span>
  </Link>;
}
