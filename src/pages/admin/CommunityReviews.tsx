import { useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ExternalLink, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { writeupService } from "../../services/writeup.service";
import { resourceService } from "../../services/resource.service";
import PageState from "../../components/common/PageState";

export default function CommunityReviews() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'resources' ? 'resources' : 'writeups';
  const [scope, setScope] = useState('pending');
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const client = useQueryClient();
  const writeups = useQuery({
    queryKey: ["pending-writeups", page, scope],
    queryFn: () => writeupService.getAdminWriteups(page, 10, scope),
    enabled: tab === "writeups",
    select: (r) => r.data,
  });
  const resources = useQuery({
    queryKey: ["pending-resources", scope],
    queryFn: () => resourceService.getAdminResources(scope === 'rejected' ? 'pending' : scope),
    enabled: tab === "resources",
    select: (r) => r.data,
  });
  const review = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approve-writeup" | "reject-writeup" | "approve-resource" | "delete-writeup" | "delete-resource";
    }) => {
      if (action === 'delete-writeup') return writeupService.deleteWriteup(id);
      if (action === 'delete-resource') return resourceService.deleteResource(id);
      if (action === "approve-resource")
        return resourceService.approveResource(id);
      if (action === "reject-writeup")
        return writeupService.rejectWriteup(id, notes[id]?.trim());
      return writeupService.approveWriteup(id);
    },
    onSuccess: () => {
      toast.success("Review saved");
      for (const queryKey of [["writeups"], ["writeup"], ["challenges"], ["challenge-writeups"]]) void client.invalidateQueries({ queryKey });
      client.invalidateQueries({ queryKey: ["pending-writeups"] });
      client.invalidateQueries({ queryKey: ["pending-resources"] });
      client.invalidateQueries({ queryKey: ['admin-stats'] });
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
            onClick={() => { setParams({ tab: t }); setPage(1); setScope('pending'); }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="admin-toolbar mt-5"><label htmlFor="review-status">Show</label><select className="input" id="review-status" value={scope} onChange={event => { setScope(event.target.value); setPage(1); }}><option value="pending">Pending review</option><option value="approved">Published</option>{tab === 'writeups' && <option value="rejected">Rejected</option>}<option value="all">All contributions</option></select></div>
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
            <span className="status-pill pending">{w.status}</span>
            <h2>{w.title}</h2>
            <p>
              By {w.userId?.username || "Community member"} ·{" "}
              {w.challengeId?.title || "Challenge"}
            </p>
            <div className="review-content whitespace-pre-wrap">{w.content}</div>
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
                disabled={review.isPending || w.status === 'approved'}
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
              <button className="btn-outline text-status-error" disabled={review.isPending} onClick={() => { if (window.confirm(`Permanently delete “${w.title}”?`)) review.mutate({ id: w._id, action: 'delete-writeup' }); }}><Trash2 size={15} />Delete writeup</button>
            </div>
          </article>
        ))
      ) : (
        resources.data?.map((r) => (
          <article className="review-card" key={r._id}>
            <span className="status-pill pending">{r.isApproved ? 'Published' : 'Pending review'}</span>
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
                disabled={review.isPending || r.isApproved}
                onClick={() =>
                  review.mutate({ id: r._id, action: "approve-resource" })
                }
              >
                <Check size={16} />
                Approve resource
              </button>
              <button className="btn-outline text-status-error" disabled={review.isPending} onClick={() => { if (window.confirm(`Permanently remove “${r.title}”?`)) review.mutate({ id: r._id, action: 'delete-resource' }); }}><Trash2 size={15} />Remove resource</button>
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
