import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { challengeService } from '../../services/challenge.service';
import { socketService } from '../../utils/socket';

export default function LiveSolveFeed() {
  const [, setTick] = useState(0);
  const [connected, setConnected] = useState(false);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['community-solves'], queryFn: challengeService.getRecentActivity,
    select: response => response.data, refetchInterval: 30000,
  });
  useEffect(() => {
    const refresh = () => { void refetch(); };
    const online = () => { setConnected(true); refresh(); };
    const offline = () => setConnected(false);
    socketService.on('leaderboardUpdate', refresh);
    socketService.on('connect', online);
    socketService.on('disconnect', offline);
    setConnected(socketService.isConnected());
    // Refresh relative timestamps even when the order of solves has not changed.
    const timer = window.setInterval(() => setTick(value => value + 1), 30000);
    return () => {
      clearInterval(timer);
      socketService.off('leaderboardUpdate', refresh); socketService.off('connect', online); socketService.off('disconnect', offline);
    };
  }, [refetch]);
  return <section className="live-solves overview-panel" aria-labelledby="community-solves-heading">
    <div className="overview-feed-heading"><h2 id="community-solves-heading">Recent solves</h2><span className="live-status"><Radio size={13} aria-hidden="true" />{connected ? 'Live' : 'Every 30s'}</span></div>
    {isLoading ? <p className="overview-feed-state" role="status">Loading recent solves…</p> : isError ? <div className="overview-feed-state" role="alert"><p>Recent solves couldn’t be loaded.</p><button className="btn-outline" onClick={() => void refetch()}>Try again</button></div> : !data.length ? <p className="overview-feed-state">No recent solves yet. The next one could be yours.</p> :
      <ol className="solve-feed" tabIndex={0} aria-label="Latest community challenge solves">{data.slice(0, 12).map(solve => <li key={solve.id}>
        <span className="solve-feed-avatar" aria-hidden="true">{solve.username.slice(0, 1).toUpperCase()}</span>
        <div className="solve-feed-copy"><p><Link to={`/profile/${encodeURIComponent(solve.username)}`}>@{solve.username}</Link> solved <Link to={`/challenges/${solve.challengeId}`}>{solve.challengeTitle}</Link></p><time dateTime={solve.timestamp} title={new Date(solve.timestamp).toLocaleString()}>{formatDistanceToNow(new Date(solve.timestamp), { addSuffix: true })}</time></div>
      </li>)}</ol>}
    <Link to="/leaderboard" className="overview-feed-footer">View Hall of Fame<ArrowUpRight size={14} aria-hidden="true" /></Link>
  </section>;
}
