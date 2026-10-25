import Lottie from "lottie-react";
import { useReducedMotion } from "framer-motion";
import winnerBadge from "../../images/rank_1.json";
import podiumBadge from "../../images/rank_2and3.json";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Trophy } from "lucide-react";
import {
  leaderboardService,
  LeaderboardFilter,
} from "../services/leaderboardService";
import { socketService } from "../utils/socket";
import PageState from "../components/common/PageState";
export default function Leaderboard() {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<LeaderboardFilter>("all-time");
  const [search, setSearch] = useState("");
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["leaderboard", filter],
    queryFn: () => leaderboardService.getLeaderboard(filter),
    select: (r) => r.data,
  });
  useEffect(() => {
    socketService.connect();
    socketService.on("leaderboardUpdate", () => refetch());
    return () => socketService.off("leaderboardUpdate");
  }, [refetch]);
  const filtered = data.filter((entry) =>
    entry.username.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Community rankings</span>
          <h1>Hall of Fame</h1>
          <p>
            See the top solvers and follow your rank. Every solve counts.
          </p>
        </div>
        <Trophy
          className="text-brand hidden md:block"
          size={35}
          strokeWidth={1.2}
        />
      </div>
      <div className="tabs-line" role="tablist" aria-label="Ranking period">
        {(
          [
            ["all-time", "All time"],
            ["monthly", "This month"],
            ["weekly", "This week"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="filter-bar">
        <div className="search-field max-w-md">
          <Search />
          <input
            className="input"
            aria-label="Search members"
            placeholder="Find a community member…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {isLoading ? (
        <PageState loading />
      ) : isError ? (
        <PageState
          title="Rankings are temporarily unavailable"
          retry={() => refetch()}
        />
      ) : !filtered.length ? (
        <PageState
          title="No members to show"
          description={
            search
              ? "Try a different username."
              : "Community rankings will appear as members start solving."
          }
        />
      ) : (
        <>
          {!search && (
            <div className="podium">
              {data.slice(0, 3).map((entry, i) => (
                <Link
                  key={entry.userId}
                  to={"/profile/" + encodeURIComponent(entry.username)}
                  className="podium-card"
                >
                  <span className="ranking-number">Rank #{i + 1}</span>
                  <div className="rank-art">
                  <div className="avatar-small">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt="" />
                    ) : (
                      entry.username[0].toUpperCase()
                    )}
                  </div>
                  <Lottie className="rank-animation" animationData={i === 0 ? winnerBadge : podiumBadge} autoplay={!reducedMotion} loop={!reducedMotion} aria-hidden="true" />
                  </div>
                  <div>
                    <h2>{entry.username}</h2>
                    <p>
                      {entry.score.toLocaleString()} points ·{" "}
                      {entry.solveCount || 0} solves
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="soft-panel table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Member</th>
                  <th>Solves</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.userId}>
                    <td>#{entry.rank}</td>
                    <td>
                      <Link
                        to={"/profile/" + encodeURIComponent(entry.username)}
                        className="inline-flex items-center gap-3 font-medium"
                      >
                        <span className="avatar-small">
                          {entry.avatar ? (
                            <img src={entry.avatar} alt="" />
                          ) : (
                            entry.username[0].toUpperCase()
                          )}
                        </span>
                        {entry.username}
                      </Link>
                    </td>
                    <td>{entry.solveCount || 0}</td>
                    <td>
                      <strong>{entry.score.toLocaleString()}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
