import { IconEmpty } from '../Icons/Icons';
import './EmptyState.css';

export default function EmptyState({
  icon,
  title = 'Nada por aquí',
  message,
  action,
  compact = false,
}) {
  return (
    <div
      className={`ui-empty ${compact ? 'ui-empty--compact' : ''}`}
      role="status"
    >
      <div className="ui-empty__icon" aria-hidden="true">
        {icon || <IconEmpty size={32} />}
      </div>

      <p className="ui-empty__title">{title}</p>

      {message && <p className="ui-empty__message">{message}</p>}

      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
