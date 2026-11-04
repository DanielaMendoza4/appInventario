import Card from './Card';
import './StatCard.css';

export default function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  staggerIndex = 0,
}) {
  return (
    <Card
      interactive
      staggerIndex={staggerIndex}
      className={`ui-stat ui-stat--${tone}`}
    >
      <div className="ui-stat__top">
        <span className="ui-stat__label">{label}</span>
        {icon && (
          <span className="ui-stat__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <span className="ui-stat__value">{value}</span>

      {hint && <span className="ui-stat__hint">{hint}</span>}
    </Card>
  );
}
