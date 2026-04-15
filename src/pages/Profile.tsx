import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
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
  Camera,
  Link as LinkIcon,
  Globe,
  Mail,
  Award
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService, ChangePasswordPayload, UpdateProfilePayload } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { clsx } from 'clsx';
import { 
  Github, 
  Linkedin, 
  Instagram, 
  TrendingUp, 
  Globe as GlobeIcon, 
  MessageSquare,
  Share2
} from 'lucide-react';
import CertificateModal from '../components/common/CertificateModal';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'settings'>('overview');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const formatSafeDate = (value?: string) => {
    if (!value) {
      return 'N/A';
    }

    const parsed = new Date(value);
    return isValid(parsed) ? format(parsed, 'yyyy-MM-dd HH:mm') : 'N/A';
  };

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    select: (res) => res.data,
  });

  // Sync avatar from profile
  useEffect(() => {
    if (profile?.avatar) {
       setLocalAvatar(profile.avatar);
    }
  }, [profile?.avatar]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('FILE_TOO_LARGE: Maximum size is 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.onloadend = () => {
      const result = reader.result as string;
      setLocalAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmUpload = () => {
    if (localAvatar && profile?._id) {
      const loadingToast = toast.loading('UPLOADING_AVATAR...');
      updateProfileMutation.mutate({ avatar: localAvatar }, {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success('✓ AVATAR_SYNC_COMPLETE', {
            style: {
              background: '#000',
              color: '#00FF41',
              border: '1px solid #00FF41'
            }
          });
          setLocalAvatar(null);
          setTimeout(() => refetch(), 500);
        },
        onError: (error: any) => {
          toast.dismiss(loadingToast);
          setLocalAvatar(null);
          toast.error(error.response?.data?.message || 'UPLOAD_FAILED');
        }
      });
    }
  };

  const { user: authUser, setUser } = useAuthStore();

  const handleCancelUpload = () => {
    setLocalAvatar(authUser?.avatar || null);
  };

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } = useForm<ChangePasswordPayload>();

  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, setValue } = useForm<UpdateProfilePayload>();

  useEffect(() => {
    if (profile) {
      setValue('bio', profile.bio || '');
      setValue('country', profile.country || '');
      setValue('isProfilePublic', profile.isProfilePublic ?? true);
      setValue('avatar', profile.avatar || undefined);
      setValue('socialLinks', {
        linkedin: profile.socialLinks?.linkedin || '',
        github: profile.socialLinks?.github || '',
        instagram: profile.socialLinks?.instagram || '',
      });
    }
  }, [profile?.avatar, profile?.bio, profile?.country, profile?.isProfilePublic, profile?.socialLinks, setValue]);

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordPayload) => userService.changePassword(data),
    onSuccess: () => {
      toast.success('PASSWORD_UPDATED_SUCCESSFULLY');
      resetPassword();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'FAILED_TO_UPDATE_PASSWORD');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: (response) => {
      if (response.data) {
        setUser({ ...authUser!, ...response.data });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'FAILED_TO_UPDATE_PROFILE');
    }
  });

  const handlePasswordSubmit = (data: ChangePasswordPayload) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    passwordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
        <p className="font-mono text-neon-green animate-pulse">ACCESSING_SECURE_VAULT...</p>
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
        
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10 relative z-10">
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatarUpdate" 
              onChange={handleAvatarUpload} 
            />
            <label htmlFor="avatarUpdate" className="block w-32 sm:w-40 h-32 sm:h-40 rounded-full border-4 border-neon-green/40 p-1.5 bg-zinc-900/50 relative overflow-hidden transition-all group-hover:border-neon-green cursor-pointer flex items-center justify-center">
              {(localAvatar || profile?.avatar) ? (
                <img src={localAvatar || profile?.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-black text-neon-green/20 rounded-full">
                  {profile?.username?.[0]?.toUpperCase?.() || '?'}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full backdrop-blur-sm">
                 <Camera className="text-neon-green w-6 sm:w-8 h-6 sm:h-8 mb-1 sm:mb-2" />
                 <span className="text-[10px] font-bold tracking-[0.3em] text-white uppercase">UPDATE_AVATAR</span>
              </div>
            </label>
            <div className="absolute -bottom-3 -right-3 bg-neon-green text-black text-[11px] font-black italic px-4 py-1.5 rounded-lg uppercase shadow-neon">
              LVL {Math.floor((profile?.score || 0) / 1000) + 1}
            </div>
          </div>

          <AnimatePresence>
            {localAvatar && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-3 p-4 bg-zinc-900/80 border border-neon-green/30 rounded-xl backdrop-blur-md shadow-neon-sm"
              >
                <p className="text-[10px] font-bold tracking-widest text-neon-green animate-pulse">CONFIRM_NEW_AVATAR?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleConfirmUpload}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-neon-green text-black text-[10px] font-bold rounded hover:shadow-neon transition-all disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? 'SYNCING...' : 'CONFIRM'}
                  </button>
                  <button 
                    onClick={handleCancelUpload}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded hover:text-white transition-all disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                <span className="flex items-center gap-2"><Lock size={14} className="text-neon-green" /> STATUS: {profile?.isProfilePublic ? 'PUBLIC' : 'PRIVATE'}</span>
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
          <div className="flex gap-2 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800 w-fit flex-wrap">
            {[
              { id: 'overview', label: 'ANALYTICS', icon: UserIcon },
              { id: 'profile', label: 'PROFILE', icon: Globe },
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
                   <div className="card p-6 space-y-6 bg-gradient-to-br from-background-card to-neon-green/[0.02]">
                      <h3 className="text-sm font-mono font-bold flex items-center gap-2 uppercase text-neon-green">
                        <TrendingUp size={16} />
                        Proficiency Index
                      </h3>
                      <div className="space-y-4">
                        <CategoryProgress category="Web Exploitation" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'web').length || 0} total={12} />
                        <CategoryProgress category="Reverse Engineering" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'rev').length || 0} total={8} />
                        <CategoryProgress category="Cryptography" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'crypto').length || 0} total={10} />
                        <CategoryProgress category="Forensics" solved={profile?.solvedChallenges?.filter((c: any) => c.category === 'forensics').length || 0} total={6} />
                      </div>
                   </div>

                   {/* Bio & Social Display */}
                   <div className="card p-6 space-y-6 border-neon-green/10">
                      <div className="flex justify-between items-center border-b border-surface-border pb-3">
                        <h3 className="text-sm font-mono font-bold flex items-center gap-2 uppercase">
                          <MessageSquare size={16} className="text-neon-green" />
                          About Operative
                        </h3>
                        <Share2 size={14} className="text-zinc-600 cursor-pointer hover:text-neon-green transition-colors" />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-lg border border-zinc-800/50">
                          {profile?.bio ? (
                            <p className="text-xs text-text-secondary leading-relaxed italic">
                              "{profile.bio}"
                            </p>
                          ) : (
                            <p className="text-xs text-zinc-600 italic">No biographical data found in system memory.</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {profile?.socialLinks?.github && (
                            <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded border border-zinc-800 hover:border-neon-green/50 transition-all group">
                              <Github size={14} className="text-zinc-500 group-hover:text-neon-green" />
                              <span className="text-[10px] font-bold">GITHUB</span>
                            </a>
                          )}
                          {profile?.socialLinks?.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded border border-zinc-800 hover:border-blue-500/50 transition-all group">
                              <Linkedin size={14} className="text-zinc-500 group-hover:text-blue-500" />
                              <span className="text-[10px] font-bold">LINKEDIN</span>
                            </a>
                          )}
                          {profile?.socialLinks?.instagram && (
                            <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded border border-zinc-800 hover:border-pink-500/50 transition-all group">
                              <Instagram size={14} className="text-zinc-500 group-hover:text-pink-500" />
                              <span className="text-[10px] font-bold">INSTAGRAM</span>
                            </a>
                          )}
                          {!profile?.socialLinks?.github && !profile?.socialLinks?.linkedin && !profile?.socialLinks?.instagram && (
                             <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2">
                                <GlobeIcon size={12} />
                                SOCIAL_LINKS_DISCONNECTED
                             </div>
                          )}
                        </div>
                      </div>
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
            ) : activeTab === 'profile' ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl space-y-8"
              >
                <div className="card p-8 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold flex items-center gap-3 uppercase italic text-neon-green">
                      <UserIcon size={20} />
                      PROFILE_CUSTOMIZATION
                    </h3>
                    <p className="text-xs text-text-muted font-mono leading-relaxed">
                      Update your profile information and social links to make your profile more discoverable.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitProfile((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                    {/* Bio */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Bio</label>
                      <textarea 
                        placeholder="Tell us about yourself..."
                        className="input h-24 resize-none"
                        {...registerProfile('bio')}
                        maxLength={200}
                      />
                      <p className="text-[8px] text-text-muted">Max 200 characters</p>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Country</label>
                      <input 
                        type="text"
                        placeholder="Your country..."
                        className="input"
                        {...registerProfile('country')}
                      />
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4 border-t border-surface-border pt-6">
                      <h4 className="text-sm font-bold flex items-center gap-2 text-neon-green uppercase">
                        <LinkIcon size={16} />
                        SOCIAL_LINKS
                      </h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-2">
                          <Mail size={12} />
                          LinkedIn URL
                        </label>
                        <input 
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className="input"
                          {...registerProfile('socialLinks.linkedin')}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex items-center gap-2">
                          GitHub
                        </label>
                        <input 
                          type="url"
                          placeholder="https://github.com/username"
                          className="input"
                          {...registerProfile('socialLinks.github')}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Instagram URL</label>
                        <input 
                          type="url"
                          placeholder="https://instagram.com/username"
                          className="input"
                          {...registerProfile('socialLinks.instagram')}
                        />
                      </div>
                    </div>

                    {/* Profile Visibility */}
                    <div className="border-t border-surface-border pt-6 space-y-4">
                      <h4 className="text-sm font-bold flex items-center gap-2 text-neon-green uppercase">
                        <Globe size={16} />
                        PRIVACY_SETTINGS
                      </h4>
                      
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox"
                          id="isPublic"
                          {...registerProfile('isProfilePublic')}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="isPublic" className="text-sm cursor-pointer text-text-primary">
                          Make my profile public (visible to other users)
                        </label>
                      </div>
                      <p className="text-xs text-text-muted italic">
                        When public, others can view your profile, challenges solved, and social links.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="btn-primary w-full py-3 text-xs tracking-[0.2em] font-black italic"
                    >
                      {updateProfileMutation.isPending ? "UPDATING_PROFILE..." : "SAVE_PROFILE"}
                    </button>
                  </form>
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

                    <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-6">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex justify-between">
                                Current Password
                                {passwordErrors.currentPassword && <span className="text-status-error flex items-center gap-1 lowercase"><AlertCircle size={10} /> required</span>}
                             </label>
                             <div className="relative">
                                <input 
                                  type={showCurrentPass ? "text" : "password"} 
                                  className={clsx("input", passwordErrors.currentPassword && "input-error")}
                                  placeholder="••••••••"
                                  {...registerPassword('currentPassword', { required: true })}
                                />
                                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                   {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-mono text-text-muted uppercase tracking-widest flex justify-between">
                                New Password
                                {passwordErrors.newPassword && <span className="text-status-error flex items-center gap-1 lowercase"><AlertCircle size={10} /> min 8 chars</span>}
                             </label>
                             <div className="relative">
                                <input 
                                  type={showNewPass ? "text" : "password"} 
                                  className={clsx("input", passwordErrors.newPassword && "input-error")}
                                  placeholder="••••••••"
                                  {...registerPassword('newPassword', { 
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
                                {passwordErrors.confirmPassword && <span className="text-status-error flex items-center gap-1 lowercase"><AlertCircle size={10} /> mismatches</span>}
                             </label>
                             <input 
                               type="password"
                               className={clsx("input", passwordErrors.confirmPassword && "input-error")}
                               placeholder="••••••••"
                               {...registerPassword('confirmPassword', { required: true })}
                             />
                          </div>
                       </div>

                       <button 
                         type="submit" 
                         disabled={passwordMutation.isPending}
                         className="btn-primary w-full py-3 text-xs tracking-[0.2em] font-black italic"
                       >
                          {passwordMutation.isPending ? "INITIALIZING_OVERRIDE..." : "OVERRIDE_SECURITY"}
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

           {/* Certificate Button - Show if user has solved 5 or more challenges */}
           {profile && (profile.solvedChallenges?.length || 0) >= 5 && (
             <motion.button
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               onClick={() => setShowCertificateModal(true)}
               className="w-full py-4 px-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl hover:from-yellow-500/30 hover:to-orange-500/30 transition-all text-center group cursor-pointer"
             >
               <div className="flex items-center justify-center gap-2 mb-2">
                 <Award className="w-5 h-5 text-yellow-400 group-hover:animate-bounce" />
                 <span className="text-xs font-black uppercase tracking-widest text-yellow-400">
                   Achievement Unlocked
                 </span>
               </div>
               <p className="text-xs text-yellow-200 font-mono mb-2">
                 You've completed {profile.solvedChallenges?.length || 0} challenge{(profile.solvedChallenges?.length || 0) !== 1 ? 's' : ''}!
               </p>
               <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded inline-block text-yellow-300">
                 View & Share Certificate
               </span>
             </motion.button>
           )}

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

      {/* Certificate Modal */}
      {profile && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          data={{
            userName: profile.username,
            challengeName: `${profile.solvedChallenges?.length || 0} Cybersecurity Challenge${(profile.solvedChallenges?.length || 0) !== 1 ? 's' : ''}`,
            completionDate: new Date(),
            totalChallenges: profile.solvedChallenges?.length || 0,
            platformName: 'FsocietyPK',
            platformURL: 'https://fsocietypk.com',
          }}
        />
      )}
    </div>
  );
};

export default Profile;
