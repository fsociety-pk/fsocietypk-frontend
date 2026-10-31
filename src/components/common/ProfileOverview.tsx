import { Link } from "react-router-dom";
import { ArrowUpRight, Award, Flag, Target } from 'lucide-react';
import { safeDate } from '../../utils/profileFormat';
import { UserProfile } from "../../services/userService";
import { CATEGORY_LABELS } from "../../utils/categories";
import FlagProgress from "./FlagProgress";

export { safeDate } from '../../utils/profileFormat';
export { default as ProfileHeader } from './ProfileIdentity';

export function SolveHistory({
  profile,
  limit,
}: {
  profile: UserProfile;
  limit?: number;
}) {
  const solves = (profile.solveHistory || []).slice(0, limit);
  return solves.length ? (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Challenge</th>
            <th>Category</th>
            <th>Solved</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {solves.map((s, i) => {
            const challenge = s.challengeId || s.challenge;
            return (
              <tr key={s._id || i}>
                <td>
                  {challenge?._id ? (
                    <Link
                      className="font-medium hover:underline"
                      to={"/challenges/" + challenge._id}
                    >
                      {challenge.title}
                    </Link>
                  ) : (
                    challenge?.title || "Completed challenge"
                  )}
                </td>
                <td>
                  {CATEGORY_LABELS[challenge?.category] ||
                    challenge?.category ||
                    "—"}
                </td>
                <td className="muted">
                  {safeDate(s.timestamp || s.createdAt)}
                </td>
                <td className="font-semibold">+{s.pointsAwarded}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="py-10 text-center">
      <Award size={27} className="mx-auto mb-3 text-text-muted" />
      <p className="text-sm text-text-muted">
        Your solved challenges will appear here.
      </p>
      <Link
        to="/challenges"
        className="inline-flex items-center gap-2 text-brand text-sm mt-4"
      >
        Explore challenges <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
export default function ProfileOverview({ profile }: { profile: UserProfile }) {
  const progress = profile.proficiencyIndex || [];
  return (
    <div className="profile-grid">
      <section className="soft-panel">
        <h2 className="profile-panel-title"><Flag size={18} aria-hidden="true" />Recent solves</h2>
        <SolveHistory profile={profile} limit={5} />
        {!!profile.challengeProgress?.length && (
          <div className="mt-6 border-t border-surface-border pt-6">
            <h3 className="mb-4 font-semibold">In progress</h3>
            {profile.challengeProgress.map(p => (
              <div key={p.challengeId._id}>
                <Link className="text-sm font-medium hover:underline" to={`/challenges/${p.challengeId._id}`}>
                  {p.challengeId.title}
                </Link>
                <FlagProgress completed={p.completedFlags} total={p.totalFlags} />
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="soft-panel">
        <h2 className="profile-panel-title"><Target size={18} aria-hidden="true" />Category progress</h2>
        {progress.length ? (
          progress.map((stat) => (
            <div className="progress-item" key={stat.category}>
              <div>
                <span>{CATEGORY_LABELS[stat.category] || stat.category}</span>
                <span className="muted">
                  {stat.solved} / {stat.total}
                </span>
              </div>
              <div className="progress-track" role="progressbar" aria-label={`${CATEGORY_LABELS[stat.category] || stat.category} challenges solved`} aria-valuemin={0} aria-valuemax={stat.total} aria-valuenow={stat.solved}>
                <div
                  style={{
                    width:
                      Math.max(
                        0,
                        Math.min(
                          100,
                          stat.total > 0 ? (stat.solved / stat.total) * 100 : 0,
                        ),
                      ) + "%",
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="muted text-sm py-6">
            Solve a challenge to start building your category progress.
          </p>
        )}
        <div className="notice mt-6">
          <strong>Try another category.</strong>
          <p className="mt-1">
            Build more skills by choosing a different type of challenge.
          </p>
        </div>
      </section>
    </div>
  );
}
