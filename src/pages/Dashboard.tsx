import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, Flag, Send, Trophy, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { TEAM_ABOUT_URL } from '../data/team';
import LiveSolveFeed from '../components/common/LiveSolveFeed';
import Landing from './Landing';
import '../styles/overview.css';

function PersonalDashboard() {
  const user = useAuthStore(state => state.user);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', user?._id],
    queryFn: userService.getProfile,
    select: response => response.data,
  });
  const ready = !!data;
  const score = Math.max(0, data?.score ?? 0);
  const level = Math.floor(score / 1000) + 1;
  const levelPoints = score % 1000;
  const inProgress = (data?.challengeProgress ?? []).filter(item => item.completedFlags < item.totalFlags).slice(0, 2);
  const recentSolves = (data?.solveHistory ?? []).filter(solve => solve.isCorrect !== false).slice(0, 4);

  return <div className="page-wrap overview-page">
    <header className="overview-heading">
      <div><h1>Overview</h1><p>Welcome back, {user?.username}. Here’s where you stand.</p></div>
      <Link className="overview-profile-link" to="/profile">View my profile<ArrowUpRight size={16} aria-hidden="true" /></Link>
    </header>

    <section className="overview-summary" aria-label="Your progress" aria-busy={isLoading}>
      <dl>
        <div><dt>Challenges solved</dt><dd>{ready ? (data.solvedChallenges?.length ?? 0).toLocaleString() : '—'}</dd></div>
        <div><dt>Total points</dt><dd>{ready ? score.toLocaleString() : '—'}<span>pts</span></dd></div>
        <div><dt>Global rank</dt><dd>{ready && data.rank ? `#${data.rank.toLocaleString()}` : '—'}<Link to="/leaderboard" aria-label="View global rankings"><ArrowUpRight size={18} /></Link></dd></div>
      </dl>
      {isLoading && <p className="overview-query-status" role="status">Loading your progress…</p>}
    </section>
    {isError && <div className="overview-error" role="alert"><p>Your progress couldn’t be refreshed. You can still browse challenges.</p><button className="btn-outline" onClick={() => void refetch()}>Try again</button></div>}

    <div className="overview-layout">
      <div className="overview-main">
        <section className="overview-practice" aria-labelledby="overview-practice-heading">
          <div className="overview-practice-title"><Flag size={22} aria-hidden="true" /><h2 id="overview-practice-heading">{inProgress.length ? 'Continue practicing' : 'Your next challenge'}</h2></div>
          {inProgress.length ? <>
            <p>You’ve already found a few flags. Pick up where you left off.</p>
            <div className="overview-continue-list">{inProgress.map(item => <Link key={item.challengeId._id} to={`/challenges/${item.challengeId._id}`} className="overview-continue-row">
              <div><strong>{item.challengeId.title}</strong><span>{item.completedFlags} of {item.totalFlags} flags captured</span></div><span className="overview-continue-action">Continue<ArrowRight size={16} aria-hidden="true" /></span>
            </Link>)}</div>
            <Link to="/challenges" className="overview-text-link">Browse all challenges<ArrowRight size={15} aria-hidden="true" /></Link>
          </> : <>
            <p>{isLoading ? 'Loading your challenges…' : !ready && isError ? 'Find a challenge while your progress reconnects.' : score ? 'Keep building your skills. Find a new challenge and capture the next flag.' : 'Follow the clues, capture your first flag, and start building your skills.'}</p>
            <div className="overview-practice-actions"><Link className="btn-primary" to="/challenges">Explore challenges<ArrowRight size={16} aria-hidden="true" /></Link><Link to="/writeups" className="overview-text-link">Read community writeups</Link></div>
          </>}
        </section>

        <section className="overview-panel overview-history" aria-labelledby="overview-history-heading">
          <div className="overview-section-heading"><h2 id="overview-history-heading">Your recent solves</h2><Link to="/profile">View all<ArrowUpRight size={15} aria-hidden="true" /></Link></div>
          {isLoading ? <p className="overview-empty" role="status">Loading your recent solves…</p> : !ready && isError ? <p className="overview-empty">Your recent solves will appear when your progress reconnects.</p> : recentSolves.length ? <table className="overview-solves-table">
            <thead><tr><th scope="col">Challenge</th><th scope="col">Earned</th></tr></thead>
            <tbody>{recentSolves.map((solve, index) => {
              const challenge = solve.challengeId || solve.challenge;
              const date = solve.timestamp ? new Date(solve.timestamp) : null;
              return <tr key={solve._id || index}><td>{challenge?._id ? <Link to={`/challenges/${challenge._id}`}>{challenge.title || 'Completed challenge'}</Link> : <strong>{challenge?.title || 'Completed challenge'}</strong>}<div className="overview-solve-meta">{challenge?.category && <span>{challenge.category}</span>}{date && !Number.isNaN(date.getTime()) && <time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>}</div></td><td>+{Number(solve.pointsAwarded ?? 0).toLocaleString()}<span> pts</span></td></tr>;
            })}</tbody>
          </table> : <div className="overview-empty"><Trophy size={24} aria-hidden="true" /><div><strong>Your first solve belongs here.</strong><p>Complete a challenge to see it in your history.</p></div></div>}
        </section>

        <section className="overview-panel overview-contribute" aria-labelledby="overview-contribute-heading">
          <div className="overview-section-heading"><h2 id="overview-contribute-heading">Make it a community effort</h2></div>
          <Link to="/submit-writeup" className="overview-action-row"><BookOpen size={20} aria-hidden="true" /><div><strong>Write a solution</strong><span>Share how you solved a challenge.</span></div><ArrowUpRight size={17} aria-hidden="true" /></Link>
          <Link to="/submissions" className="overview-action-row"><Send size={20} aria-hidden="true" /><div><strong>My submissions</strong><span>Check reviews and feedback on your contributions.</span></div><ArrowUpRight size={17} aria-hidden="true" /></Link>
        </section>

        <section className="team-dashboard-link overview-team" aria-labelledby="dashboard-team-heading"><Users size={20} aria-hidden="true" /><div><h2 id="dashboard-team-heading">Meet Fsociety PK</h2><p>Our people, CTFs, and community.</p></div><a href={TEAM_ABOUT_URL} target="_blank" rel="noopener noreferrer">About the team<ArrowUpRight size={15} aria-hidden="true" /></a></section>
      </div>

      <aside className="overview-sidebar" aria-label="Learning progress and community activity">
        <section className="overview-panel overview-level" aria-labelledby="overview-level-heading">
          <div className="overview-section-heading"><h2 id="overview-level-heading">Your next milestone</h2><span className="overview-level-label">{ready ? `Level ${level}` : '—'}</span></div>
          {ready ? <><p><strong>{(1000 - levelPoints).toLocaleString()} points</strong> to level {level + 1}</p><progress value={levelPoints} max={1000} aria-label={`Progress to level ${level + 1}`} /><div className="overview-level-caption"><span>{levelPoints.toLocaleString()} / 1,000 pts</span><span>Keep solving</span></div></> : <p className="overview-level-wait">{isLoading ? 'Loading your milestone…' : 'Your milestone will appear when progress is available.'}</p>}
        </section>
        <LiveSolveFeed />
        <Link to="/resources" className="overview-resource-link"><BookOpen size={18} aria-hidden="true" /><span>Need a hand? <strong>Explore resources</strong></span><ArrowUpRight size={16} aria-hidden="true" /></Link>
      </aside>
    </div>
  </div>;
}

export default function Dashboard() {
  const authenticated = useAuthStore(state => state.isAuthenticated);
  return authenticated ? <PersonalDashboard /> : <Landing />;
}
