import Lottie from "lottie-react";
import { motion, useReducedMotion } from "framer-motion";
import winnerBadge from "../../images/rank_1.json";
import podiumBadge from "../../images/rank_2and3.json";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Trophy, Crown, ArrowUpRight } from "lucide-react";
import {
  leaderboardService,
  LeaderboardFilter,
} from "../services/leaderboardService";
import { socketService } from "../utils/socket";
import { useAuthStore } from '../store/authStore';
import PageState from "../components/common/PageState";
export default function Leaderboard() {
  const user = useAuthStore(state => state.user);
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
    refetchInterval: 30000,
  });
  useEffect(() => {
    socketService.connect();
    const refresh = () => { void refetch(); };
    socketService.on("leaderboardUpdate", refresh);
    socketService.on("connect", refresh);
    return () => { socketService.off("leaderboardUpdate", refresh); socketService.off("connect", refresh); };
  }, [refetch]);
  const filtered = data.filter((entry) =>
    entry.username.toLowerCase().includes(search.toLowerCase()),
  );
  const tableEntries = search.trim() ? filtered : data.slice(3);
  return (
    <div className="page-wrap hall-of-fame">
      <div className="page-heading fame-heading">
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
      {data.length > 0 && <div className="fame-summary"><span><strong>{data.length}</strong> ranked members</span><span><strong>{data.reduce((sum, member) => sum + (member.solveCount || 0), 0).toLocaleString()}</strong> challenge solves</span><span><strong>{data.reduce((sum, member) => sum + member.score, 0).toLocaleString()}</strong> points earned</span></div>}
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
        <PageState loading title="Loading the Hall of Fame" description="Bringing the community rankings up to date." />
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
          {!search.trim() && (
            <motion.div key={filter} className="podium fame-podium" initial="hidden" animate="visible">
              {data.slice(0, 3).map((entry, i) => (
                <motion.article key={entry.userId} variants={{ hidden: { opacity: 0, y: reducedMotion ? 0 : 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reducedMotion ? 0 : .45, delay: reducedMotion ? 0 : i * .09 }} className="fame-podium-slot">
                <Link
                  to={"/profile/" + encodeURIComponent(entry.username)}
                  className={`podium-card fame-place-${i + 1}`}
                >
                  <span className="ranking-number">{i === 0 && <Crown size={15} />} {i === 0 ? "Leading the board" : `Rank #${i + 1}`}</span>
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
                      {entry.solveCount || 0} challenges solved
                    </p>
                  </div>
                  <span className="fame-score">{entry.score.toLocaleString()}<small>POINTS</small></span>
                  <span className="fame-profile">View profile <ArrowUpRight size={14} /></span>
                </Link></motion.article>
              ))}
            </motion.div>
          )}
          {tableEntries.length > 0 && <div className="soft-panel table-scroll">
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
                {tableEntries.map((entry) => (
                  <tr key={entry.userId} className={entry.username === user?.username ? "fame-your-row" : undefined}>
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
                        {entry.username}{entry.username === user?.username && <span className="fame-you">You</span>}
                      </Link>
                    </td>
                    <td>{entry.solveCount || 0}</td>
                    <td>
                      <strong>{entry.score.toLocaleString()}</strong><div className="fame-score-track" aria-hidden="true"><span style={{ transform: `scaleX(${entry.score / Math.max(1, data[0]?.score || 1)})` }} /></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </>
      )}
    </div>
  );
}
