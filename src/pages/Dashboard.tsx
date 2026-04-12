import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  BookCheck,
  Film,
  Flag,
  Lock,
  Shield,
  Target,
  TrendingUp,
  Users2,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const quickStats = [
  { label: 'Challenge Domains', value: '07+', icon: Shield },
  { label: 'Practice Attempts', value: 'Unlimited', icon: Activity },
  { label: 'Community Tracks', value: 'Growing', icon: Users2 },
  { label: 'Skill Momentum', value: '+24%', icon: TrendingUp },
];

const learningPath = [
  {
    title: 'Warm-Up',
    subtitle: '20 minutes',
    detail: 'Start with one easy challenge to lock in focus and confidence.',
    icon: Target,
  },
  {
    title: 'Core Session',
    subtitle: '45 minutes',
    detail: 'Work one medium challenge end-to-end and document your chain.',
    icon: Zap,
  },
  {
    title: 'Review',
    subtitle: '10 minutes',
    detail: 'Capture payload notes, mistakes, and repeatable patterns.',
    icon: BookCheck,
  },
];

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-8 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(0,255,65,0.2),transparent_38%),radial-gradient(circle_at_86%_10%,rgba(56,189,248,0.15),transparent_32%),radial-gradient(circle_at_60%_90%,rgba(0,255,65,0.1),transparent_40%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="hidden h-fit rounded-2xl border border-neon-green/25 bg-zinc-950/80 p-5 backdrop-blur-xl lg:sticky lg:top-24 lg:block"
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-neon-green/80">Control Panel</p>
          <h2 className="mt-2 text-xl font-bold tracking-wide text-white">Welcome, {user?.username || 'Operator'}</h2>
          <p className="mt-2 text-sm text-zinc-400">Clean, focused, and made for screenshots.</p>

          <div className="mt-6 space-y-3">
            <Link to="/challenges" className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200 transition-all hover:border-neon-green/50 hover:text-neon-green">
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Challenges</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/leaderboard" className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200 transition-all hover:border-neon-green/50 hover:text-neon-green">
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Leaderboard</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/submit-challenge" className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200 transition-all hover:border-neon-green/50 hover:text-neon-green">
              <span className="flex items-center gap-2"><Flag className="h-4 w-4" /> Submit Challenge</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/cyber-cinema" className="flex items-center justify-between rounded-xl border border-neon-green/40 bg-gradient-to-r from-neon-green/15 to-cyan-500/10 px-4 py-3 text-sm text-neon-green transition-all hover:shadow-[0_0_24px_rgba(0,255,65,0.25)]">
              <span className="flex items-center gap-2"><Film className="h-4 w-4" /> Cyber Cinema</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Quick Standard</p>
            <p className="mt-2 text-sm text-zinc-300">Flags must follow <span className="rounded bg-black/60 px-2 py-1 font-semibold text-neon-green">fsociety&#123;...&#125;</span></p>
            <p className="mt-2 text-xs text-zinc-500">Every new submission is reviewed before publishing.</p>
          </div>
        </motion.aside>

        <main className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-neon-green/30 bg-zinc-950/80 p-7 md:p-10"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon-green/15 blur-3xl" />
            <div className="absolute -bottom-24 right-24 h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.28em] text-neon-green/80">FsocietyPK Dashboard</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">
                Practical cybersecurity training, presented with a premium command-center look.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                Everything is now styled for a clean and professional screenshot: strong hierarchy,
                balanced spacing, and a dedicated cinematic section for upcoming content.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/challenges" className="rounded-lg border border-neon-green/40 bg-neon-green/15 px-5 py-2.5 text-sm font-semibold text-neon-green transition hover:bg-neon-green/25">
                  Start Challenges
                </Link>
                <Link to="/cyber-cinema" className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20">
                  Open Cyber Cinema
                </Link>
              </div>
            </div>
          </motion.section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.35 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950/75 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                  <item.icon className="h-4 w-4 text-neon-green" />
                </div>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
              </motion.div>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/75 p-6">
              <h3 className="text-lg font-bold text-neon-green">Session Blueprint</h3>
              <p className="mt-1 text-sm text-zinc-400">A simple structure you can follow every day.</p>

              <div className="mt-5 space-y-4">
                {learningPath.map((step, index) => (
                  <motion.article
                    key={step.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="rounded-xl border border-zinc-800 bg-black/35 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-2 font-semibold text-white">
                        <step.icon className="h-4 w-4 text-neon-green" />
                        {step.title}
                      </p>
                      <span className="text-xs uppercase tracking-wider text-zinc-500">{step.subtitle}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{step.detail}</p>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/75 p-6">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-bold text-cyan-200">Cyber Cinema</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Curated hacker-culture visuals and stories are being produced.
              </p>

              <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Status</p>
                <p className="mt-2 text-xl font-bold text-white">Coming Soon</p>
                <p className="mt-1 text-sm text-zinc-400">Click below for the cinematic teaser page.</p>
              </div>

              <Link
                to="/cyber-cinema"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Visit Preview
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              <div className="mt-6 border-t border-zinc-800 pt-4">
                <p className="flex items-center gap-2 text-sm text-zinc-400">
                  <Lock className="h-4 w-4 text-neon-green" />
                  Professional presentation mode is active.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
