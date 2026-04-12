import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Sparkles, Clapperboard } from 'lucide-react';

const CyberCinema: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-10 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_75%_5%,rgba(0,255,65,0.2),transparent_28%),radial-gradient(circle_at_60%_88%,rgba(14,165,233,0.2),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      <div className="relative mx-auto max-w-6xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-300 transition hover:border-neon-green/40 hover:text-neon-green"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-zinc-950/95 via-zinc-900/85 to-black p-8 shadow-[0_0_80px_rgba(34,211,238,0.15)] md:p-12"
        >
          <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-neon-green/15 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-cyan-300">Cyber Cinema</p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
                Cinematic Security Stories Are On The Way
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                We are building a premium visual experience with hacker films, scene analysis,
                and short educational breakdowns. This section is actively in production.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-200" />
                  </span>
                  Coming Soon
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/40 bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green">
                  <Sparkles className="h-4 w-4" />
                  Work in Progress
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-6 backdrop-blur-xl">
              <div className="mb-4 inline-flex rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-cyan-300">
                <Film className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-white">Teaser Board</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Planned categories for launch:
              </p>

              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/35 px-3 py-2">
                  <Clapperboard className="h-4 w-4 text-neon-green" /> Hacker Movie Collection
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/35 px-3 py-2">
                  <Clapperboard className="h-4 w-4 text-neon-green" /> Real vs Fiction Breakdowns
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/35 px-3 py-2">
                  <Clapperboard className="h-4 w-4 text-neon-green" /> Security Lessons from Scenes
                </li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default CyberCinema;
