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
      <motion.div
        variants={spotlightVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 h-96 w-96 rounded-full bg-neon-green/20 blur-[100px]"
      />
      <div className="max-w-6xl mx-auto">
        {/* Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mt-8 mb-16 rounded-3xl border border-neon-green/40 overflow-hidden bg-gradient-to-br from-zinc-900/90 via-black to-neon-green/10 p-8 md:p-14 lg:p-20 shadow-[0_0_50px_rgba(0,255,65,0.15)] backdrop-blur-sm"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,65,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,255,65,0.08),transparent_35%)]" />

          <div className="relative z-10">
            <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-neon-green/80 mb-4">
              CTF Command Center
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black italic text-glow mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(0,255,65,0.8)] break-words leading-tight">
              TRAIN. BREAK. DEFEND.
            </h1>
            <p className="text-zinc-300 max-w-3xl leading-relaxed">
              Build practical security skills through real attack paths, guided challenge flows, and a competitive learning environment. Every solve sharpens your thinking for real-world assessments.
            </p>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-xl border border-neon-green/30 bg-neon-green/5 px-4 py-3"
              >
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.24em]">Challenge Tracks</p>
                <p className="mt-1 text-lg font-bold text-neon-green">7+ Domains</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-xl border border-neon-green/30 bg-neon-green/5 px-4 py-3"
              >
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.24em]">Practice Model</p>
                <p className="mt-1 text-lg font-bold text-neon-green">Unlimited Retries</p>
              </motion.div>
              <motion.div
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
                    Flags must follow the format: <code className="bg-black/50 px-2 py-1 rounded text-neon-green">fsociety{'{'}'...{'}'}</code>
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
