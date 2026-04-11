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
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-neon-green flex items-center gap-3">
              <Terminal className="w-10 h-10" />
              MISSIONS
            </h1>
            <p className="text-zinc-500 mt-2">&gt; SELECT YOUR TARGET</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="PROBE TITLE..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-neon-green outline-none w-full transition-all"
              />
            </div>
            
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as any })}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-neon-green outline-none transition-all cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>

            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value as any })}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:border-neon-green outline-none transition-all cursor-pointer"
            >
              <option value="all">ALL DIFFICULTIES</option>
              {DIFFICULTIES.map(diff => <option key={diff} value={diff}>{diff.toUpperCase()}</option>)}
            </select>
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
                const progressPercent = Math.round((completedSteps / totalFlagSteps) * 100);
                const radius = 13;
                const circumference = 2 * Math.PI * radius;
                const dashOffset = circumference * (1 - progressPercent / 100);

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
                  {/* Solve Status Icon (single-flag) */}
                  {totalFlagSteps <= 1 && isSolvedUI && (
                    <div className="absolute top-4 right-4 text-neon-green">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  )}

                  {/* Multi-flag Progress */}
                  {totalFlagSteps > 1 && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="relative w-8 h-8">
                        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                          <circle
                            cx="16"
                            cy="16"
                            r={radius}
                            fill="none"
                            stroke="rgba(63, 63, 70, 0.8)"
                            strokeWidth="3"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r={radius}
                            fill="none"
                            stroke="rgba(0, 255, 65, 0.95)"
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-neon-green">
                          {progressPercent}%
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                        {completedSteps}/{totalFlagSteps}
                      </span>
                    </div>
                  )}

                  {/* Top Bar */}
                  <div className="flex items-center gap-3 mb-4 pr-16 relative z-10">
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border border-zinc-700 text-zinc-400">
                      {challenge.category}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-neon-green transition-colors">
                    {challenge.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-yellow-500/70" />
                      <span>{challenge.points} PTS</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{completedSteps}/{totalFlagSteps} COMPLETED</span>
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
