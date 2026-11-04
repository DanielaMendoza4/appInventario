import './ProgressBar.css';

export default function ProgressBar({ value = 0, color, label, delay = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      className="ui-progress"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="ui-progress__track">
        <span
          className="ui-progress__fill"
          style={{
            width: `${clamped}%`,
            backgroundColor: color,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}
