import useLiveRefresh from './useLiveRefresh';
import { useEffect, useState } from 'react';
import api from '@/api/api';

export function isExpo({ category, title }) {
  return /\b(?:expos?|expositions?|exhibitions?|trade[\s-]+(?:shows?|fairs?))\b/i.test(`${category ?? ''} ${title ?? ''}`);
}
export default function useExpos() {
  const [state, setState] = useState({ loading: true, items: [], error: '', fetchedAt: null });
  const [revision, setRevision] = useState(0);
  useLiveRefresh(() => setRevision(previous => previous + 1));
  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/events/all', { signal: controller.signal })
      .then((response) => {
        setState({ loading: false, items: (response.data.events || []).map(item => ({ ...item, theme: item.category })), error: '', fetchedAt: Date.now() });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          loading: false,
          items: [],
          fetchedAt: null,
          error:
            error.response?.data?.msg ||
            'Expos are temporarily unavailable. Please try again shortly.',
        });
      });
    return () => controller.abort();
  }, [revision]);
  return {
    ...state,
    retry: () => {
      setState((previous) => ({ ...previous, loading: true, error: '' }));
      setRevision((previous) => previous + 1);
    },
  };
}
