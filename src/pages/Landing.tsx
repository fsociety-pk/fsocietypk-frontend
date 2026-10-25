import { useEffect, useRef, type CSSProperties } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Cpu,
  FileSearch,
  Fingerprint,
  Globe2,
  Search,
  Code2,
  Shield,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

const features = [
  {
    number: '01',
    title: 'Practice with CTFs',
    text: 'Solve security challenges at your own pace. Start with beginner tasks and advance to real-world exploits.',
    to: '/challenges',
    accent: 'rgb(var(--success))',
    tag: 'Hands-on Labs',
  },
  {
    number: '02',
    title: 'Learn from writeups',
    text: 'Read detailed walk-throughs from fellow researchers. Share your methodologies to help others grow.',
    to: '/writeups',
    accent: 'rgb(var(--info))',
    tag: 'Knowledge Base',
  },
  {
    number: '03',
    title: 'Track your skills',
    text: 'Monitor your solve history, analyze discipline strengths, and build your offensive security profile.',
    to: '/profile',
    accent: 'rgb(var(--warning))',
    tag: 'Player Profile',
  },
  {
    number: '04',
    title: 'Contribute challenges',
    text: 'Have an interesting vulnerability or binary? Submit a challenge for peer and admin review.',
    to: '/submit-challenge',
    accent: 'rgb(var(--error))',
    tag: 'Community Submissions',
  },
];

const categories = [
  { icon: Globe2, label: 'Web security', value: 'web', color: 'rgb(var(--info))' },
  { icon: Fingerprint, label: 'Cryptography', value: 'crypto', color: 'rgb(var(--warning))' },
  { icon: FileSearch, label: 'Forensics', value: 'forensics', color: 'rgb(var(--success))' },
  { icon: Cpu, label: 'Binary exploitation', value: 'pwn', color: 'rgb(var(--error))' },
  { icon: Search, label: 'OSINT', value: 'osint', color: 'rgb(var(--violet))' },
  { icon: Code2, label: 'Reverse engineering', value: 'rev', color: 'rgb(var(--coral))' },
];

function DiscordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 127.14 96.36" fill="#5865F2" aria-hidden="true">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 98 96" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
      <path fill="#FFFFFF" d="M19 19h-3.13v-4.9c0-1.17-.02-2.67-1.63-2.67-1.63 0-1.88 1.27-1.88 2.59V19H9.23V8.88h3V10.27h.04c.42-.8 1.45-1.63 2.97-1.63 3.18 0 3.76 2.09 3.76 4.81V19zM5.34 7.5a1.82 1.82 0 1 1 0-3.64 1.82 1.82 0 0 1 0 3.64zM6.9 19H3.77V8.88H6.9V19z" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4CAF50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
      <path fill="#1E88E5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
      <polygon fill="#E53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
      <path fill="#C62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C7.666,7.201,4.5,8.775,4.5,11.524C4.5,11.794,4.536,12.057,3,12.298z" />
      <path fill="#FBC02D" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341c2.21-1.658,5.376-0.084,5.376,2.665C43.5,11.794,43.464,12.057,45,12.298z" />
    </svg>
  );
}

const socialChannels = [
  {
    name: 'Discord',
    handle: 'Join Community',
    href: 'https://discord.gg/T92aGQn5f',
    icon: DiscordIcon,
    accent: '#5865F2',
    bg: 'rgba(88, 101, 242, 0.14)',
    border: 'rgba(88, 101, 242, 0.4)',
  },
  {
    name: 'GitHub',
    handle: 'fsociety-pk',
    href: 'https://github.com/fsociety-pk',
    icon: GithubIcon,
    accent: 'rgb(var(--ink))',
    bg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.25)',
  },
  {
    name: 'LinkedIn',
    handle: 'fsociety-pk',
    href: 'https://www.linkedin.com/company/fsociety-pk/',
    icon: LinkedinIcon,
    accent: '#0A66C2',
    bg: 'rgba(10, 102, 194, 0.14)',
    border: 'rgba(10, 102, 194, 0.4)',
  },
  {
    name: 'Email Support',
    handle: 'contact@fsocietypk.tech',
    href: 'mailto:contact@fsocietypk.tech',
    icon: GmailIcon,
    accent: '#EA4335',
    bg: 'rgba(234, 67, 53, 0.14)',
    border: 'rgba(234, 67, 53, 0.4)',
  },
];

function NameLine({ text, line }: { text: string; line: number }) {
  return (
    <span className="hero-name-line" aria-hidden="true">
      {[...text].map((letter, index) => (
        <span key={index} style={{ '--letter-delay': `${line * 240 + index * 52}ms` } as CSSProperties}>
          {letter}
        </span>
      ))}
    </span>
  );
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.45, restDelta: 0.0001 });
  const nameY = useTransform(smoothProgress, [0, 1], [0, -60]);
  const portraitY = useTransform(smoothProgress, [0, 1], [0, 42]);
  const portraitScale = useTransform(smoothProgress, [0, 1], [1, 1.025]);
  const heroCopyOpacity = useTransform(smoothProgress, [0.08, 0.44], [1, 0]);

  useEffect(() => {
    const node = root.current;
    if (!node || reduced) return;
    node.classList.add('scroll-motion-ready');
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.16, rootMargin: '0px 0px -24px 0px' }
    );
    root.current?.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    return () => {
      observer.disconnect();
      node.classList.remove('scroll-motion-ready');
    };
  }, [reduced]);

  return (
    <div className="landing cinematic-landing" ref={root}>
      {/* Cinematic Hero */}
      <section ref={hero} className="cinematic-hero" aria-label="Welcome to Fsociety PK">
        <motion.div className="cinematic-topline" style={reduced ? undefined : { opacity: heroCopyOpacity }}>
          <p className="hero-manifesto">
            <span className="manifesto-learn">Learn.</span>
            <span className="manifesto-practice">Practice.</span>
            <span className="manifesto-share">Share.</span>
          </p>
          <div className="hero-introduction">
            <span className="eyebrow">PAKISTAN’S CYBERSECURITY COMMUNITY</span>
            <p>
              Solve <span className="text-highlight-gold">challenges</span>, inspect real exploits, and contribute to Pakistan&apos;s offensive security ecosystem.
            </p>
            <span className="hero-edition">CTF PLATFORM / OPEN TO THE CURIOUS</span>
          </div>
        </motion.div>

        <motion.h1 style={reduced ? undefined : { y: nameY }} className="hero-name" aria-label="Fsociety PK">
          <NameLine text="FSOCIETY" line={0} />
          <NameLine text="PAKISTAN" line={1} />
        </motion.h1>

        <motion.div className="hero-portrait" style={{ x: '-50%', ...(reduced ? {} : { y: portraitY, scale: portraitScale }) }}>
          <figure className="hero-glitch">
            <img className="portrait-original" src="/brand/masked-portrait.png" alt="Fsociety masked figure in a black top hat and suit" width="941" height="1672" loading="eager" decoding="async" />
            <span className="portrait-glitch-slice glitch-slice-top" aria-hidden="true"><img src="/brand/masked-portrait.png" alt="" width="941" height="1672" /></span>
            <span className="portrait-glitch-slice glitch-slice-middle" aria-hidden="true"><img src="/brand/masked-portrait.png" alt="" width="941" height="1672" /></span>
            <span className="portrait-glitch-slice glitch-slice-bottom" aria-hidden="true"><img src="/brand/masked-portrait.png" alt="" width="941" height="1672" /></span>
          </figure>
        </motion.div>

        <div className="hero-base" aria-hidden="true" />
        <div className="hero-bottom">
          <a href="#practice" className="scroll-cue">
            <ArrowDown size={17} />
            <span>Scroll to explore</span>
          </a>
          <div className="hero-join">
            <p>
              Master cybersecurity.<br />
              <span className="text-highlight-mint">Capture the flags.</span>
            </p>
            <Link to="/signup" className="btn-primary">
              Join the community <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <span className="hero-side-note" aria-hidden="true">CURIOSITY IS YOUR FIRST EXPLOIT.</span>
      </section>

      {/* Categories Strip */}
      <section className="discipline-strip" aria-label="Challenge categories">
        <span className="discipline-label">
          Find your<br />next challenge <ArrowRight size={20} />
        </span>
        <div>
          {categories.map(({ icon: Icon, label, value, color }) => (
            <Link to={`/challenges?category=${value}`} key={value} className="discipline-card">
              <span className="discipline-icon-box" style={{ '--card-color': color } as CSSProperties}>
                <Icon size={20} strokeWidth={1.8} style={{ color }} />
              </span>
              <span className="discipline-name">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 01: Practice CTFs */}
      <section id="practice" className="editorial-section">
        <div className="editorial-intro" data-reveal>
          <span className="eyebrow eyebrow-emerald">01 / Practice. Learn. Share.</span>
          <h2>
            CTF practice.<br />
            <span className="heading-highlight-gold">In one place.</span>
          </h2>
          <p className="editorial-desc">
            Browse real-world challenges across <span className="text-highlight-cyan">6 security domains</span>, track your solves, and learn from detailed writeups.
          </p>
          <Link to="/challenges" className="text-link">
            Explore the challenges <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="feature-rows">
          {features.map(({ number, title, text, to, accent, tag }, index) => (
            <Link
              data-reveal
              style={{ '--reveal-delay': `${index * 60}ms`, '--feature-accent': accent } as CSSProperties}
              to={to}
              key={number}
              className="feature-row-item"
            >
              <span className="feature-number" style={{ color: accent }}>{number}</span>
              <div>
                <span className="feature-tag" style={{ color: accent, borderColor: `color-mix(in srgb, ${accent}, transparent 70%)` }}>{tag}</span>
                <h3 className="feature-title">{title}</h3>
                <p>{text}</p>
              </div>
              <ArrowUpRight size={22} className="feature-arrow" style={{ color: accent }} />
            </Link>
          ))}
        </div>
      </section>

      {/* Section 02: Challenge Library */}
      <section className="library-section" data-reveal>
        <div>
          <span className="eyebrow eyebrow-cyan">02 / Challenge library</span>
          <h2>
            Choose a category.<br />
            <span className="heading-highlight-green">Start solving.</span>
          </h2>
          <p className="library-desc">
            Filter by domain and skill level. Inspect HTTP headers, decrypt ciphertexts, or analyze memory dumps to capture the flags.
          </p>
          <ul className="library-perks">
            {[
              ['Clear difficulty tiers', 'Beginner tasks through to advanced binary exploitation.'],
              ['Dynamic point rewards', 'Earn points and unlock higher-tier security labs.'],
              ['Verified profile tracking', 'Permanent solve timestamps and achievement records.'],
            ].map(([title, desc]) => (
              <li key={title}>
                <span className="perk-check">
                  <Check size={16} />
                </span>
                <div>
                  <strong>{title}</strong> &mdash; <span>{desc}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link className="btn-primary" to="/challenges">
            Browse challenges <ArrowRight size={17} />
          </Link>
        </div>
        <div className="challenge-specimen">
          <div className="specimen-header">
            <span>THE CHALLENGE LIBRARY</span>
            <span className="specimen-badge">LIVE PREVIEW ↗</span>
          </div>
          {[
            ['Web security', 'HTTP Header Poisoning & SSRF', 'Easy', 'rgb(var(--info))'],
            ['Cryptography', 'AES-CBC Padding Oracle Attack', 'Medium', 'rgb(var(--warning))'],
            ['Forensics', 'Memory Dump Volatility Analysis', 'Easy', 'rgb(var(--success))'],
          ].map(([category, title, difficulty, color], i) => (
            <div className="specimen-row" key={title}>
              <span className="specimen-index" style={{ color }}>0{i + 1}</span>
              <div>
                <span className="specimen-category" style={{ color }}>{category}</span>
                <h3>{title}</h3>
              </div>
              <span className={difficulty === 'Easy' ? 'badge-easy' : 'badge-medium'}>{difficulty}</span>
            </div>
          ))}
          <p className="specimen-footer-note">
            Categorized tasks designed for beginners, students, and seasoned CTF players.
          </p>
        </div>
      </section>

      {/* Section 03: Community Invitation (Hall of Fame removed) */}
      <section className="community-invitation" data-reveal>
        <span className="eyebrow eyebrow-gold">03 / Join Fsociety PK</span>
        <h2>
          Start with<br />
          <span className="heading-highlight-gold">a challenge</span>
          <span className="text-marigold">.</span>
        </h2>
        <div>
          <p className="invitation-lead">
            Create an account to save your progress, unlock community writeups, and submit flags.
          </p>
          <Link to="/signup" className="btn-primary">
            Create an account <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* Professional Footer with Real Logos & Structured Columns */}
      <footer className="landing-footer" role="contentinfo">
        <div className="landing-footer-main">
          {/* Brand info */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <BrandLogo className="footer-logo" />
              <strong className="footer-brand-name">FSOCIETY PK</strong>
            </div>
            <p className="footer-tagline">
              Pakistan&apos;s premier cybersecurity learning collective and Capture The Flag training platform.
              Solve practical challenges, analyze real exploits, and collaborate with ethical hackers across the nation.
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-dot" />
              <span>Pakistan&apos;s Cybersecurity Community &middot; Open to the Curious</span>
            </div>
          </div>

          {/* Links grid */}
          <div className="footer-links-grid">
            <div className="footer-col">
              <h3 className="footer-col-title">Platform</h3>
              <ul className="footer-col-links">
                <li><Link to="/challenges">Challenges</Link></li>
                <li><Link to="/writeups">Writeups</Link></li>
                <li><Link to="/resources">Resources</Link></li>
                <li><Link to="/projects">Community Projects</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Contribute</h3>
              <ul className="footer-col-links">
                <li><Link to="/submit-challenge">Submit Challenge</Link></li>
                <li><Link to="/submit-writeup">Share Writeup</Link></li>
                <li><a href="https://github.com/fsociety-pk" target="_blank" rel="noreferrer">Open Source ↗</a></li>
                <li><Link to="/about-admin">Community Lead</Link></li>
              </ul>
            </div>

            <div className="footer-col footer-social-col">
              <h3 className="footer-col-title">Social &amp; Community</h3>
              <p className="footer-social-desc">Connect with ethical hackers, discuss challenges, and follow platform updates.</p>
              <div className="footer-social-list">
                {socialChannels.map(({ name, handle, href, icon: Icon, accent, bg, border }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-social-card"
                    style={{ '--social-accent': accent, '--social-bg': bg, '--social-border': border } as CSSProperties}
                    aria-label={name}
                  >
                    <span className="footer-social-icon">
                      <Icon />
                    </span>
                    <div className="footer-social-meta">
                      <span className="footer-social-name">{name}</span>
                      <span className="footer-social-handle">{handle}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & badges */}
        <div className="landing-footer-bottom">
          <div className="footer-bottom-copy">
            <span>&copy; {new Date().getFullYear()} FSOCIETY PK. All rights reserved.</span>
            <span className="footer-divider-dot">&middot;</span>
            <span className="footer-quote">Curiosity is your first exploit.</span>
          </div>
          <div className="footer-bottom-extra">
            <span className="footer-platform-badge">
              <Shield size={13} />
              <span>CTF Training Ground &middot; Pakistan</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
