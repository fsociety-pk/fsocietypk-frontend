import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Search, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import { challengeService } from '../services/challenge.service';
import { IChallenge, ChallengeCategory, ChallengeDifficulty } from '../types';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const CATEGORIES: ChallengeCategory[] = [
  'web', 'pwn', 'rev', 'crypto', 'forensics', 'osint', 'misc', 'stego', 'network', 'mobile'
];

const DIFFICULTIES: ChallengeDifficulty[] = [
  'easy', 'medium', 'hard', 'insane'
];

const Challenges: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [challenges, setChallenges] = useState<IChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    category: ChallengeCategory | 'all';
    difficulty: ChallengeDifficulty | 'all';
    search: string;
  }>({
    category: 'all',
    difficulty: 'all',
    search: '',
  });

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await challengeService.getChallenges();
        setChallenges(response.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to sync with central database');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const filteredChallenges = challenges.filter((c) => {
    const matchCategory = filter.category === 'all' || c.category === filter.category;
    const matchDifficulty = filter.difficulty === 'all' || c.difficulty === filter.difficulty;
    const matchSearch = c.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchCategory && matchDifficulty && matchSearch;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-neon-green border-neon-green/30';
      case 'medium': return 'text-yellow-500 border-yellow-500/30';
      case 'hard': return 'text-red-500 border-red-500/30';
      case 'insane': return 'text-purple-500 border-purple-500/30';
      default: return 'text-zinc-400 border-zinc-700';
    }
  };

  const getProgressStorageKey = (challengeId: string) => {
    const userScope = user?._id ?? 'anonymous';
    return `flag-progress:v3:${userScope}:${challengeId}`;
  };

  const getCompletedStepsFromStorage = (challengeId: string, totalSteps: number): number => {
    if (totalSteps <= 1) return 0;

    const raw = localStorage.getItem(getProgressStorageKey(challengeId));
    if (!raw) return 0;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return 0;
      return [...new Set(parsed)]
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= totalSteps).length;
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
          <p className="text-neon-green animate-pulse">&gt; DECRYPTING CHALLENGES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 sm:p-6 md:p-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neon-green flex items-center gap-2 sm:gap-3 leading-tight">
              <Terminal className="w-8 sm:w-10 h-8 sm:h-10" />
              MISSIONS
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-500 font-mono tracking-widest">&gt; SELECT_TARGET_AND_EXPLOIT</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <div className="relative flex-grow min-w-0 sm:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-3.5 h-3.5 transition-colors group-focus-within:text-neon-green" />
              <input
                type="text"
                placeholder="PROBE_TITLE..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="bg-black/40 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-[11px] font-mono focus:border-neon-green/50 outline-none w-full transition-all focus:bg-zinc-900 placeholder:text-zinc-700"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value as any })}
                className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-[10px] font-mono focus:border-neon-green/50 outline-none transition-all cursor-pointer flex-1 sm:w-36"
              >
                <option value="all">CATEGORIES</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
              </select>

              <select
                value={filter.difficulty}
                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value as any })}
                className="bg-black/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-[10px] font-mono focus:border-neon-green/50 outline-none transition-all cursor-pointer flex-1 sm:w-36"
              >
                <option value="all">DIFFICULTIES</option>
                {DIFFICULTIES.map(diff => <option key={diff} value={diff}>{diff.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Challenge Grid ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredChallenges.map((challenge, index) => (
              (() => {
                const totalFlagSteps = challenge.flags?.length || (challenge.flag ? 1 : 1);
                const completedSteps = totalFlagSteps > 1
                  ? getCompletedStepsFromStorage(challenge._id, totalFlagSteps)
                  : (challenge.isSolved ? 1 : 0);
                const isSolvedUI = totalFlagSteps > 1
                  ? completedSteps >= totalFlagSteps
                  : Boolean(challenge.isSolved);

                return (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={`/challenges/${challenge._id}`}
                  className={`block border rounded-xl p-6 bg-zinc-900/30 hover:bg-zinc-900/50 transition-all group relative overflow-hidden ${
                    isSolvedUI ? 'border-neon-green/30' : 'border-zinc-800 hover:border-neon-green/50'
                  }`}
                >
                  {/* Status Badge Group */}
                  <div className="absolute top-0 left-0 flex items-center">
                    {challenge.liveStatus === 'live' && (
                      <div className="px-3 py-1 bg-neon-green text-black text-[9px] font-black tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                        LIVE
                      </div>
                    )}
                    {challenge.liveStatus === 'ended' && (
                      <div className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[9px] font-black tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                        OFFLINE
                      </div>
                    )}
                  </div>

                  {/* Multi-flag Progress Progress Bar Overlay */}
                  {totalFlagSteps > 1 && (
                    <div className="absolute top-0 right-0 h-1 bg-zinc-800/50 w-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progressPercent}%` }}
                         className="h-full bg-neon-green shadow-neon"
                       />
                    </div>
                  )}

                  {/* Top Bar (Meta tags) */}
                  <div className="flex items-center justify-between mb-5 mt-6 sm:mt-8">
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
                          {challenge.category}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded border ${getDifficultyColor(challenge.difficulty)} bg-black/20`}>
                          {challenge.difficulty}
                        </span>
                     </div>
                     
                     {totalFlagSteps > 1 ? (
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-mono font-bold text-neon-green tracking-tighter">{progressPercent}%</span>
                           <span className="text-[9px] font-mono text-zinc-600">[{completedSteps}/{totalFlagSteps}]</span>
                        </div>
                     ) : (
                        isSolvedUI && <CheckCircle2 className="w-4 h-4 text-neon-green" />
                     )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold group-hover:text-neon-green transition-colors leading-tight">
                      {challenge.title}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5 group-hover:text-white transition-colors">
                        <Trophy className="w-3.5 h-3.5 text-yellow-500/70" />
                        <span>{challenge.points} XP_UNITS</span>
                      </div>
                      <div className="flex items-center gap-1.5 group-hover:text-white transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{completedSteps}/{totalFlagSteps} CLEARED</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Scanline */}
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-green/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </motion.div>
                );
              })()
            ))}
          </AnimatePresence>
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-20 border border-zinc-800 border-dashed rounded-2xl">
            <p className="text-zinc-500 tracking-widest">&gt; NO TARGETS FOUND IN THIS SECTOR</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
