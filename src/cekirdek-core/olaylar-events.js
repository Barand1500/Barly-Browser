// ========== OLAYLAR - EVENTS ==========
// Modüller arası iletişim için olay yöneticisi

const listeners = {};

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
}

export function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(f => f !== fn);
}

export function emit(event, ...args) {
  if (!listeners[event]) return;
  listeners[event].forEach(fn => fn(...args));
}
