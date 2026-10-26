import { AlertCircle } from "lucide-react";
import CyberLoader from './CyberLoader';

export default function PageState({
  loading,
  title,
  description,
  retry,
  fullPage,
}: {
  loading?: boolean;
  title?: string;
  description?: string;
  retry?: () => void;
  fullPage?: boolean;
}) {
  if (loading) return <CyberLoader title={title} description={description} fullPage={fullPage} />;
  return (
    <div className="page-state">
      <AlertCircle size={28} />
      <h2>
        {title || 'Nothing here yet'}
      </h2>
      <p>
        {description ||
          (retry
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
