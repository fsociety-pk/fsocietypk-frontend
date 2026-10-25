import PageHeading from "../../components/common/PageHeading";
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProfileService } from '../../services/adminProfileService';
import {
  Save,
  User,
  Github,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const AdminAboutAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => adminProfileService.getProfile(),
    select: (res) => res.data,
  });

  const [formData, setFormData] = React.useState({
    name: '',
    bio: '',
    profileImage: '',
    links: {
      github: '',
      linkedin: '',
      portfolio: '',
    },
    socialLinks: [] as { platform: string; url: string }[],
  });

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        profileImage: profile.profileImage || '',
        links: {
          github: profile.links?.github || '',
          linkedin: profile.links?.linkedin || '',
          portfolio: profile.links?.portfolio || '',
        },
        socialLinks: profile.socialLinks || [],
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminProfileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      toast.success('Profile saved.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Could not save profile.';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: '', url: '' }],
    });
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks.splice(index, 1);
    setFormData({ ...formData, socialLinks: newSocialLinks });
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
    setFormData({ ...formData, socialLinks: newSocialLinks });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/20 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <PageHeading eyebrow="Admin workspace" title="Admin profile" description="Update the profile shown to your community." />
      </div>

      {!profile?.name && (
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-brand/10 border border-brand/30 rounded-xl flex items-center gap-4"
        >
           <div className="p-2 bg-brand/20 rounded-lg">
              <AlertCircle size={20} className="text-brand" />
           </div>
           <div>
              <p className="text-sm font-bold text-text-primary uppercase tracking-tight">Profile Not Initialized</p>
              <p className="text-xs font-sans text-brand uppercase tracking-widest">No profile found on the grid. Please fill the form below to establish your identity.</p>
           </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="card p-6 bg-background-card border-surface-border space-y-6">
            <div className="flex items-center gap-3 border-b border-surface-border pb-4 mb-4">
               <User size={18} className="text-brand" />
               <h3 className="font-sans font-bold text-text-primary uppercase tracking-widest text-sm">Profile details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-text-muted uppercase mb-1 tracking-widest">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none transition-all"
                  placeholder="e.g. Elliot Alderson"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-text-muted uppercase mb-1 tracking-widest">Avatar URL</label>
                <div className="flex gap-4 items-start">
                  <input
                    type="text"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    className="flex-1 bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none transition-all"
                    placeholder="https://images.com/avatar.jpg"
                  />
                  {formData.profileImage && (
                    <div className="w-10 h-10 rounded border border-surface-border bg-background overflow-hidden shrink-0">
                      <img src={formData.profileImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans text-text-muted uppercase mb-1 tracking-widest">About you</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none transition-all h-32 resize-none"
                  placeholder="Write a short introduction for members."
                  required
                />
              </div>
            </div>
          </div>

          {/* Core Social Links */}
          <div className="card p-6 bg-background-card border-surface-border space-y-6">
            <div className="flex items-center gap-3 border-b border-surface-border pb-4 mb-4">
               <Globe size={18} className="text-brand" />
               <h3 className="font-sans font-bold text-text-primary uppercase tracking-widest text-sm">Social links</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Github size={14} className="text-text-muted" />
                  <span className="text-xs font-sans text-text-muted uppercase tracking-widest">GitHub Profile</span>
                </div>
                <input
                  type="url"
                  value={formData.links.github}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none"
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Linkedin size={14} className="text-text-muted" />
                  <span className="text-xs font-sans text-text-muted uppercase tracking-widest">LinkedIn Profile</span>
                </div>
                <input
                  type="url"
                  value={formData.links.linkedin}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, linkedin: e.target.value } })}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={14} className="text-text-muted" />
                  <span className="text-xs font-sans text-text-muted uppercase tracking-widest">Website</span>
                </div>
                <input
                  type="url"
                  value={formData.links.portfolio}
                  onChange={(e) => setFormData({ ...formData, links: { ...formData.links, portfolio: e.target.value } })}
                  className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Social Links */}
        <div className="card p-6 bg-background-card border-surface-border">
          <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-6">
             <div className="flex items-center gap-3">
                <Plus size={18} className="text-brand" />
                <h3 className="font-sans font-bold text-text-primary uppercase tracking-widest text-sm">More links</h3>
             </div>
             <button
               type="button"
               onClick={addSocialLink}
               className="text-xs font-sans font-bold bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded hover:bg-brand/20 transition-all uppercase"
             >
               Add Link
             </button>
          </div>

          <div className="space-y-4">
            {formData.socialLinks.map((link, index) => (
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                key={index}
                className="flex gap-4 items-end bg-surface/30 p-4 rounded-xl border border-surface-border/50"
              >
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-sans text-text-muted uppercase tracking-widest">Platform Name</label>
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none"
                    placeholder="e.g. Twitter, YouTube"
                  />
                </div>
                <div className="flex-[2] space-y-2">
                  <label className="text-xs font-sans text-text-muted uppercase tracking-widest">Target URL</label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="w-full bg-surface border border-surface-border rounded-lg px-4 py-2 text-text-primary font-sans text-sm focus:border-brand/50 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="p-2.5 text-status-error bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}

            {formData.socialLinks.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-surface-border rounded-xl">
                 <p className="text-xs font-sans text-text-muted uppercase tracking-widest">No extra links yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-surface-border">
           <div className="flex items-center gap-2 text-text-muted">
              {updateMutation.isPending ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <AlertCircle size={16} />
                 </motion.div>
              ) : (
                <CheckCircle2 size={16} className="text-brand" />
              )}
              <span className="text-xs font-sans uppercase tracking-widest">
                {updateMutation.isPending ? 'Saving profile…' : 'Profile details'}
              </span>
           </div>

           <button
            type="submit"
            disabled={updateMutation.isPending}
            className={clsx(
              "flex items-center gap-2 px-8 py-3 rounded-lg font-sans font-bold text-sm tracking-widest transition-all",
              updateMutation.isPending
                ? "bg-brand/50 text-on-brand cursor-not-allowed"
                : "bg-brand text-on-brand hover:bg-brand/90 hover:shadow-sm"
            )}
          >
            <Save size={18} />
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAboutAdmin;
