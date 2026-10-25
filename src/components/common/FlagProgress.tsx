export default function FlagProgress({ completed, total }: { completed: number; total: number }) {
  const solved = Math.max(0, Math.min(total, completed));
  return (
    <div className="progress-item flag-progress">
      <div>
        <span>Flag progress</span>
        <span className="muted">{solved} / {total} flags solved</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Flags solved"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={solved}
        aria-valuetext={`${solved} of ${total} flags solved`}
      >
        <div style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
