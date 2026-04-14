import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Plus, Trash2, Link as LinkIcon, Github } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { projectService, Project } from '../../../services/projectService';

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

  const loadProjects = () => {
    setProjects(projectService.getProjects());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    const techStack = formData.techStack.split(',').map(s => s.trim()).filter(Boolean);
    const features = formData.features.split(',').map(s => s.trim()).filter(Boolean);

    projectService.addProject({
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
  };

  const handleDelete = (id: string) => {
    projectService.deleteProject(id);
    toast.success('Project deleted');
    loadProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-white">Manage Projects</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">Configure and display tools in the Projects section.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded bg-neon-green px-4 py-2 font-mono text-xs font-black text-black hover:bg-neon-green/80 transition-all border border-neon-green"
        >
          {isAdding ? 'CANCEL' : <><Plus size={14} /> NEW PROJECT</>}
        </button>
      </div>

      {isAdding && (
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400">Title <span className="text-neon-green">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-neon-green focus:outline-none"
                  placeholder="e.g., TargetMapper"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({...formData, techStack: e.target.value})}
                  className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-neon-green focus:outline-none"
                  placeholder="e.g., React, Node, Python"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400">Description <span className="text-neon-green">*</span></label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-neon-green focus:outline-none h-24"
                placeholder="Brief description of the project..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-zinc-400">Features (comma separated)</label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) => setFormData({...formData, features: e.target.value})}
                className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-neon-green focus:outline-none"
                placeholder="e.g., Auto-scan, Dashboard, API"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400">Website URL</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                  className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-neon-green focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400">Source Code URL</label>
                <input
                  type="url"
                  value={formData.sourceCodeUrl}
                  onChange={(e) => setFormData({...formData, sourceCodeUrl: e.target.value})}
                  className="w-full rounded-md border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-neon-green focus:outline-none"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="rounded bg-neon-green px-6 py-2 font-mono text-xs font-bold text-black hover:opacity-80 transition-all font-bold"
              >
                SAVE PROJECT
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {projects.map((project) => (
          <div key={project.id} className="relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 group flex flex-col justify-between">
             <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg tracking-wider font-display uppercase">{project.title}</h3>
                  {(project.id === '1' || project.id === '2') ? (
                    <span className="text-[10px] font-mono text-zinc-500 bg-black border border-zinc-800 px-2 py-0.5 rounded">SYSTEM_DEFAULT</span>
                  ) : (
                    <button onClick={() => handleDelete(project.id)} className="text-zinc-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                   {project.techStack?.map(tech => (
                     <span key={tech} className="text-[10px] font-mono bg-black border border-zinc-800 text-neon-green px-2 py-1 rounded">{tech}</span>
                   ))}
                </div>
             </div>
             
             <div className="flex items-center gap-4 border-t border-zinc-800 pt-4 mt-auto">
                {project.websiteUrl && (
                  <a href={project.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-white bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-zinc-700 transition">
                    <LinkIcon size={12} /> Live Site
                  </a>
                )}
                {project.sourceCodeUrl && (
                  <a href={project.sourceCodeUrl} target="_blank" rel="noreferrer" className="text-xs text-white bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-zinc-700 transition">
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
