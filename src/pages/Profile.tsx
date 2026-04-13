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
  Terminal
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
        <p className="font-mono text-neon-green animate-pulse">DECRYPTING_PROFILE_DATA...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header / Banner */}
      <div className="relative mb-12 rounded-2xl border border-surface-border overflow-hidden bg-background-elevated p-8">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Terminal size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-2 border-neon-green p-1 bg-background relative overflow-hidden transition-transform group-hover:scale-105">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center text-4xl font-bold text-text-muted rounded-full">
                  {profile?.username?.[0]?.toUpperCase?.() || '?'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-neon-green text-background text-[10px] font-black italic px-3 py-1 rounded-full uppercase shadow-neon-sm">
              Level {Math.floor((profile?.score || 0) / 1000) + 1}
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-glow flex items-center gap-3">
              {(profile?.username || 'operator').toUpperCase()}
              {profile?.role === 'admin' && <Shield className="text-status-error w-6 h-6" />}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-text-muted font-mono">
              <span className="flex items-center gap-2"><Hash size={14} /> UUID: {profile?._id?.slice(-8) || 'UNKNOWN'}</span>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 justify-end gap-4">
             <div className="text-right">
                <p className="text-xs text-text-muted font-mono uppercase">Global Rank</p>
                <p className="text-3xl font-black text-neon-green italic">#{profile?.rank}</p>
             </div>
             <div className="w-px h-12 bg-surface-border self-center mx-2" />
             <div className="text-right">
                <p className="text-xs text-text-muted font-mono uppercase">Total Points</p>
               <p className="text-3xl font-black text-white italic">{Number(profile?.score || 0).toLocaleString()}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Navigation & Solves History */}
        <div className="lg:col-span-8 space-y-12">
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-surface rounded-xl border border-surface-border w-fit">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: UserIcon },
              { id: 'settings', label: 'SETTINGS', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest transition-all",
                  activeTab === tab.id 
                    ? "bg-neon-green text-background shadow-neon-sm" 
                    : "text-text-muted hover:text-text-primary"
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
