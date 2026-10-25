import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, X } from "lucide-react";
import toast from "react-hot-toast";
import { writeupService } from "../../services/writeup.service";
import { resourceService } from "../../services/resource.service";
import PageState from "../../components/common/PageState";

export default function CommunityReviews() {
  const [tab, setTab] = useState<"writeups" | "resources">("writeups");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const client = useQueryClient();
  const writeups = useQuery({
    queryKey: ["pending-writeups", page],
    queryFn: () => writeupService.getPendingWriteups(page, 10),
    enabled: tab === "writeups",
    select: (r) => r.data,
  });
  const resources = useQuery({
    queryKey: ["pending-resources"],
    queryFn: resourceService.getPendingResources,
    enabled: tab === "resources",
    select: (r) => r.data,
  });
  const review = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approve-writeup" | "reject-writeup" | "approve-resource";
    }) => {
      if (action === "approve-resource")
        return resourceService.approveResource(id);
      if (action === "reject-writeup")
        return writeupService.rejectWriteup(id, notes[id]?.trim());
      return writeupService.approveWriteup(id);
    },
    onSuccess: () => {
      toast.success("Review saved");
      client.invalidateQueries({ queryKey: ["pending-writeups"] });
      client.invalidateQueries({ queryKey: ["pending-resources"] });
    },
    onError: () =>
      toast.error("The review could not be saved. Please try again."),
  });
  const query = tab === "writeups" ? writeups : resources;
  const empty =
    tab === "writeups"
      ? !writeups.data?.writeups?.length
      : !resources.data?.length;
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Community moderation</span>
          <h1>Review submissions</h1>
          <p>
            Read each contribution before making it available to the community.
          </p>
        </div>
      </div>
      <div className="tabs-line" role="tablist" aria-label="Review types">
        {(["writeups", "resources"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
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
          title="Reviews couldn't be loaded"
          retry={() => query.refetch()}
        />
      ) : empty ? (
        <PageState
          title="You're all caught up"
          description="New submissions will appear here when they're ready for review."
        />
      ) : tab === "writeups" ? (
        writeups.data?.writeups.map((w) => (
          <article className="review-card" key={w._id}>
            <span className="status-pill pending">Pending review</span>
            <h2>{w.title}</h2>
            <p>
              By {w.userId?.username || "Community member"} ·{" "}
              {w.challengeId?.title || "Challenge"}
            </p>
            <div className="review-content">{w.content}</div>
            <label className="form-label" htmlFor={"notes-" + w._id}>
              Feedback for the author
            </label>
            <textarea
              className="input"
              id={"notes-" + w._id}
              value={notes[w._id] || ""}
              onChange={(e) => setNotes({ ...notes, [w._id]: e.target.value })}
              placeholder="Explain any changes needed before approval."
              rows={2}
            />
            <div className="form-actions">
              <button
                className="btn-primary"
                disabled={review.isPending}
                onClick={() =>
                  review.mutate({ id: w._id, action: "approve-writeup" })
                }
              >
                <Check size={16} />
                Approve
              </button>
              <button
                className="btn-outline"
                disabled={review.isPending || !notes[w._id]?.trim()}
                onClick={() =>
                  review.mutate({ id: w._id, action: "reject-writeup" })
                }
              >
                <X size={16} />
                Reject with feedback
              </button>
            </div>
          </article>
        ))
      ) : (
        resources.data?.map((r) => (
          <article className="review-card" key={r._id}>
            <span className="status-pill pending">Pending review</span>
            <h2>{r.title}</h2>
            <p>
              By {r.createdBy?.username || "Community member"} · {r.category}
            </p>
            <div className="review-content">{r.description}</div>
            <div className="form-actions">
              {/^https?:\/\//i.test(r.githubLink) && (
                <a
                  className="btn-outline"
                  href={r.githubLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open resource <ExternalLink size={15} />
                </a>
              )}
              <button
                className="btn-primary"
                disabled={review.isPending}
                onClick={() =>
                  review.mutate({ id: r._id, action: "approve-resource" })
                }
              >
                <Check size={16} />
                Approve resource
              </button>
            </div>
          </article>
        ))
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
          <span>Page {page}</span>
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
