import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Hash,
  History,
  CheckCircle2,
  Terminal,
  Github,
  Linkedin,
  Instagram,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { clsx } from 'clsx';

const CategoryProgress = ({
  category,
  solved,
  total,
}: {
  category: string;
  solved: number;
  total: number;
}) => {
  const percentage = total > 0 ? (solved / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-text-primary uppercase">{category}</span>
        <span className="text-text-muted">{solved}/{total} SOLVED</span>
      </div>
      <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full bg-neon-green shadow-neon-sm"
        />
      </div>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="bg-background-card border border-surface-border rounded-xl p-6 flex items-center gap-4 hover:border-neon-green/30 transition-colors">
    <div
      className={clsx(
        'w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10',
        color
      )}
    >
      <Icon className={clsx('w-6 h-6', color.replace('bg-', 'text-'))} />
    </div>
    <div>
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();

  const formatSafeDate = (value?: string) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return isValid(parsed) ? format(parsed, 'yyyy-MM-dd HH:mm') : 'N/A';
  };

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: () => userService.getPublicProfile(username!),
    select: (res) => res.data,
    enabled: !!username,
  });

  useEffect(() => {
    if (error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 403) {
        toast.error("This user's profile is private");
      } else if (axiosError.response?.status === 404) {
        toast.error('User not found');
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
        <p className="font-mono text-neon-green animate-pulse">
          ACCESSING_PROFILE_DATABASE...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="font-mono text-red-500 text-center">
          {error
            ? 'PROFILE_ACCESS_DENIED_OR_NOT_FOUND'
            : 'UNKNOWN_ERROR'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl font-mono">
      {/* ── PROFILE HEADER ── */}
      <div className="relative mb-8 sm:mb-10 md:mb-12 rounded-2xl border border-zinc-800 overflow-hidden bg-black/40 p-4 sm:p-6 md:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-5 pointer-events-none">
          <Terminal size={100} />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 relative z-10">
          <div className="relative">
            <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full border-4 border-neon-green/40 p-1.5 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-black text-neon-green/20 rounded-full">
                  {profile.username?.[0]?.toUpperCase?.() || '?'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 sm:-bottom-3 -right-2 sm:-right-3 bg-neon-green text-black text-[9px] sm:text-[11px] font-black italic px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg uppercase shadow-neon">
              LVL {Math.floor((profile.score || 0) / 1000) + 1}
            </div>
          </div>

          <div className="text-center md:text-left space-y-3 sm:space-y-4 flex-grow">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 mb-1 sm:mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter text-glow break-all">
                  {(profile.username || 'operator').toUpperCase()}
                </h1>
                {profile.role === 'admin' && (
                  <div className="px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500/10 border border-red-500/20 rounded text-[8px] sm:text-[10px] text-red-500 font-bold tracking-widest uppercase">
                    SYSTEM_ROOT
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-6 text-[9px] sm:text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1 sm:gap-2 border-r border-zinc-800 pr-2 sm:pr-6">
                  <Hash size={12} className="text-neon-green" /> UID:{' '}
                  {profile._id?.slice(-8) || 'UNKNOWN'}
                </span>
                <span className="flex items-center gap-1 sm:gap-2">
                  <Globe size={12} className="text-neon-green" /> {profile.country || 'UNKNOWN_LOCATION'}
                </span>
              </div>
            </div>

            {/* Bio & Social Intelligence */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
               {profile.bio && (
                 <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 max-w-md flex-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 flex gap-1">
                       <div className="w-1 h-1 bg-neon-green rounded-full" />
                       <div className="w-1 h-1 bg-neon-green rounded-full animate-pulse" />
                    </div>
                    <p className="text-[10px] text-neon-green/60 font-black tracking-[0.2em] mb-2 uppercase">BIOGRAPHICAL_DATA</p>
                    <p className="text-xs text-text-secondary italic leading-relaxed">
                      "{profile.bio}"
                    </p>
                 </div>
               )}

               {profile.socialLinks &&
                (profile.socialLinks.github ||
                  profile.socialLinks.linkedin ||
                  profile.socialLinks.instagram) && (
                  <div className="flex flex-col justify-center gap-3">
                    <p className="text-[10px] text-zinc-600 font-black tracking-[0.2em] uppercase text-center md:text-left">SOCIAL_INTELLIGENCE</p>
                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                      {profile.socialLinks.github && (
                        <a
                          href={profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 px-4 py-2 bg-black/40 border border-zinc-800 rounded-lg hover:border-neon-green/50 transition-all group/s"
                        >
                          <Github size={14} className="text-zinc-500 group-hover/s:text-neon-green" />
                          <span className="text-[10px] font-bold text-zinc-400 group-hover/s:text-white uppercase">GitHub</span>
                        </a>
                      )}
                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 px-4 py-2 bg-black/40 border border-zinc-800 rounded-lg hover:border-blue-500/50 transition-all group/s"
                        >
                          <Linkedin size={14} className="text-zinc-500 group-hover/s:text-blue-500" />
                          <span className="text-[10px] font-bold text-zinc-400 group-hover/s:text-white uppercase">LinkedIn</span>
                        </a>
                      )}
                      {profile.socialLinks.instagram && (
                        <a
                          href={profile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2.5 px-4 py-2 bg-black/40 border border-zinc-800 rounded-lg hover:border-pink-500/50 transition-all group/s"
                        >
                          <Instagram size={14} className="text-zinc-500 group-hover/s:text-pink-500" />
                          <span className="text-[10px] font-bold text-zinc-400 group-hover/s:text-white uppercase">Instagram</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-12">
          {/* Proficiency Index */}
          <div className="card p-6 space-y-6">
            <h3 className="text-sm font-mono font-bold flex items-center gap-2 uppercase">
              <Trophy size={16} className="text-neon-green" />
              Challenge Proficiency
            </h3>
            <div className="space-y-4">
              <CategoryProgress
                category="Web Exploitation"
                solved={
                  profile.solvedChallenges?.filter(
                    (c: any) => c.category === 'web'
                  ).length || 0
                }
                total={12}
              />
              <CategoryProgress
                category="Reverse Engineering"
                solved={
                  profile.solvedChallenges?.filter(
                    (c: any) => c.category === 'rev'
                  ).length || 0
                }
                total={8}
              />
              <CategoryProgress
                category="Cryptography"
                solved={
                  profile.solvedChallenges?.filter(
                    (c: any) => c.category === 'crypto'
                  ).length || 0
                }
                total={10}
              />
              <CategoryProgress
                category="Forensics"
                solved={
                  profile.solvedChallenges?.filter(
                    (c: any) => c.category === 'forensics'
                  ).length || 0
                }
                total={6}
              />
            </div>
          </div>

          {/* Recently Solved */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-3 uppercase italic">
              <History size={20} className="text-neon-green" />
              RECENT OPERATIONS
            </h2>
            <div className="card overflow-hidden">
              <table className="w-full text-left font-mono text-sm">
                <thead className="bg-surface border-b border-surface-border text-text-muted text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-medium">MISSION</th>
                    <th className="px-6 py-4 font-medium">CATEGORY</th>
                    <th className="px-6 py-4 font-medium">DATE</th>
                    <th className="px-6 py-4 font-medium text-right">BOUNTY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {profile.solveHistory?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-text-muted italic"
                      >
                        No missions cleared yet.
                      </td>
                    </tr>
                  ) : (
                    profile.solveHistory?.map((solve: any) => (
                      <tr key={solve._id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-text-primary capitalize">
                          {solve.challengeId?.title}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 rounded border border-surface-border bg-surface uppercase">
                            {solve.challengeId?.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-muted text-xs">
                          {formatSafeDate(solve?.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-neon-green">
                          +{solve.pointsAwarded}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Stats */}
        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest border-b border-surface-border pb-4">
            OPERATOR_STATS
          </h2>
          <div className="space-y-4">
            <StatCard
              icon={Trophy}
              label="Rank"
              value={`#${profile.rank}`}
              color="bg-neon-green"
            />
            <StatCard
              icon={CheckCircle2}
              label="Solves"
              value={profile.solvedChallenges?.length || 0}
              color="bg-status-success"
            />
            <StatCard
              icon={Terminal}
              label="Points"
              value={Number(profile.score || 0).toLocaleString()}
              color="bg-blue-500"
            />
          </div>

          <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-neon-green font-mono text-[10px] uppercase font-black">
              <AlertCircle size={14} />
              Sector Notice
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-mono">
              Profile viewing is enabled for all public operators. Private profiles
              are hidden from the network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
