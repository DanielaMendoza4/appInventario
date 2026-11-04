let toasts = [];
let counter = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToastsSnapshot() {
  return toasts;
}

export function dismissToast(id) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function showToast(message, variant = 'info', duration = 4500) {
  const id = ++counter;
  toasts = [...toasts, { id, message, variant }];
  emit();

  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }

  return id;
}

export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
};
