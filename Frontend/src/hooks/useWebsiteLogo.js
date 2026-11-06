import { useSyncExternalStore } from 'react';

const key = 'eventsphere.websiteLogo';
const changed = 'eventsphere-logo-changed';

function readLogo() {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function subscribe(listener) {
  function onStorage(event) {
    if (event.key === key || event.key === null) listener();
  }

  window.addEventListener('storage', onStorage);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(changed, listener);
  };
}

export function saveWebsiteLogo(value) {
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
  window.dispatchEvent(new Event(changed));
}

export default function useWebsiteLogo() {
  return useSyncExternalStore(subscribe, readLogo, () => '');
}
