import PageHeading from "../../components/common/PageHeading";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Link as LinkIcon, Github } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { projectService, Project } from '../../services/projectService';

const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    features: '',
    websiteUrl: '',
    sourceCodeUrl: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const data = await projectService.getProjects();
    setProjects(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    const techStack = formData.techStack.split(',').map(s => s.trim()).filter(Boolean);
    const features = formData.features.split(',').map(s => s.trim()).filter(Boolean);

    try {
      await projectService.addProject({
        title: formData.title,
        description: formData.description,
        techStack,
        features,
        websiteUrl: formData.websiteUrl,
        sourceCodeUrl: formData.sourceCodeUrl
      });
      toast.success('Project added successfully');
      setFormData({ title: '', description: '', techStack: '', features: '', websiteUrl: '', sourceCodeUrl: '' });
      setIsAdding(false);
      loadProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add project');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      toast.success('Project deleted');
      loadProjects();
    } catch (error: any) {
       toast.error(error.response?.data?.message || error.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <PageHeading eyebrow="Admin workspace" title="Manage projects" description="Add tools and projects for the community." />
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded bg-brand px-4 py-2 font-sans text-xs font-semibold text-on-brand hover:bg-brand/80 transition-all border border-brand"
        >
          {isAdding ? 'Cancel' : <><Plus size={14} /> New project</>}
        </button>
      </div>

      {isAdding && (
        <motion.div
           initial={false}
           animate={{ opacity: 1, y: 0 }}
           className="rounded-lg border border-surface-border bg-background-elevated/50 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase text-text-secondary">Title <span className="text-brand">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-text-primary placeholder-zinc-600 focus:border-brand focus:outline-none"
                  placeholder="e.g., TargetMapper"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase text-text-secondary">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                  className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-text-primary placeholder-zinc-600 focus:border-brand focus:outline-none"
                  placeholder="e.g., React, Node, Python"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-sans uppercase text-text-secondary">Description <span className="text-brand">*</span></label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-text-primary placeholder-zinc-600 focus:border-brand focus:outline-none h-24"
                placeholder="Brief description of the project..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-sans uppercase text-text-secondary">Features (comma separated)</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-text-primary placeholder-zinc-600 focus:border-brand focus:outline-none"
                placeholder="e.g., Auto-scan, Dashboard, API"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase text-text-secondary">Website URL</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                  className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-text-primary placeholder-zinc-600 focus:border-brand focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase text-text-secondary">Source Code URL</label>
                <input
                  type="url"
                  value={formData.sourceCodeUrl}
                  onChange={(e) => setFormData({...formData, sourceCodeUrl: e.target.value})}
                  className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-text-primary placeholder-zinc-600 focus:border-brand focus:outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="rounded bg-brand px-6 py-2 font-sans text-xs font-bold text-on-brand hover:opacity-80 transition-all font-bold"
              >
                Save project
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {projects.map((project) => (
          <div key={project._id} className="relative rounded-lg border border-surface-border bg-background-elevated/50 p-5 group flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-text-primary text-lg tracking-wider font-sans uppercase">{project.title}</h3>
                  {(project._id === '1' || project._id === '2') ? (
                    <span className="text-xs font-sans text-text-muted bg-background border border-surface-border px-2 py-0.5 rounded">Featured project</span>
                  ) : (
                    <button onClick={() => handleDelete(project._id!)} className="text-text-muted hover:text-status-error transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                   {project.techStack?.map((tech: string) => (
                     <span key={tech} className="text-xs font-sans bg-background border border-surface-border text-brand px-2 py-1 rounded">{tech}</span>
                   ))}
                </div>
             </div>

             <div className="flex items-center gap-4 border-t border-surface-border pt-4 mt-auto">
                {project.websiteUrl && (
                  <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-text-primary bg-surface border border-surface-border px-3 py-1.5 rounded flex items-center gap-1 hover:bg-surface-hover transition">
                    <LinkIcon size={12} /> Live Site
                  </a>
                )}
                {project.sourceCodeUrl && (
                  <a href={project.sourceCodeUrl} target="_blank" rel="noreferrer" className="text-xs text-text-primary bg-surface border border-surface-border px-3 py-1.5 rounded flex items-center gap-1 hover:bg-surface-hover transition">
                    <Github size={12} /> Source
                  </a>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProjects;
