import PageHeading from "../components/common/PageHeading";
import PageState from '../components/common/PageState';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, BookOpen, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resourceService, IResource } from '../services/resource.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const categoryOptions = [
  { value: 'web', label: 'Web Security' },
  { value: 'crypto', label: 'Cryptography' },
  { value: 'forensics', label: 'Forensics' },
  { value: 'reverse-engineering', label: 'Reverse Engineering' },
  { value: 'pwn', label: 'Binary Exploitation' },
  { value: 'osint', label: 'OSINT' },
  { value: 'tools', label: 'Tools & Utilities' },
  { value: 'general', label: 'General' },
];

interface ResourcesProps {
  showDashboardSection?: boolean;
}

const ResourceCard = ({ resource }: { resource: IResource }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -4 }}
    transition={{ duration: .22, ease: 'easeOut' }}
    className="resource-card group bg-background-card border border-surface-border rounded-xl p-6 hover:border-brand/30 transition-all duration-300 hover:shadow-sm"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-bold text-sm text-brand mb-1 line-clamp-2">{resource.title}</h4>
        <p className="text-xs text-text-muted uppercase tracking-[0.1em] font-bold">
          {categoryOptions.find(c => c.value === resource.category)?.label || resource.category}
        </p>
      </div>
    </div>

    <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">{resource.description}</p>

    <div className="flex items-center justify-between pt-4 border-t border-surface-border">
      <div className="flex items-center gap-2">
        {resource.createdBy?.avatar && (
          <img src={resource.createdBy.avatar} alt={resource.createdBy.username} className="w-5 h-5 rounded-full" />
        )}
        <span className="text-xs text-text-muted font-sans">{resource.createdBy?.username}</span>
      </div>
      <a
        href={resource.githubLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors text-xs font-bold text-brand uppercase tracking-wider"
      >
        <Github className="w-3.5 h-3.5" />
        <span>Visit</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </motion.div>
);

export const Resources: React.FC<ResourcesProps> = ({ showDashboardSection = false }) => {
  const authenticated = useAuthStore(s => s.isAuthenticated);
  const navigate = useNavigate();
  const [loadError, setLoadError] = useState(false);
  const shareResource = () => { if (!authenticated) { navigate('/login', { state: { from: { pathname: '/resources' } } }); return; } setShowSubmitForm(v => !v); };
  const [resources, setResources] = useState<IResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubLink: '',
    category: 'web',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await resourceService.getApprovedResources();
      if (response.success) {
        setResources(response.data || []);
      }
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.githubLink) {
      toast.error('Please fill in all fields');
      return;
    }

    let validRepository = false;
    try { const url = new URL(formData.githubLink); validRepository = url.protocol === 'https:' && url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2; } catch { /* Report validation below. */ }
    if (!validRepository) {
      toast.error('Please provide a valid GitHub repository link');
      return;
    }

    try {
      setSubmitting(true);
      const response = await resourceService.submitResource(formData);
      if (response.success) {
        toast.success('Resource submitted successfully! It will be reviewed by admins.');
        setFormData({ title: '', description: '', githubLink: '', category: 'web' });
        setShowSubmitForm(false);
        fetchResources();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit resource');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredResources = selectedCategory === 'all'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  if (showDashboardSection) {
    return (
      <motion.section variants={itemVariants} className="space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="text-brand w-5 h-5" />
          <h2 className="text-lg font-semibold uppercase tracking-[0.2em]">Learning Resources</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-brand/20 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resources.slice(0, 4).map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>

        <motion.div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <p className="text-xs text-text-muted font-sans">
            Total {resources.length} resource{resources.length !== 1 ? 's' : ''} available
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <a
              href="/resources"
              className="flex-1 sm:flex-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-background-elevated border border-surface-border hover:border-brand/40 rounded-lg transition-all text-xs font-bold text-text-secondary hover:text-brand uppercase tracking-wider"
            >
              View All Resources
            </a>
            <button
              onClick={shareResource}
              className="flex-1 sm:flex-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand/10 border border-brand/30 hover:bg-brand/20 rounded-lg transition-all text-xs font-bold text-brand uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              Share Resource
            </button>
          </div>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <div className="relative min-h-screen bg-background font-sans text-text-primary overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-brand/3 blur-[150px] rounded-full" />
      </div>

      <div className="page-wrap relative z-10">
        <motion.div variants={containerVariants} initial={false} animate="visible" className="space-y-7">
          <PageHeading eyebrow="Learn with the community" title="Learning resources" description="Find guides, tools, and practice material shared by the community. Each resource links to a GitHub project." />

          {/* Submit Form */}
          {showSubmitForm && (
            <motion.div
              variants={itemVariants}
              className="bg-background-card border border-brand/20 rounded-xl p-8 space-y-6"
            >
              <h3 className="text-lg font-bold text-brand uppercase tracking-wider">Share Your Resource</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. A guide to web security"
                    className="w-full px-4 py-2.5 bg-background-elevated border border-surface-border rounded-lg text-text-primary placeholder-zinc-600 focus:outline-none focus:border-brand/50 transition-colors"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what this resource teaches..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background-elevated border border-surface-border rounded-lg text-text-primary placeholder-zinc-600 focus:outline-none focus:border-brand/50 transition-colors resize-none"
                    maxLength={1000}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      GitHub Repository Link
                    </label>
                    <input
                      type="url"
                      value={formData.githubLink}
                      onChange={e => setFormData({ ...formData, githubLink: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 bg-background-elevated border border-surface-border rounded-lg text-text-primary placeholder-zinc-600 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-background-elevated border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-brand/50 transition-colors"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-5 py-2.5 bg-brand text-on-brand font-bold uppercase tracking-wider rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Resource'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="flex-1 px-5 py-2.5 bg-background-elevated border border-surface-border text-text-primary font-bold uppercase tracking-wider rounded-lg hover:border-surface-border transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {[{ value: 'all', label: 'All Resources' }, ...categoryOptions].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-brand text-on-brand'
                      : 'bg-background-elevated border border-surface-border text-text-secondary hover:border-brand/30'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Submit CTA */}
          {!showSubmitForm && (
            <motion.button
              variants={itemVariants}
              onClick={shareResource}
              className="w-full px-6 py-4 bg-brand/10 border-2 border-brand/30 hover:border-brand/60 rounded-xl transition-all flex items-center justify-center gap-3 group"
            >
              <Plus className="w-5 h-5 text-brand" />
              <div className="text-left">
                <p className="text-sm font-bold text-brand uppercase tracking-wider">Share a Resource</p>
                <p className="text-xs text-text-secondary">Help the community by sharing useful learning materials</p>
              </div>
            </motion.button>
          )}

          {/* Resources Grid */}
          {loading ? (
            <motion.div variants={itemVariants} className="flex items-center justify-center py-12">
              <p className="text-text-muted">Loading resources...</p>
            </motion.div>
          ) : loadError ? <PageState title="Resources could not be loaded" description="Please try again in a moment." retry={fetchResources} /> : filteredResources.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-background-card border border-surface-border rounded-xl p-8"
            >
              <AlertCircle className="w-12 h-12 text-text-muted" />
              <div>
                <p className="text-lg font-bold text-text-secondary mb-1">No Resources Found</p>
                <p className="text-sm text-text-muted">
                  {selectedCategory === 'all'
                    ? 'No learning resources available yet. Be the first to share one!'
                    : `No resources in the ${categoryOptions.find(c => c.value === selectedCategory)?.label} category yet.`}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial={false}
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredResources.map(resource => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Resources;
