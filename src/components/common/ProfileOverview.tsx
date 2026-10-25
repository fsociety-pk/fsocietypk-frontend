import { Link } from "react-router-dom";
import {
  Github,
  Linkedin,
  Instagram,
  Globe,
  Lock,
  MapPin,
  Calendar,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { ReactNode } from "react";
import { UserProfile } from "../../services/userService";
import { CATEGORY_LABELS } from "../../utils/categories";

export const safeDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};
export function ProfileHeader({
  profile,
  avatar,
}: {
  profile: UserProfile;
  avatar?: ReactNode;
}) {
  return (
    <>
      <section className="profile-banner">
        <div className="profile-identity">
          {avatar || (
            <div className="profile-avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} />
              ) : (
                profile.username?.[0]?.toUpperCase()
              )}
            </div>
          )}
          <div>
            <span className="eyebrow">
              {profile.role === "admin"
                ? "Community admin"
                : "Community member"}
            </span>
            <h1 className="profile-name">{profile.username}</h1>
            <p className="profile-bio">
              {profile.bio || "This member has not added a bio yet."}
            </p>
            <div className="profile-meta">
              {profile.country && (
                <span>
                  <MapPin size={12} />
                  {profile.country}
                </span>
              )}
              <span>
                <Calendar size={12} />
                Joined {safeDate(profile.createdAt)}
              </span>
              <span>
                {profile.isProfilePublic ? (
                  <Globe size={12} />
                ) : (
                  <Lock size={12} />
                )}{" "}
                {profile.isProfilePublic ? "Public profile" : "Private profile"}
              </span>
            </div>
            <div className="profile-socials">
              {[
                { key: "github" as const, label: "GitHub", icon: Github },
                { key: "linkedin" as const, label: "LinkedIn", icon: Linkedin },
                {
                  key: "instagram" as const,
                  label: "Instagram",
                  icon: Instagram,
                },
              ].map(({ key, label, icon: Icon }) => {
                const url = profile.socialLinks?.[key];
                return url && /^https?:\/\//i.test(url) ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={14} />
                    {label}
                    <ArrowUpRight size={12} />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>
        
      </section>
      <div className="stats-strip">
        <div>
          <strong>{profile.solvedChallenges?.length || 0}</strong>
          <span>Challenges solved</span>
        </div>
        <div>
          <strong>{Number(profile.score || 0).toLocaleString()}</strong>
          <span>Total points</span>
        </div>
        <div>
          <strong>{profile.rank ? "#" + profile.rank : "—"}</strong>
          <span>Global rank</span>
        </div>
        <div>
          <strong>{Math.floor((profile.score || 0) / 1000) + 1}</strong>
          <span>Current level</span>
        </div>
      </div>
    </>
  );
}
export function SolveHistory({
  profile,
  limit,
}: {
  profile: UserProfile;
  limit?: number;
}) {
  const solves = (profile.solveHistory || [])
    .filter((s) => s.pointsAwarded > 0)
    .slice(0, limit);
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
        <h2>Recent solves</h2>
        <SolveHistory profile={profile} limit={5} />
      </section>
      <section className="soft-panel">
        <h2>Category progress</h2>
        {progress.length ? (
          progress.map((stat) => (
            <div className="progress-item" key={stat.category}>
              <div>
                <span>{CATEGORY_LABELS[stat.category] || stat.category}</span>
                <span className="muted">
                  {stat.solved} / {stat.total}
                </span>
              </div>
              <div className="progress-track">
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
