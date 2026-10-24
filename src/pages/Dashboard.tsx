import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Book,
  ArrowRight,

  Repeat,
  Award,
  Users,
  Plus,
  Mail,
  Github,
  MessageCircle,
  Rocket,
  Shield,
  Target,
  Timer,
  Lock,
  Crosshair,
  Zap,
} from 'lucide-react';
import { Resources } from './Resources';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Reusable feature card
const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -4 }}
    className="group rounded-lg border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-neon-green/40"
  >
    <div className="p-2.5 bg-neon-green/10 rounded-lg w-fit mb-4 group-hover:bg-neon-green/20 transition-colors">
      <Icon className="w-5 h-5 text-neon-green" />
    </div>
    <h4 className="font-bold text-sm text-neon-green mb-2 uppercase tracking-wide">{title}</h4>
    <p className="text-xs text-zinc-400 leading-relaxed font-mono">{desc}</p>
  </motion.div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="relative min-w-0 bg-background text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">

          {/* ── HERO SECTION ── */}
          <motion.section
            variants={itemVariants}
            className="flex flex-col items-start gap-10 border-b border-surface-border py-8 text-left"
          >
            <div className="flex w-full flex-col items-start gap-5">
              <div className="inline-flex items-center gap-2 border-l-2 border-neon-green pl-3">
                <span className="text-xs font-semibold tracking-wide text-zinc-300">Hands-on security training</span>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Practice real security skills.
                <span className="block text-neon-green">Learn by solving.</span>
              </h1>

              <p className="max-w-2xl text-base leading-7 text-zinc-300">
                Build practical offensive security skills with hands-on challenges, community writeups, and tools you can explore at your own pace.
              </p>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/challenges"
                  className="group inline-flex min-h-12 items-center gap-3 rounded-md bg-neon-green px-6 py-3 text-sm font-semibold text-background transition-colors hover:brightness-105"
                >
                  Explore missions
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>

            <div className="grid w-full grid-cols-1 border-y border-surface-border sm:grid-cols-3 sm:divide-x sm:divide-surface-border">
              {[
                { label: 'Challenge Tracks', val: '7+', icon: Target, sub: 'Web, crypto, forensics, reverse engineering, PWN, OSINT, and more' },
                { label: 'Skill Level', val: 'ALL', icon: Rocket, sub: 'Beginner-friendly up to insane expert-level challenges' },
                { label: 'Platform', val: 'FREE', icon: Users, sub: 'An open community to submit challenges, solve, and learn together' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex min-w-0 items-start gap-4 border-b border-surface-border px-1 py-5 last:border-b-0 sm:border-b-0 sm:px-5 first:sm:pl-1 last:sm:pr-1"
                >
                  <stat.icon aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-neon-green" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-400">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{stat.val}</p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>



          {/* ── ABOUT SECTION ── */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-3">
              <Book className="text-neon-green w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">About FsocietyPK</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-green/20 to-transparent" />
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 md:p-8">
              <h3 className="text-sm font-bold text-neon-green uppercase tracking-widest mb-3">
                The Best Platform to Learn CVE & Practice Offensive Security
              </h3>
              <p className="text-sm text-zinc-300 leading-loose mb-4">
                FsocietyPK is a learning platform for people building practical cybersecurity skills. Work through challenges in vulnerability assessment, penetration testing, and related fields.
              </p>
              <p className="text-sm text-zinc-400 leading-loose">
                Gain hands-on experience with CVEs, security tools, attack methods, and defensive techniques through challenges built around practical skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard icon={Rocket} title="For Beginners" desc="Start with easy challenges to build confidence. Learn web security, cryptography, and system fundamentals with comprehensive hints." />
              <FeatureCard icon={Shield} title="For Professionals" desc="Challenge yourself with insane CTF problems, multi-stage killchains, reverse engineering binaries, and real-world CVE reproductions." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: Repeat, title: 'Unlimited Retries', desc: 'Retry challenges as many times as you need.' },
                { icon: Award, title: 'Gamified Learning', desc: 'Earn points and climb the global leaderboard.' },
                { icon: Users, title: 'Community Driven', desc: 'Learn from real user-submitted challenges.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={itemVariants} className="flex items-start gap-3 p-4 bg-zinc-950 border border-zinc-800/60 rounded-xl hover:border-neon-green/20 transition-colors">
                  <Icon className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-300">
                    <span className="font-bold text-neon-green">{title}:</span> {desc}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── CTA CARDS ── */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-3">
              <Zap className="text-neon-green w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">Quick Access</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-green/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Link to="/challenges" className="group rounded-lg border border-neon-green/30 bg-neon-green/5 p-7 transition-colors hover:border-neon-green/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-neon-green/15 rounded-lg group-hover:bg-neon-green/25 transition-colors">
                    <Zap className="w-5 h-5 text-neon-green" />
                  </div>
                  <h4 className="text-base font-black text-neon-green uppercase tracking-wide">Explore Challenges</h4>
                </div>
                <p className="text-xs text-zinc-400 mb-5 leading-relaxed font-mono">Browse our collection across different categories and difficulty levels. Master vulnerability discovery and exploitation.</p>
                <div className="flex items-center text-neon-green text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Start Solving <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </div>
              </Link>

              <Link to="/submit-challenge" className="group rounded-lg border border-zinc-800 bg-zinc-950 p-7 transition-colors hover:border-neon-green/40">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-zinc-800 rounded-lg group-hover:bg-neon-green/10 transition-colors">
                    <Plus className="w-5 h-5 text-zinc-400 group-hover:text-neon-green transition-colors" />
                  </div>
                  <h4 className="text-base font-black text-zinc-300 group-hover:text-neon-green uppercase tracking-wide transition-colors">Contribute a Challenge</h4>
                </div>
                <p className="text-xs text-zinc-500 mb-5 leading-relaxed font-mono">Share your own challenges! Submit for admin review and help the community grow.</p>
                <div className="flex items-center text-zinc-400 group-hover:text-neon-green text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-all">
                  Create Challenge <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </div>
              </Link>
            </div>
          </motion.section>

          {/* ── LEARNING FLOW ── */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-3">
              <Target className="text-neon-green w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">Recommended Flow</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-green/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Timer, n: '01', title: 'Warm up, 20 min', desc: 'Start with one easy challenge. Refresh core web or crypto fundamentals.' },
                { icon: Target, n: '02', title: 'Deep work, 45 min', desc: 'Pick a medium or hard task. Document your approach and validate each assumption.' },
                { icon: Crosshair, n: '03', title: 'Debrief, 10 min', desc: 'Capture what worked, what failed, and what to revisit.' },
              ].map(({ icon: Icon, n, title, desc }) => (
                <motion.div key={n} variants={itemVariants} whileHover={{ y: -4 }} className="group bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-neon-green/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black text-zinc-600 tracking-widest">{n}</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                    <Icon className="w-4 h-4 text-neon-green" />
                  </div>
                  <h4 className="font-bold text-neon-green text-xs uppercase tracking-wider mb-2">{title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── GUIDELINES ── */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-3">
              <Book className="text-neon-green w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">Submission Guidelines</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-green/20 to-transparent" />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Lock, title: 'Flag Format', desc: <>Flags must follow: <code className="text-neon-green bg-black/60 px-1.5 py-0.5 rounded text-[10px]">fsociety{'{flag}'}</code></> },
                { icon: Shield, title: 'Review Process', desc: 'All submissions go through admin review before publishing to ensure quality and security.' },
                { icon: Book, title: 'Categories', desc: 'Web, Crypto, Forensics, Reverse Engineering, PWN, OSINT, and more.' },
                { icon: Award, title: 'Difficulty Levels', desc: 'Easy, Medium, Hard, and Insane challenges available for all skill levels.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="p-2 bg-neon-green/10 rounded-lg flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-neon-green" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-neon-green uppercase tracking-wider mb-1">{title}</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* ── LEARNING RESOURCES ── */}
          <Resources showDashboardSection={true} />

          {/* ── CONNECT ── */}
          <motion.section variants={itemVariants} className="space-y-8 pb-12">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-neon-green w-5 h-5" />
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">Connect With Us</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-green/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="mailto:pkfsociety@gmail.com" className="group bg-zinc-950 border border-blue-600/20 rounded-xl p-6 hover:border-blue-600/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-400 text-xs uppercase tracking-wider mb-1">Email</h5>
                    <p className="text-xs text-zinc-400 font-mono break-all">pkfsociety@gmail.com</p>
                    <p className="text-[10px] text-zinc-600 mt-1.5">Reach out any time</p>
                  </div>
                </div>
              </a>

              <a href="https://discord.gg/YYpFYBzH" target="_blank" rel="noopener noreferrer" className="group rounded-lg border border-neon-green/20 bg-zinc-950 p-6 transition-colors hover:border-neon-green/50">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-neon-green/10 rounded-lg group-hover:bg-neon-green/20 transition-colors">
                    <MessageCircle className="w-5 h-5 text-neon-green" />
                  </div>
                  <div>
                    <h5 className="font-bold text-neon-green text-xs uppercase tracking-wider mb-1">Discord</h5>
                    <p className="text-xs text-zinc-400 font-mono">Join our community</p>
                    <p className="text-[10px] text-zinc-600 mt-1.5">Chat, share writeups & connect</p>
                  </div>
                </div>
              </a>

              <a href="https://github.com/orgs/fsociety-pk" target="_blank" rel="noopener noreferrer" className="group bg-zinc-950 border border-orange-600/20 rounded-xl p-6 hover:border-orange-600/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,88,12,0.1)]">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <Github className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-orange-400 text-xs uppercase tracking-wider mb-1">GitHub</h5>
                    <p className="text-xs text-zinc-400 font-mono">@fsociety-pk</p>
                    <p className="text-[10px] text-zinc-600 mt-1.5">View source & contribute</p>
                  </div>
                </div>
              </a>
            </div>
          </motion.section>

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
