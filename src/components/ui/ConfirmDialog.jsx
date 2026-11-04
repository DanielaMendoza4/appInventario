import { useEffect, useRef, useSyncExternalStore } from 'react';
import {
  subscribeConfirm,
  getConfirmSnapshot,
  resolveConfirm,
} from '../../lib/confirm';
import { IconAlert } from '../Icons/Icons';
import './ConfirmDialog.css';

function ConfirmDialogContent({ request }) {
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resolveConfirm(false);
        return;
      }

      if (e.key === 'Tab') {
        const first = cancelRef.current;
        const last = confirmRef.current;
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  const {
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone = 'default',
  } = request;

  return (
    <div
      className="confirm-overlay"
      role="presentation"
      onClick={() => resolveConfirm(false)}
    >
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`confirm-dialog__icon ${
            tone === 'danger' ? 'confirm-dialog__icon--danger' : ''
          }`}
          aria-hidden="true"
        >
          <IconAlert size={22} />
        </div>

        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>

        <p id="confirm-dialog-message" className="confirm-dialog__message">
          {message}
        </p>

        <div className="confirm-dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-secondary"
            onClick={() => resolveConfirm(false)}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`btn confirm-dialog__confirm ${
              tone === 'danger'
                ? 'confirm-dialog__confirm--danger'
                : 'btn-primary'
            }`}
            onClick={() => resolveConfirm(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmDialog() {
  const request = useSyncExternalStore(
    subscribeConfirm,
    getConfirmSnapshot
  );

  if (!request) return null;

  return <ConfirmDialogContent request={request} />;
}
