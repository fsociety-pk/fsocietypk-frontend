import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Book,
  ArrowRight,
  Code,
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
  Terminal,
  Lock,
  Crosshair,
} from 'lucide-react';
const Dashboard: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
      },
    },
  };

  const spotlightVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.9,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-black font-mono text-white py-12 px-4 md:px-8 overflow-hidden">
      {/* Dynamic Background Noise/Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,255,65,0.2)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,255,65,0.2)_1.5px,transparent_1.5px)] bg-[size:30px_30px] z-0" />
      
      <motion.div
        variants={spotlightVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-neon-green/10 blur-[120px] z-0"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mt-8 mb-16 rounded-2xl border border-zinc-800 overflow-hidden bg-black/40 p-8 md:p-12 lg:px-16 lg:py-20 backdrop-blur-md group"
        >
          {/* Animated decorative borders */}
          <div className="absolute top-0 left-0 w-20 h-[1px] bg-neon-green shadow-neon" />
          <div className="absolute top-0 left-0 w-[1px] h-20 bg-neon-green shadow-neon" />
          <div className="absolute bottom-0 right-0 w-20 h-[1px] bg-neon-green shadow-neon" />
          <div className="absolute bottom-0 right-0 w-[1px] h-20 bg-neon-green shadow-neon" />

          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.05),transparent_70%)]" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full border border-neon-green/20 bg-neon-green/5"
            >
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-neon-green font-bold">
                SYSTEM_ACCESS: GRANTED
              </p>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter leading-none">
              <span className="text-white">ENCRYPT. </span>
              <span className="text-neon-green text-glow-strong">EXPLOIT. </span>
              <span className="text-white">EVOLVE.</span>
            </h1>

            <p className="text-zinc-400 max-w-2xl leading-relaxed text-sm md:text-base font-medium">
              Forge your path in the shadows. MASTER THE ART OF OFFENSIVE SECURITY through 
              complex attack simulations and decentralized challenge architecture. 
              The next level of elite training starts here.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {[
                { label: 'OP_CAPACITY', val: '7+ TRACKS', icon: Target },
                { label: 'RETRY_POLICY', val: 'UNLIMITED', icon: Repeat },
                { label: 'LEARNING_DIR', val: 'HANDS-ON', icon: Terminal },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, borderColor: 'rgba(0,255,65,0.4)' }}
                  className="min-w-[160px] rounded-xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 flex flex-col items-center transition-all group/stat"
                >
                  <stat.icon className="w-5 h-5 text-neon-green/60 mb-3 group-hover/stat:text-neon-green transition-colors" />
                  <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-zinc-100">{stat.val}</p>
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-12">
              <Link
                to="/challenges"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-neon-green text-black font-black uppercase tracking-widest text-sm rounded-lg hover:shadow-neon transition-all hover:scale-105 active:scale-95"
              >
                Enter Command Center
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
                whileHover={{ y: -4 }}
                className="rounded-xl border border-neon-green/30 bg-neon-green/5 px-4 py-3"
              >
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.24em]">Learning Style</p>
                <p className="mt-1 text-lg font-bold text-neon-green">Hands-On First</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16"
        >
          {/* About Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Book className="text-neon-green w-6 h-6" />
              <h3 className="text-2xl font-bold tracking-widest uppercase">About FsocietyPK</h3>
            </div>

            <div className="bg-gradient-to-r from-neon-green/10 to-transparent border border-neon-green/30 rounded-xl p-6 md:p-8 mb-6">
              <h4 className="text-lg font-bold text-neon-green mb-3">The Best Platform for Beginners to Learn CVE & Practice</h4>
              <p className="text-zinc-300 leading-relaxed mb-4">
                FsocietyPK is designed as the ultimate learning platform for beginners and professionals alike. Whether you're just starting your cybersecurity journey or are a seasoned security researcher, our challenges help you master real-world Vulnerability Assessment & Penetration Testing skills.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Our platform provides hands-on experience with Common Vulnerabilities and Exposures (CVE), security tools, attack methodologies, and defensive techniques. Each challenge is carefully crafted to teach practical skills that matter in the field.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-zinc-900/60 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neon-green/10 rounded-lg mt-1">
                    <Rocket className="w-6 h-6 text-neon-green" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2 text-neon-green">For Beginners</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Start with easy challenges to build confidence. Learn fundamental concepts in web security, cryptography, and system administration. Get comprehensive writeups and hints to guide your learning journey.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Professional Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-zinc-900/60 border border-neon-green/20 rounded-xl p-6 hover:border-neon-green/50 transition-all hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neon-green/10 rounded-lg mt-1">
                    <Shield className="w-6 h-6 text-neon-green" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2 text-neon-green">For Professionals</h4>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Challenge yourself with insane-level CTF problems. Enhance your expertise with real-world attack scenarios, advanced exploitation techniques, and defensive strategies used by industry professionals.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Feature 1 */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-lg hover:border-neon-green/30 transition-all"
              >
                <Repeat className="w-5 h-5 text-neon-green flex-shrink-0" />
                <span className="text-sm">
                  <span className="font-bold text-neon-green">Unlimited Practice:</span> Retry challenges unlimited times
                </span>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-lg hover:border-neon-green/30 transition-all"
              >
                <Award className="w-5 h-5 text-neon-green flex-shrink-0" />
                <span className="text-sm">
                  <span className="font-bold text-neon-green">Gamified Learning:</span> Earn points and climb the leaderboard
                </span>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-lg hover:border-neon-green/30 transition-all"
              >
                <Users className="w-5 h-5 text-neon-green flex-shrink-0" />
                <span className="text-sm">
                  <span className="font-bold text-neon-green">Community Challenges:</span> Learn from real submissions
                </span>
              </motion.div>
            </div>
          </motion.section>

          {/* Social Media & Contact Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle className="text-neon-green w-6 h-6" />
              <h3 className="text-2xl font-bold tracking-widest uppercase">Connect With Us</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email */}
              <a
                href="mailto:pkfsociety@gmail.com"
                className="group bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-600/40 rounded-xl p-6 hover:border-blue-600/80 transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.2)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-blue-400 mb-1">Email</h5>
                    <p className="text-sm text-zinc-400 break-all">pkfsociety@gmail.com</p>
                    <p className="text-[10px] text-zinc-500 mt-2">Questions? Reach out to us anytime</p>
                  </div>
                </div>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/YYpFYBzH"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-zinc-900/70 to-zinc-900/20 border border-neon-green/30 rounded-xl p-6 hover:border-neon-green/70 transition-all hover:shadow-[0_0_25px_rgba(0,255,65,0.2)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-neon-green/20 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-neon-green" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-neon-green mb-1">Discord Community</h5>
                    <p className="text-sm text-zinc-400">Join our Discord server</p>
                    <p className="text-[10px] text-zinc-500 mt-2">Chat, share writeups & connect</p>
                  </div>
                </div>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/orgs/fsociety-pk"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-600/40 rounded-xl p-6 hover:border-orange-600/80 transition-all hover:shadow-[0_0_25px_rgba(234,88,12,0.2)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Github className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-orange-400 mb-1">GitHub Organization</h5>
                    <p className="text-sm text-zinc-400">View our source & projects</p>
                    <p className="text-[10px] text-zinc-500 mt-2">Contribute to the community</p>
                  </div>
                </div>
              </a>
            </div>
          </motion.section>

          {/* Call to Action Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Explore Challenges */}
              <Link
                to="/challenges"
                className="group relative bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/40 rounded-xl p-8 hover:border-neon-green/80 transition-all hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]"
              >
                <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Code className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="w-6 h-6 text-neon-green" />
                    <h4 className="text-xl font-bold text-neon-green">Explore Challenges</h4>
                  </div>
                  <p className="text-zinc-400 mb-4 text-sm">
                    Browse through our collection of challenges across different categories and difficulty levels.
                  </p>
                  <div className="flex items-center text-neon-green font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Start Solving <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>

              {/* Contribute Challenge */}
              <Link
                to="/submit-challenge"
                className="group relative bg-gradient-to-br from-zinc-900/90 to-black border border-neon-green/40 rounded-xl p-8 hover:border-neon-green/80 transition-all hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]"
              >
                <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <Plus className="w-6 h-6 text-neon-green" />
                    <h4 className="text-xl font-bold text-neon-green">Contribute a Challenge</h4>
                  </div>
                  <p className="text-zinc-400 mb-4 text-sm">
                    Share your own challenges! Submit challenges for review and help others learn.
                  </p>
                  <div className="flex items-center text-neon-green font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Create Challenge <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </div>
          </motion.section>

          {/* Learning Flow Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-neon-green w-6 h-6" />
              <h3 className="text-2xl font-bold tracking-widest uppercase">What To Do Next</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <motion.article
                whileHover={{ y: -4 }}
                className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5"
              >
                <Timer className="w-5 h-5 text-neon-green mb-3" />
                <h4 className="font-bold text-neon-green mb-2">Warm Up (15-20 min)</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Start with one easy challenge to lock in momentum and refresh core web or crypto fundamentals.
                </p>
              </motion.article>

              <motion.article
                whileHover={{ y: -4 }}
                className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5"
              >
                <Terminal className="w-5 h-5 text-neon-green mb-3" />
                <h4 className="font-bold text-neon-green mb-2">Deep Work (45 min)</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Pick a medium or hard task, document your payload chain, and validate each assumption like a real engagement.
                </p>
              </motion.article>

              <motion.article
                whileHover={{ y: -4 }}
                className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5"
              >
                <Crosshair className="w-5 h-5 text-neon-green mb-3" />
                <h4 className="font-bold text-neon-green mb-2">Debrief (10 min)</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Capture what worked, what failed, and where to revisit. Consistent debriefing accelerates long-term growth.
                </p>
              </motion.article>
            </div>
          </motion.section>

          {/* Guidelines Section */}
          <motion.section variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold tracking-widest uppercase mb-6">
              Challenge Submission Guidelines
            </h3>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-bold text-neon-green mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neon-green" />
                    Flag Format
                  </h5>
                  <p className="text-sm text-zinc-400">
                    Flags must follow the format: <code className="bg-black/50 px-2 py-1 rounded text-neon-green">fsociety{'{}'}</code>
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-neon-green mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon-green" />
                    Review Process
                  </h5>
                  <p className="text-sm text-zinc-400">
                    All submitted challenges go through admin review before being published to ensure quality and security.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-bold text-neon-green mb-2 flex items-center gap-2">
                    <Book className="w-4 h-4 text-neon-green" />
                    Categories
                  </h5>
                  <p className="text-sm text-zinc-400">
                    Web, Crypto, Forensics, Reverse Engineering, PWN, OSINT, and more!
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-neon-green mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-neon-green" />
                    Difficulty Levels
                  </h5>
                  <p className="text-sm text-zinc-400">
                    Easy, Medium, Hard, and Insane challenges available
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Stats Section */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/60 border border-neon-green/20 rounded-xl p-6 text-center">
              <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2">Learning Platform</p>
              <h4 className="text-3xl font-black text-neon-green">100%</h4>
              <p className="text-zinc-400 text-sm mt-2">Focused on Educational Growth</p>
            </div>

            <div className="bg-zinc-900/60 border border-neon-green/20 rounded-xl p-6 text-center">
              <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2">Community Driven</p>
              <h4 className="text-3xl font-black text-neon-green">UNLIMITED</h4>
              <p className="text-zinc-400 text-sm mt-2">Unlimited Challenge Attempts</p>
            </div>

            <div className="bg-zinc-900/60 border border-neon-green/20 rounded-xl p-6 text-center">
              <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2">Your Voice</p>
              <h4 className="text-3xl font-black text-neon-green">SUBMIT</h4>
              <p className="text-zinc-400 text-sm mt-2">Submit & Share Your Challenges</p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
