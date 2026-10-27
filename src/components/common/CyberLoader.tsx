import { useId } from 'react';
import '../../styles/system-states.css';

interface CyberLoaderProps {
  fullPage?: boolean;
  compact?: boolean;
  title?: string;
  description?: string;
}

export default function CyberLoader({
  fullPage = false,
  compact = false,
  title = 'Loading your workspace',
  description = 'Everything will be ready in a moment.',
}: CyberLoaderProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      className={`cyber-loading${fullPage ? ' cyber-loading-page' : ''}${compact ? ' cyber-loading-compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="loading-content">
        <span className="loading-brand" aria-hidden="true">Fsociety<span>PK</span></span>
        <div className="loading-symbol" aria-hidden="true">
          <div className="loading-matrix">
            {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
          </div>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="loading-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
