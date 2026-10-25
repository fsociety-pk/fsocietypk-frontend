import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, ArrowUpRight } from "lucide-react";
import { challengeService } from "../services/challenge.service";
import { writeupService } from "../services/writeup.service";
import { resourceService } from "../services/resource.service";
import PageState from "../components/common/PageState";
import { safeDate } from "../components/common/ProfileOverview";
export default function MySubmissions() {
  const [tab, setTab] = useState("challenges");
  const [page, setPage] = useState(1);
  const challenges = useQuery({
    queryKey: ["my-challenges"],
    queryFn: () => challengeService.getMySubmissions(),
    select: (r) => r.data,
    enabled: tab === "challenges",
  });
  const writeups = useQuery({
    queryKey: ["my-writeups", page],
    queryFn: () => writeupService.getUserWriteups(page, 10),
    select: (r) => r.data,
    enabled: tab === "writeups",
  });
  const resources = useQuery({
    queryKey: ["my-resources"],
    queryFn: () => resourceService.getMyResources(),
    select: (r) => r.data,
    enabled: tab === "resources",
  });
  const query =
    tab === "challenges"
      ? challenges
      : tab === "writeups"
        ? writeups
        : resources;
  const rows =
    tab === "challenges"
      ? (challenges.data || []).map((c) => ({
          id: c._id,
          title: c.title,
          status: c.status,
          note: c.rejectionReason,
          date: c.createdAt,
          url: c.status === "approved" ? "/challenges/" + c._id : undefined,
          challengeUrl: c.challengeUrl,
        }))
      : tab === "writeups"
        ? (writeups.data?.writeups || []).map((w) => ({
            id: w._id,
            title: w.title,
            status: w.status,
            note: w.adminNotes,
            date: w.createdAt,
            url: "/writeups/" + w._id,
            challengeUrl: undefined,
          }))
        : (resources.data || []).map((r) => ({
            id: r._id,
            title: r.title,
            status: r.isApproved ? "approved" : "pending",
            note: undefined,
            date: r.createdAt,
            url: undefined,
            challengeUrl: undefined,
          }));
  const target =
    tab === "challenges"
      ? "/submit-challenge"
      : tab === "writeups"
        ? "/submit-writeup"
        : "/resources";
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Built by you</span>
          <h1>My submissions</h1>
          <p>Check the review status of your challenges, writeups, and resources.</p>
        </div>
        <Link to={target} className="btn-primary">
          <Plus size={16} />
          Create{" "}
          {tab === "challenges"
            ? "challenge"
            : tab === "writeups"
              ? "writeup"
              : "resource"}
        </Link>
      </div>
      <div className="tabs-line" role="tablist" aria-label="Submission types">
        {["challenges", "writeups", "resources"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            className="capitalize"
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {query.isLoading ? (
        <PageState loading />
      ) : query.isError ? (
        <PageState
          title="Submissions couldn't be loaded"
          retry={() => query.refetch()}
        />
      ) : !rows.length ? (
        <PageState
          title="Your next idea belongs here"
          description="Submit something useful and follow its review status on this page."
        />
      ) : (
        <div>
          {rows.map((row) => (
            <div className="review-card" key={row.id}>
              <div className="flex justify-between gap-4">
                <span className={"status-pill " + row.status}>
                  {row.status}
                </span>
                <span className="text-xs text-text-muted">
                  {safeDate(row.date)}
                </span>
              </div>
              <h2>{row.title}</h2>
              {row.challengeUrl && /^https?:\/\//i.test(row.challengeUrl) && (
                <a href={row.challengeUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-brand underline mt-3">
                  Challenge URL: {row.challengeUrl}
                </a>
              )}
              {row.note && (
                <div className="notice mt-4">
                  <strong>Review feedback</strong>
                  <p>{row.note}</p>
                </div>
              )}
              {row.url && (
                <Link
                  to={row.url}
                  className="inline-flex items-center gap-2 text-sm text-brand mt-4"
                >
                  View {tab === "writeups" ? "writeup" : "challenge"}{" "}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
      {tab === "writeups" && (writeups.data?.pagination?.pages || 1) > 1 && (
        <div className="form-actions">
          <button
            className="btn-outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="text-sm">Page {page}</span>
          <button
            className="btn-outline"
            disabled={page >= (writeups.data?.pagination?.pages || 1)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
