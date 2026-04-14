import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, ExternalLink, Github, Terminal, Sparkles, Server } from 'lucide-react';
import { projectService, Project } from '../services/projectService';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(projectService.getProjects());
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-10 text-white md:px-8">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,255,65,0.1),transparent_34%),radial-gradient(circle_at_75%_5%,rgba(0,255,65,0.1),transparent_28%)]" />
      
      <div className="relative mx-auto max-w-6xl z-10">
        <div className="mb-12 border-l-4 border-neon-green pl-6">
          <h1 className="text-4xl font-black uppercase tracking-widest text-white md:text-5xl">
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
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm transition-all hover:border-neon-green/40 hover:bg-zinc-900/80 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)]"
            >
              {/* Card Decoration */}
              <div className="absolute right-4 top-4 text-zinc-800 transition-colors group-hover:text-neon-green/20">
                <Folder className="h-24 w-24" strokeWidth={1} />
              </div>
              
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
