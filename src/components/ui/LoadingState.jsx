import './LoadingState.css';

export default function LoadingState({ message = 'Cargando…' }) {
  return (
    <div className="ui-loading" role="status" aria-live="polite">
      <span className="ui-loading__spinner" aria-hidden="true" />
      <span className="ui-loading__message">{message}</span>
    </div>
  );
}
