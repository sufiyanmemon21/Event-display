import { useEffect } from 'react';
import API from '@/api/api';
export default function LiveUpdates() {
  useEffect(() => {
    const url = new URL('updates', API.defaults.baseURL.replace(/\/$/, '') + '/');
    const source = new EventSource(url.href);
    const refresh = () => window.dispatchEvent(new Event('eventsphere-update'));
    source.addEventListener('changed', refresh);
    source.addEventListener('connected', refresh);
    const timer = window.setInterval(() => {
      if (source.readyState !== EventSource.OPEN && document.visibilityState === 'visible') refresh();
    }, 30000);
    window.addEventListener('online', refresh);
    return () => {
      source.close();
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return null;
}
