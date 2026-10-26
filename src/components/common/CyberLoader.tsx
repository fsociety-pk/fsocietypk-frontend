import '../../styles/system-states.css';

export default function CyberLoader({ fullPage = false, title = 'Loading page', description = 'Please wait a moment.' }: { fullPage?: boolean; title?: string; description?: string }) {
  return <div className={`cyber-loading ${fullPage ? 'cyber-loading-page' : ''}`} role="status" aria-live="polite" aria-busy="true">
    <svg className="loading-orbit" viewBox="0 0 64 64" aria-hidden="true"><circle className="loading-orbit-track" cx="32" cy="32" r="27" /><circle className="loading-orbit-head" cx="32" cy="32" r="27" strokeDasharray="55 115" /><circle className="loading-orbit-center" cx="32" cy="32" r="3" /></svg>
    <h2>{title}</h2><p>{description}</p>
  </div>;
}
