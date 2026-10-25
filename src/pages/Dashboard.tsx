import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Flag, BookOpen, Send, Trophy, ShieldCheck, Users, Code2, Fingerprint, Globe2, Search, Cpu, FileSearch, Check, LayoutDashboard } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import PageState from '../components/common/PageState';
const EarthBackdrop = lazy(() => import('../components/common/EarthBackdrop'));
const features = [
  {icon: Flag, title: 'Practice with CTFs', text: 'Solve security challenges at your own pace. Start with easy tasks and work your way up.', to: '/challenges'},
  {icon: BookOpen, title: 'Learn from writeups', text: 'Read how other members solved a challenge. Share your steps to help someone else.', to: '/writeups'},
  {icon: LayoutDashboard, title: 'See your progress', text: 'Keep track of your solves, points, and skills in one place.', to: '/profile'},
  {icon: Send, title: 'Add your own challenge', text: 'Have an idea? Submit a challenge. An admin will check it before it goes live.', to: '/submit-challenge'},
  {icon: ShieldCheck, title: 'Find useful resources', text: 'Browse guides and tools shared by the community. Save time finding what to learn next.', to: '/resources'},
  {icon: Users, title: 'Hall of Fame', text: 'View player rankings, points, and completed challenges.', to: '/leaderboard'},
];
function Landing() {
  return <div className="landing">
    <Suspense fallback={null}><EarthBackdrop /></Suspense>
    <section className="landing-hero">
      <div className="hero-copy">
        <span className="hero-label"><span /> Fsociety PK · CTF platform</span>
        <h1>Practice cybersecurity.<br />Solve <em>CTF challenges.</em></h1>
        <p>Solve challenges, read writeups, and submit your own tasks for admin review.</p>
        <div className="hero-actions"><Link to="/signup" className="btn-primary">Create account <ArrowRight size={17}/></Link><Link to="/challenges" className="btn-outline">View challenges <ArrowUpRight size={17}/></Link></div>
        <span className="hero-note">Challenges for beginners and experienced players.</span>
      </div>

    </section>
    <div className="category-strip"><span>Challenge categories</span><div>{[[Globe2,'Web security'],[Fingerprint,'Cryptography'],[FileSearch,'Forensics'],[Cpu,'Binary exploitation'],[Search,'OSINT'],[Code2,'Reverse engineering']].map(([Icon,label])=>{const I=Icon as typeof Globe2;return <span key={String(label)}><I size={19}/>{String(label)}</span>})}</div></div>
    <section className="landing-section" id="features">
      <div className="section-head"><span className="eyebrow">Practice. Learn. Share.</span><h2>CTF practice,<br />in one place.</h2><p>Browse challenges, track your results, and share solutions with other members.</p></div>
      <div className="feature-grid">{features.map(({icon:Icon,title,text,to})=><Link to={to} key={title} className="feature-card"><span className="feature-icon"><Icon size={23} strokeWidth={1.6}/></span><h3>{title}</h3><p>{text}</p><ArrowUpRight className="feature-link" size={18}/></Link>)}</div>
    </section>
    <section className="landing-section showcase-section">
      <div className="showcase-copy"><span className="eyebrow">Challenge library</span><h2>Choose a category.<br />Start solving.</h2><p>Filter by category and difficulty. Read the task, use a hint if you need one, and submit the flag when you find it.</p><ul><li><Check size={17}/> Clear difficulty levels</li><li><Check size={17}/> Points for every solve</li><li><Check size={17}/> Your progress, saved to your profile</li></ul><Link to="/challenges" className="btn-primary">Browse challenges <ArrowRight size={17}/></Link></div>
      <div className="dashboard-preview" aria-label="Example challenge list"><div className="preview-top"><span><LayoutDashboard size={16}/> Challenge library</span><small>Preview</small></div><div className="preview-intro"><h3>Available challenges</h3><p>Filter by category or difficulty.</p></div><div className="preview-filters"><span>All challenges</span><span>Web</span><span>Crypto</span><span>Forensics</span></div>{[['Web security','HTTP request analysis','Easy'],['Cryptography','Message decryption','Medium'],['Forensics','File analysis','Easy']].map(([category,title,level],i)=><div className="preview-challenge" key={title}><span className="preview-icon">{i===0?<Globe2 size={19}/>:i===1?<Fingerprint size={19}/>:<FileSearch size={19}/>}</span><div><small>{category}</small><strong>{title}</strong></div><span className={level==='Easy'?'badge-easy':'badge-medium'}>{level}</span></div>)}<div className="preview-bottom"><ShieldCheck size={15}/> Challenges are checked before they go live.</div></div>
    </section>
    <section className="landing-section"><div className="landing-facts">{[['Solve','Practice your skills'],['Learn','Read guides and writeups'],['Share','Create a challenge'],['Connect','Meet other learners']].map(([title,text])=><div key={title}><strong>{title}</strong><span>{text}</span></div>)}</div></section>
    <section className="landing-section cta-section"><div className="cta-card"><span className="eyebrow">Join Fsociety PK</span><h2>Start with a challenge.</h2><p>Create an account to save your progress and submit flags.</p><div className="hero-actions"><Link to="/signup" className="btn-primary">Create an account <ArrowRight size={17}/></Link><Link to="/leaderboard" className="btn-outline">Hall of Fame <Trophy size={17}/></Link></div></div></section>
    <div className="landing-footer"><div><strong>Fsociety PK</strong><p>A place to practice cybersecurity<br/>and learn with others.</p></div><div><h3>Explore</h3><Link to="/challenges">Challenges</Link><Link to="/writeups">Writeups</Link><Link to="/resources">Resources</Link></div><div><h3>Community</h3><Link to="/leaderboard">Hall of Fame</Link><Link to="/projects">Our projects</Link><a href="https://github.com/fsociety-pk" target="_blank" rel="noreferrer">GitHub ↗</a></div><div><h3>Get in touch</h3><a href="https://discord.gg/YYpFYBzH" target="_blank" rel="noreferrer">Discord ↗</a><a href="mailto:pkfsociety@gmail.com">Email us</a><Link to="/submit-challenge">Submit a challenge</Link></div></div>
  </div>;
}
function PersonalDashboard() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
    select: (r) => r.data,
  });
  return (
    <div className="page-wrap">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>
            Your dashboard
            <br />
            {user?.username}
          </h1>
          <p>
            View your results, continue solving, or submit a challenge.
          </p>
          <Link className="btn-primary" to="/challenges">
            View challenges <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="welcome-note"><span className="small-label">Learning resources</span><h2>Guides and tools</h2><p>Read community guides and find tools for your next challenge.</p><Link to="/resources">Open learning resources <ArrowRight size={16} /></Link></div>
      </section>
      {isLoading ? (
        <PageState loading />
      ) : isError ? (
        <div className="mt-6">
          <PageState
            title="We couldn't load your progress"
            description="Try reconnecting to refresh your statistics."
            retry={() => refetch()}
          />
        </div>
      ) : (
        <div className="stats-strip">
          <div>
            <strong>{data?.solvedChallenges?.length || 0}</strong>
            <span>Challenges solved</span>
          </div>
          <div>
            <strong>{(data?.score || 0).toLocaleString()}</strong>
            <span>Total points</span>
          </div>
          <div>
            <strong>{data?.rank ? "#" + data.rank : "—"}</strong>
            <span>Global rank</span>
          </div>
          <div>
            <strong>{Math.floor((data?.score || 0) / 1000) + 1}</strong>
            <span>Current level</span>
          </div>
        </div>
      )}
      <div className="section-title">
        <h2>Quick links</h2>
        <Link to="/resources">
          Browse resources <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="action-grid">
        {[
          {
            to: "/challenges",
            icon: Flag,
            title: "Find a challenge",
            text: "Browse challenges by category and difficulty.",
          },
          {
            to: "/submit-writeup",
            icon: BookOpen,
            title: "Write a solution",
            text: "Explain the steps you used to solve a challenge.",
          },
          {
            to: "/submissions",
            icon: Send,
            title: "My submissions",
            text: "Follow the review status of your challenges, writeups, and resources.",
          },
        ].map(({ to, icon: Icon, title, text }) => (
          <Link to={to} key={to} className="action-card">
            <Icon size={23} />
            <h3>{title}</h3>
            <p>{text}</p>
          </Link>
        ))}
      </div>
      <div className="section-title">
        <h2>Recent activity</h2>
        <Link to="/profile">
          View profile <ArrowUpRight size={15} />
        </Link>
      </div>
      {data?.solveHistory?.some((s) => s.pointsAwarded > 0) ? (
        <div className="soft-panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Challenge</th>
                <th>Category</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {data.solveHistory
                .filter((s) => s.pointsAwarded > 0)
                .slice(0, 5)
                .map((solve, i) => (
                  <tr key={solve._id || i}>
                    <td>
                      {solve.challengeId?.title ||
                        solve.challenge?.title ||
                        "Completed challenge"}
                    </td>
                    <td>
                      {solve.challengeId?.category ||
                        solve.challenge?.category ||
                        "—"}
                    </td>
                    <td>+{solve.pointsAwarded}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="notice flex items-center gap-4">
          <Trophy size={23} />
          <div>
            <strong>No solves yet.</strong>
            <p>Completed challenges and earned points will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
export default function Dashboard() {
  const authenticated = useAuthStore((s) => s.isAuthenticated);
  return authenticated ? <PersonalDashboard /> : <Landing />;
}
