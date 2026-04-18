import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Settings,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Camera,
  Link as LinkIcon,
  Globe,
  Activity,
  MapPin,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Instagram,
  Award,
  Shield,
  TrendingUp,
  Hash,
  CheckCircle2,
  History,
  Trophy,
  MessageSquare,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService, ChangePasswordPayload, UpdateProfilePayload } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format, isValid } from 'date-fns';
import { clsx } from 'clsx';
import CertificateModal from '../components/common/CertificateModal';

// ── Sub-components ────────────────────────────────────────────────

const CategoryProgress = ({ category, solved, total }: { category: string; solved: number; total: number }) => {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider">
        <span className="text-zinc-400">{category}</span>
        <span className="text-neon-green font-bold">{solved}/{total}</span>
      </div>
      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-neon-green/60 to-neon-green rounded-full"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) => (
  <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-neon-green/30 transition-colors group">
    <div className={clsx('p-2.5 rounded-lg', color, 'bg-opacity-10')}>
      <Icon className={clsx('w-4 h-4', color.replace('bg-', 'text-'))} />
    </div>
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{label}</p>
      <p className="font-black text-white text-sm font-mono">{value}</p>
    </div>
  </div>
);

// ── Main Page Component ───────────────────────────────────────────

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'settings'>('overview');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const formatSafeDate = (value?: string) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    return isValid(parsed) ? format(parsed, 'MMM dd, yyyy') : 'N/A';
  };

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    select: (res) => res.data,
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('INVALID_FILE: Please select an image.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error('Failed to read file');
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setLocalAvatar(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const { user: authUser, setUser } = useAuthStore();

  const handleConfirmUpload = () => {
    if (localAvatar && profile?._id) {
      const id = toast.loading('UPLOADING_AVATAR...');
      updateProfileMutation.mutate({ avatar: localAvatar }, {
        onSuccess: () => {
          toast.dismiss(id);
          toast.success('✓ AVATAR_SYNC_COMPLETE');
          setLocalAvatar(null);
          setTimeout(() => refetch(), 500);
        },
        onError: (err: any) => {
          toast.dismiss(id);
          setLocalAvatar(null);
          toast.error(err.response?.data?.message || 'UPLOAD_FAILED');
        }
      });
    }
  };

  const handleCancelUpload = () => setLocalAvatar(null);

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<ChangePasswordPayload>();
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, setValue } = useForm<UpdateProfilePayload>();

  useEffect(() => {
    if (profile) {
      setValue('username', profile.username || '');
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
      toast.success('PASSWORD_UPDATED');
      resetPassword();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'FAILED_TO_UPDATE'),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) => userService.updateProfile(data),
    onSuccess: (res) => {
      if (res.data) {
        const { rank, solveHistory, proficiencyIndex, ...userData } = res.data as any;
        setUser({ ...authUser!, ...userData });
        toast.success('✓ PROFILE_SAVED');
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'FAILED_TO_UPDATE_PROFILE'),
  });

  const handlePasswordSubmit = (data: ChangePasswordPayload) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
    passwordMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
          <p className="font-mono text-neon-green text-xs animate-pulse tracking-widest">ACCESSING_SECURE_VAULT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-mono text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-green/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-10 max-w-7xl">

        {/* ── PROFILE HERO BANNER ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 rounded-2xl border border-zinc-800 overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-950"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/60 to-transparent" />
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />

          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1.5 bg-neon-green/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <input type="file" accept="image/*" className="hidden" id="avatarUpdate" onChange={handleAvatarUpload} />
                <label
                  htmlFor="avatarUpdate"
                  className="relative block w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-zinc-700 group-hover:border-neon-green/60 transition-all cursor-pointer overflow-hidden bg-zinc-900"
                >
                  {(localAvatar || profile?.avatar) ? (
                    <img src={localAvatar || profile?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-neon-green/30 group-hover:text-neon-green/60 transition-colors">
                      {profile?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="w-6 h-6 text-neon-green" />
                    <span className="text-[9px] text-white uppercase tracking-widest">UPDATE</span>
                  </div>
                </label>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 bg-neon-green text-black text-[10px] font-black px-2.5 py-1 rounded-lg shadow-[0_0_10px_rgba(0,255,65,0.5)]">
                  LVL {Math.floor((profile?.score || 0) / 1000) + 1}
                </div>
              </div>

              {/* Avatar confirm bar */}
              <AnimatePresence>
                {localAvatar && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-4 right-4 flex flex-col gap-2 p-4 bg-zinc-900 border border-neon-green/40 rounded-xl shadow-2xl z-10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                      <p className="text-[9px] text-neon-green uppercase tracking-widest font-bold">Confirm new avatar?</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleConfirmUpload} disabled={updateProfileMutation.isPending}
                        className="flex-1 px-3 py-1.5 bg-neon-green text-black text-[10px] font-black rounded-lg uppercase hover:brightness-110 disabled:opacity-50 transition-all">
                        {updateProfileMutation.isPending ? 'Uploading...' : 'Confirm'}
                      </button>
                      <button onClick={handleCancelUpload} className="flex-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-lg uppercase hover:bg-zinc-700 transition-all">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none drop-shadow-[0_0_20px_rgba(0,255,65,0.3)]">
                      {profile?.username || 'OPERATIVE'}
                    </h1>
                    <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                      {profile?.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[9px] text-red-400 font-bold tracking-widest uppercase flex items-center gap-1">
                          <Shield size={9} /> ROOT
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-neon-green/10 border border-neon-green/30 rounded text-[9px] text-neon-green font-bold tracking-widest uppercase flex items-center gap-1">
                        <Activity size={9} /> {profile?.solvedChallenges?.length || 0} SOLVES
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[9px] text-zinc-400 font-bold tracking-widest uppercase flex items-center gap-1">
                        <Hash size={9} /> {profile?._id?.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Bio preview */}
                  {profile?.bio && (
                    <p className="text-sm text-zinc-400 max-w-lg leading-relaxed border-l-2 border-neon-green/40 pl-3">
                      {profile.bio}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-[10px] text-zinc-500 uppercase tracking-widest">
                    {profile?.country && (
                      <span className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                        <MapPin size={11} className="text-neon-green" /> {profile.country}
                      </span>
                    )}
                    {profile?.createdAt && (
                      <span className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
                        <Calendar size={11} className="text-neon-green" /> SINCE {format(new Date(profile.createdAt), 'MMM yyyy').toUpperCase()}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Globe size={11} className="text-neon-green" />
                      {profile?.isProfilePublic ? 'PUBLIC ENCLAVE' : 'PRIVATE SECTOR'}
                    </span>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                  <div className="bg-zinc-900/60 border border-zinc-800 hover:border-neon-green/40 px-5 py-3 rounded-xl transition-colors group">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5 group-hover:text-neon-green/60 transition-colors">GLOBAL RANK</p>
                    <p className="text-2xl font-black text-neon-green italic">#{profile?.rank || '—'}</p>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 px-5 py-3 rounded-xl transition-colors group">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5 group-hover:text-blue-400/60 transition-colors">TOTAL EXP</p>
                    <p className="text-2xl font-black text-white italic">{Number(profile?.score || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-800 hover:border-yellow-500/40 px-5 py-3 rounded-xl transition-colors group">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5 group-hover:text-yellow-400/60 transition-colors">CHALLENGES</p>
                    <p className="text-2xl font-black text-white italic">{profile?.solvedChallenges?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left – Tabs + Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tab bar */}
            <div className="flex gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl w-fit">
              {([
                { id: 'overview', label: 'ANALYTICS', icon: Activity },
                { id: 'profile', label: 'PROFILE', icon: UserIcon },
                { id: 'settings', label: 'SETTINGS', icon: Settings },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold tracking-widest transition-all',
                    activeTab === tab.id
                      ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  )}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Proficiency */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                      <h3 className="text-xs font-bold flex items-center gap-2 text-neon-green uppercase tracking-widest">
                        <TrendingUp size={14} /> Proficiency Index
                      </h3>
                      <div className="space-y-4">
                        {(profile as any)?.proficiencyIndex?.length > 0 ? (
                          (profile as any).proficiencyIndex.map((stat: any) => (
                            <CategoryProgress
                              key={stat.category}
                              category={stat.category === 'rev' ? 'Reverse Engineering' : stat.category === 'web' ? 'Web Exploitation' : stat.category.charAt(0).toUpperCase() + stat.category.slice(1)}
                              solved={stat.solved}
                              total={stat.total}
                            />
                          ))
                        ) : (
                          <p className="text-center text-zinc-600 text-xs italic py-8">NO_DATA_AVAILABLE</p>
                        )}
                      </div>
                    </div>

                    {/* About */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                      <div className="flex justify-between items-center border-b border-zinc-800/60 pb-3">
                        <h3 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest">
                          <MessageSquare size={14} className="text-neon-green" /> About Operative
                        </h3>
                        {profile?.country && (
                          <span className="flex items-center gap-1 text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                            <MapPin size={9} className="text-neon-green" /> {profile.country}
                          </span>
                        )}
                      </div>

                      <div className="space-y-5">
                        {/* Bio */}
                        <div className="relative pl-3 border-l-2 border-neon-green/30 hover:border-neon-green transition-colors">
                          {profile?.bio ? (
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              <span className="text-neon-green/40 text-xs mr-2">$ cat bio.txt</span>
                              {profile.bio}
                              <span className="inline-block w-1.5 h-4 bg-neon-green ml-1 animate-pulse align-middle" />
                            </p>
                          ) : (
                            <p className="text-sm text-zinc-600 italic">
                              <span className="text-neon-green/30 text-xs mr-2">$ cat bio.txt</span>
                              No bio found.
                            </p>
                          )}
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-black/30 border border-zinc-800/50 rounded-lg flex flex-col gap-1">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Calendar size={9} /> Joined</span>
                            <span className="text-xs font-bold text-zinc-200">
                              {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM dd, yyyy').toUpperCase() : 'UNKNOWN'}
                            </span>
                          </div>
                          <div className="p-3 bg-black/30 border border-zinc-800/50 rounded-lg flex flex-col gap-1">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-1"><Shield size={9} /> Account</span>
                            <span className={clsx("text-xs font-bold uppercase", profile?.role === 'admin' ? 'text-red-400' : 'text-neon-green')}>
                              {profile?.role === 'admin' ? 'ROOT_ACCESS' : 'OPERATIVE'}
                            </span>
                          </div>
                        </div>

                        {/* Social links */}
                        <div className="space-y-2">
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Social Links</p>
                          <div className="flex flex-wrap gap-2">
                            {profile?.socialLinks?.github && (
                              <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-neon-green/50 hover:bg-neon-green/5 transition-all group text-[10px]">
                                <Github size={12} className="text-zinc-500 group-hover:text-neon-green transition-colors" /> GitHub
                                <ExternalLink size={9} className="text-zinc-700 group-hover:text-neon-green/50" />
                              </a>
                            )}
                            {profile?.socialLinks?.linkedin && (
                              <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group text-[10px]">
                                <Linkedin size={12} className="text-zinc-500 group-hover:text-blue-400 transition-colors" /> LinkedIn
                                <ExternalLink size={9} className="text-zinc-700 group-hover:text-blue-500/50" />
                              </a>
                            )}
                            {profile?.socialLinks?.instagram && (
                              <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group text-[10px]">
                                <Instagram size={12} className="text-zinc-500 group-hover:text-pink-400 transition-colors" /> Instagram
                                <ExternalLink size={9} className="text-zinc-700 group-hover:text-pink-500/50" />
                              </a>
                            )}
                            {!profile?.socialLinks?.github && !profile?.socialLinks?.linkedin && !profile?.socialLinks?.instagram && (
                              <span className="text-[10px] text-zinc-600 italic px-3 py-1.5 border border-dashed border-zinc-800 rounded-lg">No links configured</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solve history */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-black flex items-center gap-3 uppercase italic tracking-tight">
                      <History size={18} className="text-neon-green" /> Recent Operations
                    </h2>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left font-mono text-sm">
                        <thead className="bg-black border-b border-zinc-800 text-[9px] text-zinc-500 uppercase tracking-widest">
                          <tr>
                            <th className="px-6 py-3">Mission</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Bounty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {!profile?.solveHistory?.length ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-zinc-600 italic text-xs">No missions cleared yet. Gear up!</td>
                            </tr>
                          ) : profile?.solveHistory?.filter((solve: any) => solve.pointsAwarded > 0).map((solve: any) => (
                            <tr key={solve._id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="px-6 py-3.5 font-bold text-zinc-100 capitalize text-xs">{solve.challengeId?.title}</td>
                              <td className="px-6 py-3.5">
                                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] uppercase text-zinc-400">{solve.challengeId?.category}</span>
                              </td>
                              <td className="px-6 py-3.5 text-zinc-500 text-[10px]">{formatSafeDate(solve?.timestamp)}</td>
                              <td className="px-6 py-3.5 text-right font-black text-neon-green">+{solve.pointsAwarded}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── PROFILE EDIT TAB ── */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="max-w-2xl">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-8">
                    <div>
                      <h3 className="text-lg font-black flex items-center gap-3 uppercase italic text-neon-green tracking-tight">
                        <UserIcon size={18} /> Profile Customization
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Update your display info and social links.</p>
                    </div>

                    <form onSubmit={handleSubmitProfile((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest">Bio</label>
                        <textarea placeholder="Tell us about yourself..." className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono h-24 resize-none focus:border-neon-green/50 outline-none transition-colors text-white placeholder-zinc-700" maxLength={200} {...registerProfile('bio')} />
                        <p className="text-[9px] text-zinc-600">Max 200 characters</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest">Country</label>
                        <select className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-neon-green/50 outline-none transition-colors text-white" {...registerProfile('country')}>
                          <option value="">Select region...</option>
                          <option value="US">🇺🇸 United States</option>
                          <option value="GB">🇬🇧 United Kingdom</option>
                          <option value="PK">🇵🇰 Pakistan</option>
                          <option value="IN">🇮🇳 India</option>
                          <option value="CA">🇨🇦 Canada</option>
                          <option value="AU">🇦🇺 Australia</option>
                          <option value="FR">🇫🇷 France</option>
                          <option value="DE">🇩🇪 Germany</option>
                          <option value="BR">🇧🇷 Brazil</option>
                          <option value="JP">🇯🇵 Japan</option>
                          <option value="OTHER">🌍 Other</option>
                        </select>
                      </div>

                      <div className="space-y-4 border-t border-zinc-800/60 pt-6">
                        <h4 className="text-xs font-bold flex items-center gap-2 text-neon-green uppercase tracking-widest">
                          <LinkIcon size={13} /> Social Links
                        </h4>
                        {[
                          { label: 'LinkedIn URL', field: 'socialLinks.linkedin' as const, icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
                          { label: 'GitHub URL', field: 'socialLinks.github' as const, icon: Github, placeholder: 'https://github.com/username' },
                          { label: 'Instagram URL', field: 'socialLinks.instagram' as const, icon: Instagram, placeholder: 'https://instagram.com/username' },
                        ].map(({ label, field, icon: Icon, placeholder }) => (
                          <div key={field} className="space-y-1.5">
                            <label className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Icon size={10} /> {label}</label>
                            <input type="url" placeholder={placeholder} className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-neon-green/50 outline-none transition-colors text-white placeholder-zinc-700" {...registerProfile(field as any)} />
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-zinc-800/60 pt-6 space-y-3">
                        <h4 className="text-xs font-bold flex items-center gap-2 text-neon-green uppercase tracking-widest"><Globe size={13} /> Privacy</h4>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" id="isPublic" className="w-4 h-4 accent-neon-green cursor-pointer" {...registerProfile('isProfilePublic')} />
                          <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Make profile public</span>
                        </label>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={updateProfileMutation.isPending} className="flex-1 py-3 bg-neon-green text-black font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                          {updateProfileMutation.isPending ? 'SAVING...' : 'SAVE PROFILE'}
                        </button>
                        <button type="button" onClick={() => resetProfile()} className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs uppercase rounded-lg hover:text-white hover:border-zinc-600 transition-all">
                          RESET
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ── SETTINGS TAB ── */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="max-w-2xl space-y-6">
                  {/* Username Change Section */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-black flex items-center gap-3 uppercase italic text-neon-green tracking-tight">
                        <UserIcon size={18} /> Identity Override
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">Update your username and account settings.</p>
                    </div>

                    <form onSubmit={handleSubmitProfile((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest">New Username</label>
                        <input type="text" placeholder="Your new username..." className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono focus:border-neon-green/50 outline-none transition-colors text-white placeholder-zinc-700" {...registerProfile('username')} />
                      </div>

                      <button type="submit" disabled={updateProfileMutation.isPending} className="w-full py-3 bg-neon-green text-black font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                        {updateProfileMutation.isPending ? 'UPDATING...' : 'UPDATE USERNAME'}
                      </button>
                    </form>
                  </div>

                  {/* Password Change Section */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:p-8 space-y-8">
                    <div>
                      <h3 className="text-lg font-black flex items-center gap-3 uppercase italic text-neon-green tracking-tight">
                        <Lock size={18} /> Security Override
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">Update authentication credentials.</p>
                    </div>

                    <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-5">
                      {[
                        { label: 'Current Password', field: 'currentPassword' as const, show: showCurrentPass, setShow: setShowCurrentPass, error: passwordErrors.currentPassword, rules: { required: true } },
                        { label: 'New Password', field: 'newPassword' as const, show: showNewPass, setShow: setShowNewPass, error: passwordErrors.newPassword, rules: { required: true, minLength: 8, validate: (v: string) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) || 'Weak' } },
                      ].map(({ label, field, show, setShow, error, rules }) => (
                        <div key={field} className="space-y-1.5">
                          <label className="text-[10px] text-zinc-400 uppercase tracking-widest flex justify-between">
                            {label}
                            {error && <span className="text-red-400 flex items-center gap-1 lowercase"><AlertCircle size={9} /> required</span>}
                          </label>
                          <div className="relative">
                            <input type={show ? 'text' : 'password'} className={clsx('w-full bg-black border rounded-lg px-4 py-2.5 text-sm font-mono outline-none transition-colors text-white placeholder-zinc-700', error ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-neon-green/50')} placeholder="••••••••" {...registerPassword(field, rules)} />
                            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                              {show ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 uppercase tracking-widest flex justify-between">
                          Confirm New Password
                          {passwordErrors.confirmPassword && <span className="text-red-400 flex items-center gap-1 lowercase"><AlertCircle size={9} /> mismatch</span>}
                        </label>
                        <input type="password" className={clsx('w-full bg-black border rounded-lg px-4 py-2.5 text-sm font-mono outline-none transition-colors text-white placeholder-zinc-700', passwordErrors.confirmPassword ? 'border-red-500/50' : 'border-zinc-800 focus:border-neon-green/50')} placeholder="••••••••" {...registerPassword('confirmPassword', { required: true })} />
                      </div>

                      <button type="submit" disabled={passwordMutation.isPending} className="w-full py-3 bg-neon-green text-black font-black text-xs uppercase tracking-widest rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,255,65,0.2)] mt-2">
                        {passwordMutation.isPending ? 'UPDATING...' : 'OVERRIDE SECURITY'}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right – Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-3">Mission Status</h2>
            <div className="space-y-3">
              <StatCard icon={Trophy} label="Global Rank" value={`#${profile?.rank || '—'}`} color="bg-neon-green" />
              <StatCard icon={CheckCircle2} label="Challenges Solved" value={profile?.solvedChallenges?.length || 0} color="bg-green-500" />
              <StatCard icon={Activity} label="Total Points" value={Number(profile?.score || 0).toLocaleString()} color="bg-blue-500" />
            </div>

            {/* Certificate CTA */}
            {profile && (profile.solvedChallenges?.length || 0) >= 5 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowCertificateModal(true)}
                className="w-full py-5 px-4 bg-gradient-to-br from-yellow-500/15 via-orange-500/10 to-transparent border border-yellow-500/40 rounded-xl hover:border-yellow-500/70 transition-all text-center group cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Achievement Unlocked</span>
                </div>
                <p className="text-xs text-yellow-200/70 font-mono mb-3">
                  {profile.solvedChallenges?.length} challenge{(profile.solvedChallenges?.length || 0) !== 1 ? 's' : ''} completed!
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-lg inline-block text-yellow-300 group-hover:bg-yellow-500/25 transition-colors">
                  View & Share Certificate →
                </span>
              </motion.button>
            )}

            {/* Notice */}
            <div className="bg-neon-green/5 border border-neon-green/20 rounded-xl p-5">
              <p className="text-[9px] text-neon-green uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                <AlertCircle size={10} /> Sector Notice
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ranks update in real-time. Keep solving to climb the global leaderboard.
              </p>
            </div>
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
