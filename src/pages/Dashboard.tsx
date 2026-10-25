import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Flag, BookOpen, Send, Trophy } from 'lucide-react';
import Landing from './Landing';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import PageState from '../components/common/PageState';
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
