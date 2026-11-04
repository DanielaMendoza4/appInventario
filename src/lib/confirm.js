let currentRequest = null;
let resolveCurrent = null;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeConfirm(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getConfirmSnapshot() {
  return currentRequest;
}

export function requestConfirm(options) {
  if (resolveCurrent) {
    resolveCurrent(false);
  }

  return new Promise((resolve) => {
    resolveCurrent = resolve;
    currentRequest = {
      title: 'Confirmar acción',
      message: '',
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      tone: 'default',
      ...options,
    };
    emit();
  });
}

export function resolveConfirm(value) {
  const resolve = resolveCurrent;
  resolveCurrent = null;
  currentRequest = null;
  emit();
  if (resolve) resolve(value);
}
