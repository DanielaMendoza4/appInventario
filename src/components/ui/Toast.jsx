import { useSyncExternalStore } from 'react';
import {
  subscribeToasts,
  getToastsSnapshot,
  dismissToast,
} from '../../lib/toast';
import { IconCheck, IconAlert, IconInfo, IconCross } from '../Icons/Icons';
import './Toast.css';

const TOAST_ICONS = {
  success: IconCheck,
  error: IconAlert,
  info: IconInfo,
};

export default function Toast() {
  const toasts = useSyncExternalStore(subscribeToasts, getToastsSnapshot);

  return (
    <div
      className="toast-viewport"
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {toasts.map((item) => {
        const Icon = TOAST_ICONS[item.variant] || IconInfo;

        return (
          <div
            key={item.id}
            className={`toast toast--${item.variant}`}
            role="status"
          >
            <span className="toast__icon" aria-hidden="true">
              <Icon size={18} />
            </span>

            <p className="toast__message">{item.message}</p>

            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(item.id)}
              aria-label="Cerrar notificación"
            >
              <IconCross size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
