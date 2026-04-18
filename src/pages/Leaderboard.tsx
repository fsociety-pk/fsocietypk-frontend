import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Calendar, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leaderboardService, LeaderboardEntry, LeaderboardFilter } from '../services/leaderboardService';
import { socketService } from '../utils/socket';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

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
    @keyframes rotate-3d {
      0% { transform: rotateX(20deg) rotateY(0deg); }
      100% { transform: rotateX(20deg) rotateY(360deg); }
    }
    @keyframes levitate {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    .hall-of-fame-avatar {
      animation: rotate-3d 8s linear infinite, levitate 4s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
};

injectHallOfFameStyles();

// ── Components ────────────────────────────────────────────────────

const HallOfFameCard = ({ entry }: { entry: LeaderboardEntry }) => {
  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="hall-of-fame relative flex flex-col items-center p-8 md:p-12 rounded-2xl border-2 border-neon-green bg-gradient-to-br from-neon-green/10 via-background-card to-background-card transition-all duration-300 md:col-span-1 md:col-start-2"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 rounded-2xl blur-xl bg-neon-green/20 -z-10 animate-pulse" />
      
      {/* Top label */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6"
      >
        <span className="px-4 py-2 bg-neon-green/20 border border-neon-green/50 rounded-lg text-[10px] font-black tracking-widest text-neon-green uppercase">
          ⭐ HALL OF FAME
        </span>
      </motion.div>

      {/* 3D rotating avatar */}
      <div className="relative mb-8 perspective">
        {/* Floating particles */}
        {particles.map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-green rounded-full"
            style={{
              left: `${Math.cos((i / 6) * Math.PI * 2) * 80}px`,
              top: `${Math.sin((i / 6) * Math.PI * 2) * 80}px`,
              '--tx': `${Math.cos((i / 6) * Math.PI * 2) * 100}px`,
            } as React.CSSProperties}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
          />
        ))}

        <motion.div
          className="hall-of-fame-avatar relative w-32 h-32 rounded-full bg-gradient-to-tr from-neon-green/40 to-neon-green/10 p-1 shadow-[0_0_40px_rgba(20,255,100,0.4)]"
          style={{
            boxShadow: '0 0 40px rgba(20, 255, 100, 0.6), inset 0 0 40px rgba(20, 255, 100, 0.2), 0 0 80px rgba(20, 255, 100, 0.3)',
          }}
        >
          <Link to={`/profile/${entry.username}`} className="relative block w-full h-full group">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-neon-green/50 bg-zinc-900 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              {entry.avatar ? (
                <img 
                  src={entry.avatar} 
                  alt={entry.username} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-neon-green/40">
                  {entry.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>
        </motion.div>

        {/* Rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, linear: true }}
          className="absolute inset-0 rounded-full border border-dashed border-neon-green/30 pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, linear: true }}
          className="absolute inset-4 rounded-full border border-dashed border-neon-green/20 pointer-events-none"
        />
      </div>

      {/* Username and info */}
      <div className="text-center space-y-2 mb-6">
        <Link 
          to={`/profile/${entry.username}`}
          className="block text-2xl md:text-3xl font-black text-neon-green hover:text-white transition-colors"
        >
          {entry.username.toUpperCase()}
        </Link>
        <div className="flex items-center justify-center gap-2">
          {entry.country && (
            <span className="text-2xl" title={entry.country}>{getCountryEmoji(entry.country)}</span>
          )}
          <span className="px-3 py-1 bg-neon-green/20 border border-neon-green/50 rounded text-[11px] font-black tracking-widest text-neon-green uppercase">
            GODLIKE
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-center w-full border-t border-neon-green/20 pt-6">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="flex items-center justify-center gap-2 text-neon-green font-mono font-bold text-lg">
            <Trophy size={20} />
            <span>{entry.score.toLocaleString()} PTS</span>
          </div>
        </motion.div>
        {entry.solveCount !== undefined && (
          <p className="text-xs text-text-muted/80">{entry.solveCount} CHALLENGES MASTERED</p>
        )}
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
        "relative flex flex-col items-center p-6 rounded-xl border bg-background-card transition-all duration-300",
        rank === 2 ? "scale-100" : "scale-95",
        color === 'silver' && "border-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.3)]",
        color === 'bronze' && "border-orange-400/50 shadow-[0_0_15px_rgba(251,146,60,0.3)]"
      )}
    >
      <div className={clsx(
        "absolute -top-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-background",
        color === 'silver' && "bg-blue-400",
        color === 'bronze' && "bg-orange-400"
      )}>
        {rank}
      </div>
      
      <div className="relative mb-4">
        <Link to={`/profile/${entry.username}`} className="relative group cursor-pointer block">
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-white/20 to-transparent shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full rounded-full overflow-hidden border border-zinc-800 bg-surface flex items-center justify-center">
              {entry.avatar ? (
                <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
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
            <div className="mb-16">
              {/* Hall of Fame - Rank 1 */}
              {topThree[0] && (
                <div className="grid grid-cols-1 mb-16">
                  <HallOfFameCard entry={topThree[0]} />
                </div>
              )}
              
              {/* Rank 2 & 3 Podium */}
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
