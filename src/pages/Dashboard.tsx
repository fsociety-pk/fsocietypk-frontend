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
    className={`group bg-zinc-950 border border-zinc-800 rounded-xl p-5 hover:border-neon-green/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,65,0.08)]`}
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
    <div className="relative min-h-screen bg-black font-mono text-white overflow-hidden">

      {/* Ambient background glows — no icons, just pure light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-neon-green/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-neon-green/3 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-20">

          {/* ── HERO SECTION ── */}
          <motion.section
            variants={itemVariants}
            className="min-h-[85vh] flex flex-col items-center justify-center text-center space-y-14 pt-4"
          >
            {/* Headline block — centered */}
            <div className="flex flex-col items-center space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-neon-green/5 border border-neon-green/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-neon-green font-bold">System Online · Root Access Granted</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black uppercase tracking-tighter leading-[0.9] text-white flex flex-wrap items-center justify-center gap-3 md:gap-5">
                <span>ENCRYPT</span>
                <motion.span
                  animate={{ textShadow: ['0 0 20px rgba(0,255,65,0)', '0 0 50px rgba(0,255,65,0.7)', '0 0 20px rgba(0,255,65,0)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-neon-green"
                >
                  EXPLOIT
                </motion.span>
                <span>EVOLVE</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-4xl leading-loose font-mono">
                Master the art of offensive security through real-world attack simulations, structured challenge architecture, and advanced exploit development. Delve into the darkest layers of cyberspace, break through the digital illusions, and ascend to the next level of elite training. We are finally free. We are finally awake.
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/challenges"
                  className="group inline-flex items-center gap-3 px-10 py-4 bg-neon-green text-black font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:brightness-110 transition-all shadow-[0_0_30px_rgba(0,255,65,0.3)] hover:shadow-[0_0_60px_rgba(0,255,65,0.5)]"
                >
                  <Zap className="w-4 h-4" />
                  Deploy Operations
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Stats — 3 large cards full-width below headline */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Challenge Tracks', val: '7+', icon: Target, sub: 'Web · Crypto · Forensics · Rev · PWN · OSINT & more' },
                { label: 'Skill Level', val: 'ALL', icon: Rocket, sub: 'Beginner-friendly up to insane expert-level challenges' },
                { label: 'Platform', val: 'FREE', icon: Users, sub: 'Open community — submit, solve & grow together' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group bg-zinc-950 border border-zinc-800 hover:border-neon-green/50 p-8 rounded-2xl transition-all duration-300 cursor-default hover:shadow-[0_0_30px_rgba(0,255,65,0.1)] text-left flex flex-col justify-between min-h-[190px]"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-neon-green/10 rounded-xl group-hover:bg-neon-green/20 transition-colors">
                        <stat.icon className="w-5 h-5 text-neon-green" />
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
                    </div>
                    <p className="text-5xl font-black text-white tracking-tight">{stat.val}</p>
                  </div>
                  <div>
                    <div className="w-8 h-px bg-neon-green/30 mb-3 mt-5 group-hover:w-full transition-all duration-700" />
                    <p className="text-[10px] text-zinc-500 font-mono leading-relaxed">{stat.sub}</p>
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

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 md:p-8 border-l-2 border-l-neon-green/50">
              <h3 className="text-sm font-bold text-neon-green uppercase tracking-widest mb-3">
                The Best Platform to Learn CVE & Practice Offensive Security
              </h3>
              <p className="text-sm text-zinc-300 leading-loose mb-4">
                FsocietyPK is the ultimate learning platform for beginners and professionals alike. Whether you're starting your cybersecurity journey or are a seasoned researcher — our challenges help you master real-world vulnerability assessment and penetration testing skills.
              </p>
              <p className="text-sm text-zinc-400 leading-loose">
                Gain hands-on experience with CVEs, offensive tools, attack methodologies, and defensive techniques — each challenge carefully crafted to teach practical skills that matter in the field.
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
              <Link to="/challenges" className="group bg-gradient-to-br from-neon-green/10 via-neon-green/5 to-transparent border border-neon-green/30 rounded-xl p-7 hover:border-neon-green/60 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,65,0.12)]">
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

              <Link to="/submit-challenge" className="group bg-zinc-950 border border-zinc-800 rounded-xl p-7 hover:border-neon-green/40 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,255,65,0.07)]">
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
                { icon: Timer, n: '01', title: 'Warm Up — 20 min', desc: 'Start with one easy challenge to lock in momentum. Refresh core web or crypto fundamentals.' },
                { icon: Target, n: '02', title: 'Deep Work — 45 min', desc: 'Pick a medium or hard task. Document your payload chain and validate each assumption.' },
                { icon: Crosshair, n: '03', title: 'Debrief — 10 min', desc: 'Capture what worked, what failed, and where to revisit. Consistent debriefing accelerates growth.' },
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

              <a href="https://discord.gg/YYpFYBzH" target="_blank" rel="noopener noreferrer" className="group bg-zinc-950 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,65,0.08)]">
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
