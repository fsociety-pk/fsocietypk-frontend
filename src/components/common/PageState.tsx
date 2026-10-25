import { AlertCircle, Loader2 } from "lucide-react";

export default function PageState({
  loading,
  title,
  description,
  retry,
}: {
  loading?: boolean;
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  return (
    <div className="page-state" role={loading ? "status" : undefined}>
      {loading ? (
        <Loader2 className="animate-spin" size={28} />
      ) : (
        <AlertCircle size={28} />
      )}
      <h2>
        {title || (loading ? "Getting things ready" : "Nothing here yet")}
      </h2>
      <p>
        {description ||
          (loading
            ? "Your workspace will be ready in a moment."
            : retry
              ? "Please check your connection and try again."
              : "Your activity will appear here.")}
      </p>
      {retry && (
        <button className="btn btn-outline" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
