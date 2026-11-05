import { useEffect, useEffectEvent } from 'react';
export default function useLiveRefresh(refresh) {
  const onRefresh = useEffectEvent(refresh);
  useEffect(() => {
    const listener = () => onRefresh();
    window.addEventListener('eventsphere-update', listener);
    return () => window.removeEventListener('eventsphere-update', listener);
  }, []);
}
