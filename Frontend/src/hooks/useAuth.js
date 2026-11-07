import { useSyncExternalStore } from 'react';
function subscribe(callback) {
  window.addEventListener('auth-changed', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('auth-changed', callback);
    window.removeEventListener('storage', callback);
  };
}
function snapshot() {
  return localStorage.getItem('token') ? localStorage.getItem('user') : null;
}
export default function useAuth() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  try {
    return JSON.parse(raw) || null;
  } catch {
    return null;
  }
}
