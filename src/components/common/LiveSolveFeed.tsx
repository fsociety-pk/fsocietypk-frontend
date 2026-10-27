import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { challengeService } from '../../services/challenge.service';
import { socketService } from '../../utils/socket';
import PageState from './PageState';

export default function LiveSolveFeed() {
  const reduced = useReducedMotion();
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
  return <section className="live-solves" aria-labelledby="community-solves-heading">
    <div className="section-title"><div><span className="eyebrow">Across the community</span><h2 id="community-solves-heading">Latest solves</h2></div><span className="live-status"><Radio size={14} />{connected ? 'Live updates' : 'Refreshes every 30s'}</span></div>
    {isLoading ? <PageState loading /> : isError ? <PageState title="Recent solves could not be loaded" retry={() => refetch()} /> : !data.length ? <div className="notice">The next solve could be yours. Completed challenges will appear here.</div> :
      <ol className="solve-feed" aria-label="Latest community challenge solves">{data.map(solve => <motion.li key={solve.id} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24 }}>
        <span className="solve-feed-mark"><Check size={16} /></span>
        <div className="solve-feed-copy"><p><Link to={`/profile/${encodeURIComponent(solve.username)}`}>@{solve.username}</Link> solved <Link to={`/challenges/${solve.challengeId}`}>{solve.challengeTitle}</Link></p><time dateTime={solve.timestamp} title={new Date(solve.timestamp).toLocaleString()}>{formatDistanceToNow(new Date(solve.timestamp), { addSuffix: true })}</time></div>
        <span className="solve-feed-points">+{solve.points} pts</span><Link className="solve-feed-open" aria-label={`Open ${solve.challengeTitle}`} to={`/challenges/${solve.challengeId}`}><ArrowUpRight size={17} /></Link>
      </motion.li>)}</ol>}
  </section>;
}
