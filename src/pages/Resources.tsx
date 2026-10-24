import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, BookOpen, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resourceService, IResource } from '../services/resource.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
    className="group rounded-lg border border-zinc-800 bg-zinc-950 p-6 transition-colors hover:border-neon-green/40"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-bold text-sm text-neon-green mb-1 line-clamp-2">{resource.title}</h4>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.1em] font-bold">
          {categoryOptions.find(c => c.value === resource.category)?.label || resource.category}
        </p>
      </div>
    </div>

    <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-3">{resource.description}</p>

    <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
      <div className="flex items-center gap-2">
        {resource.createdBy?.avatar && (
          <img src={resource.createdBy.avatar} alt={resource.createdBy.username} className="w-5 h-5 rounded-full" />
        )}
        <span className="text-[10px] text-zinc-500 font-mono">{resource.createdBy?.username}</span>
      </div>
      <a
        href={resource.githubLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-green/10 hover:bg-neon-green/20 rounded-lg transition-colors text-[10px] font-bold text-neon-green uppercase tracking-wider"
      >
        <Github className="w-3.5 h-3.5" />
        <span>Visit</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </motion.div>
);

export const Resources: React.FC<ResourcesProps> = ({ showDashboardSection = false }) => {
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
      const response = await resourceService.getApprovedResources();
      if (response.success) {
        setResources(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load resources');
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

    if (!formData.githubLink.includes('github.com')) {
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
          <BookOpen className="text-neon-green w-5 h-5" />
          <h2 className="text-lg font-black uppercase tracking-[0.2em]">Learning Resources</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-neon-green/20 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resources.slice(0, 4).map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>

        <motion.div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <p className="text-xs text-zinc-500 font-mono">
            Total {resources.length} resource{resources.length !== 1 ? 's' : ''} available
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <a
              href="/resources"
              className="flex-1 sm:flex-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-neon-green/40 rounded-lg transition-all text-xs font-bold text-zinc-300 hover:text-neon-green uppercase tracking-wider"
            >
              View All Resources
            </a>
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="flex-1 sm:flex-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neon-green/10 border border-neon-green/30 hover:bg-neon-green/20 rounded-lg transition-all text-xs font-bold text-neon-green uppercase tracking-wider"
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
    <div className="relative min-w-0 bg-background text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
          {/* Header */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-neon-green w-6 h-6" />
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                Learning Resources
              </h1>
            </div>
            <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Curated collection of learning resources shared by the community. All resources link directly to GitHub repositories with practical tools, tutorials, and exploit code.
            </p>
          </motion.section>

          {/* Submit Form */}
          {showSubmitForm && (
            <motion.div
              variants={itemVariants}
              className="bg-zinc-950 border border-neon-green/20 rounded-xl p-8 space-y-6"
            >
              <h3 className="text-lg font-bold text-neon-green uppercase tracking-wider">Share Your Resource</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Advanced SQL Injection Techniques"
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-neon-green/50 transition-colors"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what this resource teaches..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-neon-green/50 transition-colors resize-none"
                    maxLength={1000}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      GitHub Repository Link
                    </label>
                    <input
                      type="url"
                      value={formData.githubLink}
                      onChange={e => setFormData({ ...formData, githubLink: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-neon-green/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-neon-green/50 transition-colors"
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
                    className="flex-1 px-5 py-2.5 bg-neon-green text-black font-bold uppercase tracking-wider rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Resource'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="flex-1 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-white font-bold uppercase tracking-wider rounded-lg hover:border-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div variants={itemVariants} className="space-y-4">
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              {[{ value: 'all', label: 'All Resources' }, ...categoryOptions].map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-neon-green text-black'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-neon-green/30'
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
              onClick={() => setShowSubmitForm(true)}
              className="w-full px-6 py-4 bg-neon-green/10 border-2 border-neon-green/30 hover:border-neon-green/60 rounded-xl transition-all flex items-center justify-center gap-3 group"
            >
              <Plus className="w-5 h-5 text-neon-green" />
              <div className="text-left">
                <p className="text-sm font-bold text-neon-green uppercase tracking-wider">Share a Resource</p>
                <p className="text-xs text-zinc-400">Help the community by sharing useful learning materials</p>
              </div>
            </motion.button>
          )}

          {/* Resources Grid */}
          {loading ? (
            <motion.div variants={itemVariants} className="flex items-center justify-center py-12">
              <p className="text-zinc-500">Loading resources...</p>
            </motion.div>
          ) : filteredResources.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-zinc-950 border border-zinc-800 rounded-xl p-8"
            >
              <AlertCircle className="w-12 h-12 text-zinc-600" />
              <div>
                <p className="text-lg font-bold text-zinc-400 mb-1">No Resources Found</p>
                <p className="text-sm text-zinc-500">
                  {selectedCategory === 'all'
                    ? 'No learning resources available yet. Be the first to share one!'
                    : `No resources in the ${categoryOptions.find(c => c.value === selectedCategory)?.label} category yet.`}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
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
