import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { writeupService } from "../services/writeup.service";
import PageState from "../components/common/PageState";
import { safeDate } from "../components/common/ProfileOverview";
export default function WriteupDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["writeup", id],
    queryFn: () => writeupService.getWriteupById(id!),
    select: (r) => r.data,
    enabled: !!id,
  });
  return (
    <div className="reading-page">
      <Link
        to="/writeups"
        className="inline-flex gap-2 items-center text-sm text-text-muted"
      >
        <ArrowLeft size={15} />
        Back to writeups
      </Link>
      {isLoading ? (
        <PageState loading />
      ) : isError || !data ? (
        <PageState
          title="This writeup is unavailable"
          description="It may still be under review, or the service may be unavailable."
          retry={() => refetch()}
        />
      ) : (
        <article>
          <span className={"status-pill mt-8 " + data.status}>
            {data.status}
          </span>
          <h1>{data.title}</h1>
          <div className="text-sm text-text-muted">
            {data.userId?.username || "Community member"} ·{" "}
            {safeDate(data.createdAt)} · {data.challengeId?.title}
          </div>
          {data.adminNotes && (
            <div className="notice mt-6">
              <strong>Review feedback</strong>
              <p>{data.adminNotes}</p>
            </div>
          )}
          <div className="writeup-content">{data.content}</div>
          {data.challengeId?._id && (
            <Link
              className="btn-outline"
              to={"/challenges/" + data.challengeId._id}
            >
              View challenge
            </Link>
          )}
        </article>
      )}
    </div>
  );
}
