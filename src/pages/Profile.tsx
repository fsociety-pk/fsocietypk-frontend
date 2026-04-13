import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Shield, 
  Trophy, 
  Hash, 
  Settings, 
  History, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Camera
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService, ChangePasswordPayload } from '../services/userService';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { clsx } from 'clsx';

// ── Components ────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
  <div className="bg-background-card border border-surface-border rounded-xl p-6 flex items-center gap-4 hover:border-neon-green/30 transition-colors">
    <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10", color)}>
      <Icon className={clsx("w-6 h-6", color.replace('bg-', 'text-'))} />
    </div>
    <div>
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

const CategoryProgress = ({ category, solved, total }: { category: string, solved: number, total: number }) => {
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

// ── Main Page Component ───────────────────────────────────────────

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  const formatSafeDate = (value?: string) => {
    if (!value) {
      return 'N/A';
    }

    const parsed = new Date(value);
    return isValid(parsed) ? format(parsed, 'yyyy-MM-dd HH:mm') : 'N/A';
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    select: (res) => res.data,
  });

  // Sync saved avatar for demo purposes if backend doesn't support it yet
  useEffect(() => {
    if (profile?._id) {
       const savedAvatar = localStorage.getItem(`avatar_${profile._id}`);
       if (savedAvatar) setLocalAvatar(savedAvatar);
    }
  }, [profile]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('FILE_TOO_LARGE: Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLocalAvatar(result);
      if (profile?._id) {
        localStorage.setItem(`avatar_${profile._id}`, result);
        toast.success('AVATAR_UPDATED_SUCCESSFULLY');
      }
    };
    reader.readAsDataURL(file);
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordPayload>();

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordPayload) => userService.changePassword(data),
    onSuccess: () => {
      toast.success('PASSWORD_UPDATED_SUCCESSFULLY');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'FAILED_TO_UPDATE_PASSWORD');
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
        <p className="font-mono text-neon-green animate-pulse">ACCESSING_SECURE_VAULT...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl font-mono">
      {/* ── PROFILE HEADER ── */}
      <div className="relative mb-12 rounded-2xl border border-zinc-800 overflow-hidden bg-black/40 p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <Terminal size={150} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatarUpdate" 
              onChange={handleAvatarUpload} 
            />
            <label htmlFor="avatarUpdate" className="block w-40 h-40 rounded-2xl border-2 border-neon-green/40 p-1.5 bg-zinc-900/50 relative overflow-hidden transition-all group-hover:border-neon-green cursor-pointer">
              {(localAvatar || profile?.avatar) ? (
                <img src={localAvatar || profile?.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-5xl font-black text-neon-green/20 rounded-xl">
                  {profile?.username?.[0]?.toUpperCase?.() || '?'}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-xl backdrop-blur-sm">
                 <Camera className="text-neon-green w-8 h-8 mb-2" />
                 <span className="text-[10px] font-bold tracking-[0.3em] text-white uppercase">UPDATE_AVATAR</span>
              </div>
            </label>
            <div className="absolute -bottom-3 -right-3 bg-neon-green text-black text-[11px] font-black italic px-4 py-1.5 rounded-lg uppercase shadow-neon">
              LVL {Math.floor((profile?.score || 0) / 1000) + 1}
            </div>
          </div>

          <div className="text-center md:text-left space-y-4 flex-grow">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-glow truncate max-w-md">
                  {(profile?.username || 'operator').toUpperCase()}
                </h1>
                {profile?.role === 'admin' && (
                  <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 font-bold tracking-widest uppercase">
                    SYSTEM_ROOT
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 border-r border-zinc-800 pr-6"><Hash size={14} className="text-neon-green" /> UID: {profile?._id?.slice(-8) || 'UNKNOWN'}</span>
                <span className="flex items-center gap-2"><Lock size={14} className="text-neon-green" /> STATUS: ACTIVE_OPERATOR</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-xl flex flex-col items-center min-w-[120px]">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">GLOBAL_RANK</p>
                <p className="text-2xl font-black text-neon-green italic">#{profile?.rank}</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-xl flex flex-col items-center min-w-[120px]">
                <p className="text-[10px] text-zinc-600 uppercase mb-1">TOTAL_EXP</p>
                <p className="text-2xl font-black text-white italic">{Number(profile?.score || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Navigation & Solves History */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex gap-2 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800 w-fit">
            {[
              { id: 'overview', label: 'ANALYTICS', icon: UserIcon },
              { id: 'settings', label: 'SETTINGS', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-2 px-8 py-3 rounded-lg text-[10px] font-bold tracking-[0.3em] transition-all",
                  activeTab === tab.id 
                    ? "bg-neon-green text-black shadow-neon" 
                    : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {/* Visual Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="card p-6 space-y-6">
                      <h3 className="text-sm font-mono font-bold flex items-center gap-2 uppercase">
                        <TrendingUp size={16} className="text-neon-green" />
                        Proficiency Index
                      </h3>
                      <div className="space-y-4">
                        <CategoryProgress category="Web Exploitation" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'web').length || 0} total={12} />
                        <CategoryProgress category="Reverse Engineering" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'rev').length || 0} total={8} />
                        <CategoryProgress category="Cryptography" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'crypto').length || 0} total={10} />
                        <CategoryProgress category="Forensics" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'forensics').length || 0} total={6} />
                      </div>
                   </div>

                   <div className="card p-6 flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-5">
                         <Trophy className="scale-[3] rotate-12" />
                      </div>
                      <p className="text-xs font-mono text-text-muted uppercase mb-2">Completion Rate</p>
                      <p className="text-6xl font-black text-glow text-neon-green">
                         {Math.round(((profile?.solvedChallenges?.length || 0) / 40) * 100)}%
                      </p>
                      <p className="text-xs font-mono text-text-muted uppercase mt-4">
                         {profile?.solvedChallenges?.length || 0} of 40 missions cleared
                      </p>
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
                            {profile?.solveHistory?.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-text-muted italic">No missions cleared yet. Gear up!</td>
                              </tr>
                            ) : (
                              profile?.solveHistory?.map((solve: any) => (
                                <tr key={solve._id} className="hover:bg-surface/50 transition-colors">
                                   <td className="px-6 py-4 font-bold text-text-primary capitalize">{solve.challenge?.title}</td>
                                   <td className="px-6 py-4 text-xs">
                                      <span className="px-2 py-0.5 rounded border border-surface-border bg-surface uppercase">{solve.challenge?.category}</span>
                                   </td>
                                   <td className="px-6 py-4 text-text-muted text-xs">
                                      {formatSafeDate(solve?.createdAt)}
                                   </td>
                                   <td className="px-6 py-4 text-right font-bold text-neon-green">+{solve.pointsAwarded}</td>
                                </tr>
                              ))
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-md space-y-8"
              >
                 <div className="card p-8 space-y-8">
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold flex items-center gap-3 uppercase italic text-status-success">
                          <Lock size={20} />
                          ENCRYPTION_OVERRIDE
                       </h3>
                       <p className="text-xs text-text-muted font-mono leading-relaxed">
                          Update your authentication credentials. Use strong multi-layered entropy for maximum security.
                       </p>
                    </div>

                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex justify-between">
                                Current Password
                                {errors.currentPassword && <span className="text-status-error flex items-center gap-1 lowercase"><AlertCircle size={10} /> required</span>}
                             </label>
                             <div className="relative">
                                <input 
                                  type={showCurrentPass ? "text" : "password"} 
                                  className={clsx("input", errors.currentPassword && "input-error")}
                                  placeholder="••••••••"
                                  {...register('currentPassword', { required: true })}
                                />
                                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                   {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex justify-between">
                                New Password
                                {errors.newPassword && <span className="text-status-error flex items-center gap-1 lowercase"><AlertCircle size={10} /> min 8 chars</span>}
                             </label>
                             <div className="relative">
                                <input 
                                  type={showNewPass ? "text" : "password"} 
                                  className={clsx("input", errors.newPassword && "input-error")}
                                  placeholder="••••••••"
                                  {...register('newPassword', { 
                                    required: true, 
                                    minLength: 8,
                                    validate: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) || "Weak entropy"
                                  })}
                                />
                                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                   {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex justify-between">
                                Confirm New Password
                                {errors.confirmPassword && <span className="text-status-error flex items-center gap-1 lowercase"><AlertCircle size={10} /> mismatches</span>}
                             </label>
                             <input 
                               type="password"
                               className={clsx("input", errors.confirmPassword && "input-error")}
                               placeholder="••••••••"
                               {...register('confirmPassword', { required: true })}
                             />
                          </div>
                       </div>

                       <button 
                         type="submit" 
                         disabled={mutation.isPending}
                         className="btn-primary w-full py-3 text-xs tracking-[0.2em] font-black italic"
                       >
                          {mutation.isPending ? "INITIALIZING_OVERRIDE..." : "OVERRIDE_SECURITY"}
                       </button>
                    </form>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Mini Stats List */}
        <div className="lg:col-span-4 space-y-8">
           <h2 className="text-sm font-mono font-bold uppercase tracking-widest border-b border-surface-border pb-4">
              Mission Status
           </h2>
           <div className="space-y-4">
              <StatCard icon={Trophy} label="Rank" value={`#${profile?.rank}`} color="bg-neon-green" />
              <StatCard icon={CheckCircle2} label="Solves" value={profile?.solvedChallenges?.length || 0} color="bg-status-success" />
              <StatCard icon={Terminal} label="Points" value={Number(profile?.score || 0).toLocaleString()} color="bg-blue-500" />
           </div>

           <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-neon-green font-mono text-[10px] uppercase font-black">
                 <AlertCircle size={14} />
                 Sector Notice
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-mono">
                 Operative ranks are updated in real-time. Keep solving to climb the global leaderboard. Any security breaches should be reported to system admins.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder icon until import is fixed
const TrendingUp = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default Profile;
