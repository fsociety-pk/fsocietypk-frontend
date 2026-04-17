import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, ExternalLink, Github, Terminal, Sparkles, Server } from 'lucide-react';
import { projectService, Project } from '../services/projectService';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const dbProjects = await projectService.getProjects();
      setProjects(dbProjects);
    };
    loadProjects();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-6 sm:py-8 md:py-10 sm:px-6 md:px-8 text-white">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,255,65,0.1),transparent_34%),radial-gradient(circle_at_75%_5%,rgba(0,255,65,0.1),transparent_28%)]" />
      
      <div className="relative mx-auto max-w-6xl z-10">
        <div className="mb-8 sm:mb-10 md:mb-12 border-l-4 border-neon-green pl-4 sm:pl-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-widest text-white">
            OUR <span className="text-neon-green">PROJECTS</span>
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-zinc-400">
            Showcasing the arsenal of tools and infrastructure built by FSOCIETY. 
            From automated vulnerability scanners to AI-driven utilities, our tools are 
            designed to accelerate and elevate security operations.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.02, y: -5, boxShadow: "0 0 40px rgba(0,255,65,0.15)" }}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-black/60 p-6 sm:p-8 md:p-10 backdrop-blur-md transition-all hover:border-neon-green/60 hover:bg-zinc-900/90 overflow-hidden"
            >
              {/* Card Background Decoration */}
              <div className="absolute -right-10 -top-10 text-neon-green/5 transition-colors duration-500 group-hover:text-neon-green/20 group-hover:rotate-12 group-hover:scale-110">
                <Folder className="h-48 w-48" strokeWidth={0.5} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/0 via-transparent to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center rounded-sm bg-neon-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neon-green">
                  ACTIVE DEPLOYMENT
                </div>
                
                <h2 className="mb-3 font-display text-2xl font-bold tracking-wider text-white">
                  {project.title}
                </h2>
                
                <p className="mb-6 font-mono text-sm leading-relaxed text-zinc-400">
                  {project.description}
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs font-mono text-zinc-300 group-hover:border-neon-green/30 transition-colors"
                    >
                      <Terminal className="h-3 w-3 text-neon-green" />
                      {tech}
                    </span>
                  ))}
                </div>

                {project.features && project.features.length > 0 && (
                  <div className="mb-8 space-y-2">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Core Features</h3>
                    <ul className="space-y-1">
                      {project.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                           <Sparkles className="h-3 w-3 text-neon-green/70" />
                           {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative z-10 mt-auto flex items-center gap-4 pt-6 border-t border-zinc-800">
                {project.websiteUrl && (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-neon-green px-5 py-2 font-mono text-xs font-bold text-black transition-all hover:bg-transparent hover:text-neon-green border border-neon-green hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit App
                  </a>
                )}
                {project.sourceCodeUrl && (
                  <a
                    href={project.sourceCodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2 font-mono text-xs font-bold text-white transition-all hover:bg-zinc-700"
                  >
                    <Github className="h-4 w-4" />
                    Source Code
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           className="mt-12 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/20 p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-neon-green/5 to-black/0 pointer-events-none" />
          <div className="relative z-10">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-neon-green">
              <Server className="h-5 w-5 animate-pulse" />
            </div>
            <h3 className="mb-2 font-mono text-lg font-bold text-white tracking-widest text-shadow-sm">SYSTEM_EXPANSION_IN_PROGRESS</h3>
            <p className="font-mono text-sm text-zinc-400">
              After these 2 initial releases, more tools are coming soon. We are actively working on it. Stay tuned.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Projects;
