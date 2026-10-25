import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { challengeService } from "../services/challenge.service";
import PageState from "../components/common/PageState";
import FlagProgress from "../components/common/FlagProgress";
import { CHALLENGE_CATEGORIES, CATEGORY_LABELS } from "../utils/categories";
export default function Challenges() {
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "all");
  useEffect(() => setCategory(params.get("category") || "all"), [params]);
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const {
    data: challenges = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => challengeService.getChallenges(),
    select: (r) => r.data,
  });
  const filtered = challenges.filter(
    (c) =>
      (category === "all" || c.category === category) &&
      (difficulty === "all" || c.difficulty === difficulty) &&
      c.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <h1>Challenges</h1>
          <p>
            Choose a category and difficulty, then start solving.
          </p>
        </div>
        <Link className="btn-outline" to="/submit-challenge">
          <Plus size={16} />
          Create challenge
        </Link>
      </div>
      <div className="filter-bar">
        <div className="search-field">
          <Search />
          <input
            className="input"
            aria-label="Search challenges"
            placeholder="Find your next challenge…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {CHALLENGE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Filter by difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="all">Every difficulty</option>
          {["easy", "medium", "hard", "insane"].map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <PageState loading />
      ) : isError ? (
        <PageState
          title="Challenges couldn't be loaded"
          description="The challenge service is unavailable. Please try again."
          retry={() => refetch()}
        />
      ) : !filtered.length ? (
        <PageState
          title={
            challenges.length
              ? "No matches this time"
              : "The next challenge starts with you"
          }
          description={
            challenges.length
              ? "Try a different category, difficulty, or search term."
              : "Approved challenges will appear here. You can contribute one for admin review."
          }
          retry={
            challenges.length
              ? () => {
                  setCategory("all");
                  setDifficulty("all");
                  setSearch("");
                }
              : undefined
          }
        />
      ) : (
        <>
          <p className="small-label mb-5">
            {filtered.length} challenge{filtered.length !== 1 ? "s" : ""} to
            explore
          </p>
          <div className="challenge-grid">
            {filtered.map((c) => {
              const solved = c.isSolved;
              const started = (c.completedFlags ?? 0) > 0;
              return (
                <Link
                  key={c._id}
                  to={"/challenges/" + c._id}
                  className={`challenge-card${solved ? " challenge-card-solved" : ""}`}
                  data-category={c.category}
                >
                  <div className="challenge-card-heading">
                    <span className="category-label">{CATEGORY_LABELS[c.category] || c.category}</span>
                    <span className={{easy: "badge-easy", medium: "badge-medium", hard: "badge-hard", insane: "badge-insane"}[c.difficulty]}>
                      {c.difficulty}
                    </span>
                  </div>
                  <h2>{c.title}</h2>
                  <p>{c.description}</p>
                  {(c.totalFlags ?? 1) > 1 && (
                    <FlagProgress completed={c.completedFlags ?? 0} total={c.totalFlags!} />
                  )}
                  <footer>
                    <span>{c.solveCount || 0} {(c.solveCount || 0) === 1 ? "solver" : "solvers"}</span>
                    <strong>{c.points} pts</strong>
                  </footer>
                  <div className="challenge-card-action">
                    <strong>{solved ? "Solved" : started ? "Continue challenge" : "Start challenge"}</strong>
                    <span>{solved ? "All flags complete" : started ? "In progress" : "Unsolved"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
