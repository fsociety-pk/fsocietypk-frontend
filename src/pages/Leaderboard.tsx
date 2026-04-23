import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Calendar, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leaderboardService, LeaderboardEntry, LeaderboardFilter } from '../services/leaderboardService';
import { socketService } from '../utils/socket';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import Lottie from 'lottie-react';
import winnerBadge from '../../images/rank_1.json';
import podiumBadge from '../../images/rank_2and3.json';

const getCountryEmoji = (code: string) => {
  switch (code) {
    case 'US': return '🇺🇸';
    case 'GB': return '🇬🇧';
    case 'PK': return '🇵🇰';
    case 'IN': return '🇮🇳';
    case 'CA': return '🇨🇦';
    case 'AU': return '🇦🇺';
    case 'FR': return '🇫🇷';
    case 'DE': return '🇩🇪';
    case 'BR': return '🇧🇷';
    case 'JP': return '🇯🇵';
    case 'CN': return '🇨🇳';
    case 'RU': return '🇷🇺';
    case 'OTHER': return '🌍';
    default: return '';
  }
};

// ── CSS Animations ────────────────────────────────────────────────
// Inject custom CSS animations for Hall of Fame
const injectHallOfFameStyles = () => {
  if (document.getElementById('hall-of-fame-styles')) return;

  const style = document.createElement('style');
  style.id = 'hall-of-fame-styles';
  style.textContent = `
    /* Animations removed - using animate-pulse for static blinking effect */
  `;
  document.head.appendChild(style);
};

injectHallOfFameStyles();

// ── Components ────────────────────────────────────────────────────

const HallOfFameCard = ({ entry }: { entry: LeaderboardEntry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex flex-col items-center p-8 rounded-2xl border-2 border-neon-green bg-zinc-900/50 transition-all duration-300 gap-6 w-[400px] mx-auto overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 blur-[60px] bg-neon-green/10 -z-10 animate-pulse" />
      


      {/* Avatar Section */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <Link
          to={`/profile/${entry.username}`}
          className="relative block w-32 h-32 z-10"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-neon-green bg-zinc-900 shadow-[0_0_30px_rgba(20,255,100,0.3)]">
            {entry.avatar ? (
              <img
                src={entry.avatar}
                alt={entry.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-5xl font-black text-neon-green/40 flex items-center justify-center h-full">
                {entry.username[0].toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* 🔥 Lottie Frame Overlay */}
        <div className="absolute z-30 pointer-events-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72">
          <Lottie
            animationData={winnerBadge}
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${entry.username}`}
            className="text-3xl font-black text-white hover:text-neon-green transition-colors uppercase tracking-tight"
          >
            {entry.username}
          </Link>
          {entry.country && (
            <span className="text-2xl" title={entry.country}>
              {getCountryEmoji(entry.country)}
            </span>
          )}
        </div>

        {/* Red Tag */}
        <span className="px-4 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-[12px] font-black tracking-[0.2em] text-red-500 uppercase shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
          GODLIKE
        </span>

        {/* Stats */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="flex items-center gap-2 text-neon-green font-mono font-bold text-2xl">
            <Trophy size={24} className="animate-pulse" />
            <span>{entry.score.toLocaleString()} PTS</span>
          </div>
          {entry.solveCount !== undefined && (
            <p className="text-[10px] text-text-muted/60 font-mono tracking-widest uppercase">
              {entry.solveCount} CHALLENGES MASTERED
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PodiumItem = ({ entry, rank, color }: { entry: LeaderboardEntry; rank: number; color: string }) => {
  const Icon = rank === 2 ? Trophy : Medal;

  const motivationTags = {
    2: "ELITE",
    3: "PRODIGY"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={clsx(
        "relative flex flex-col items-center p-6 rounded-xl border-2 bg-background-card transition-all duration-300",
        rank === 2 ? "scale-100" : "scale-95",
        color === 'silver' && "border-blue-400/50 shadow-[0_0_30px_rgba(96,165,250,0.5)]",
        color === 'bronze' && "border-orange-400/50 shadow-[0_0_30px_rgba(251,146,60,0.5)]"
      )}
    >


      <div className="relative mb-4 w-40 h-40 flex items-center justify-center">
        {/* Lottie Badge Frame - Behind avatar */}
        <div className="absolute z-5 pointer-events-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56">
          <Lottie
            animationData={podiumBadge}
            loop={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Rotating Frame Border - Around Avatar */}
        <div 
          className={clsx(
            "absolute w-32 h-32 rounded-full animate-spin z-15",
            color === 'silver' && "border-1 border-blue-400/60",
            color === 'bronze' && "border-1 border-orange-400/60"
          )}
          style={{ animationDuration: '6s' }}
        />

        {/* User Avatar Overlay */}
        <Link to={`/profile/${entry.username}`} className="relative group cursor-pointer z-20">
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-white/20 to-transparent shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full overflow-hidden border border-zinc-800 bg-surface flex items-center justify-center">
              {entry.avatar ? (
                <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-gray-400/30 text-3xl font-black italic">
                  {entry.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-col items-center mb-1">
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${entry.username}`}
            className="text-lg font-bold text-text-primary hover:text-neon-green transition-colors"
          >
            {entry.username}
          </Link>
          {entry.country && (
            <span className="text-lg" title={entry.country}>{getCountryEmoji(entry.country)}</span>
          )}
        </div>
        <span className={clsx(
          "text-[10px] px-2 py-0.5 rounded font-black tracking-widest mt-1",
          color === 'silver' && "bg-blue-400 text-background shadow-[0_0_10px_rgba(96,165,250,0.5)]",
          color === 'bronze' && "bg-orange-400 text-background shadow-[0_0_10px_rgba(251,146,60,0.5)]"
        )}>
          {motivationTags[rank as keyof typeof motivationTags]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-white font-mono font-bold">
        <Icon size={16} />
        <span>{entry.score.toLocaleString()} pts</span>
      </div>

      {entry.solveCount !== undefined && (
        <p className="text-xs text-text-muted mt-2">{entry.solveCount} challenges solved</p>
      )}
    </motion.div>
  );
};

// ── Main Page Component ───────────────────────────────────────────

const Leaderboard = () => {
  const [filter, setFilter] = useState<LeaderboardFilter>('all-time');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: () => leaderboardService.getLeaderboard(filter),
    select: (res) => res.data,
  });

  useEffect(() => {
    // Connect socket and listen for updates
    socketService.connect();
    socketService.on('leaderboardUpdate', () => {
      refetch();
      toast.success('Leaderboard updated!', { id: 'lb-update', duration: 2000 });
    });

    return () => {
      socketService.off('leaderboardUpdate');
    };
  }, [refetch]);

  const filteredData = data?.filter(entry =>
    entry.username.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const topThree = filteredData.slice(0, 3);
  const remaining = filteredData.slice(3);

  const filters: { id: LeaderboardFilter; label: string; icon: any }[] = [
    { id: 'all-time', label: 'All Time', icon: Crown },
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: Clock },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10 lg:py-12 max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter text-glow"
          >
            RANKINGS
          </motion.h1>
          <p className="text-text-secondary font-mono">Real-time competitive standings.</p>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-surface rounded-lg border border-surface-border">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-all duration-200",
                  filter === f.id
                    ? "bg-neon-green text-background font-bold shadow-neon-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-border"
                )}
              >
                <Icon size={14} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search operative..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 h-11"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
          <p className="font-mono text-neon-green animate-pulse">SYNCING RANKINGS...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium with Hall of Fame for Rank 1 */}
          {filteredData.length > 0 && !search && (
            <div className="mb-16 space-y-8">
              {/* Rank 1 - VIP Podium Style */}
              {topThree[0] && (
                <div className="flex justify-center">
                  <HallOfFameCard entry={topThree[0]} />
                </div>
              )}

              {/* Rank 2 & 3 Podium Below */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {topThree[1] && <PodiumItem entry={topThree[1]} rank={2} color="silver" />}
                {topThree[2] && <PodiumItem entry={topThree[2]} rank={3} color="bronze" />}
              </div>
            </div>
          )}

          {/* Ranking Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="bg-surface border-b border-surface-border text-text-muted uppercase text-xs tracking-widest">
                    <th className="px-6 py-4 font-medium">Rank</th>
                    <th className="px-6 py-4 font-medium">Operative</th>
                    <th className="px-6 py-4 font-medium">Flag Count</th>
                    <th className="px-6 py-4 font-medium text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  <AnimatePresence mode="popLayout">
                    {(search ? filteredData : remaining).map((entry, index) => (
                      <motion.tr
                        key={entry.userId}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-surface/50 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4">
                          <span className={clsx(
                            "inline-block w-8 h-8 rounded text-center leading-8 font-bold",
                            entry.rank <= 3 ? "text-neon-green" : "text-text-muted"
                          )}>
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-zinc-700 group-hover:border-neon-green shadow-[0_0_10px_rgba(0,0,0,0.3)] overflow-hidden bg-black flex-shrink-0 transition-all flex items-center justify-center p-0.5">
                              {entry.avatar ? (
                                <img src={entry.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <div className="text-[12px] text-neon-green/40 font-black italic">
                                  {entry.username[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                            <Link
                              to={`/profile/${entry.username}`}
                              className="font-bold text-text-primary group-hover:text-neon-green transition-colors"
                            >
                              {entry.username.toUpperCase()}
                            </Link>
                            {entry.country && (
                              <span className="text-[14px]" title={entry.country}>
                                {getCountryEmoji(entry.country)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {entry.solveCount || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-neon-green font-bold">
                            {entry.score.toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div className="p-12 text-center text-text-muted italic">
                No operatives found in current sector.
              </div>
            )}
          </div>
        </>
      )}

      {/* Real-time Indicator */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-text-muted uppercase tracking-tighter">
        <div className={clsx("w-1.5 h-1.5 rounded-full", isRefetching ? "bg-neon-green animate-ping" : "bg-status-success")} />
        <span>Live System Status: <span className="text-status-success">Operational</span></span>
      </div>
    </div>
  );
};

export default Leaderboard;
