import useLiveRefresh from "./useLiveRefresh";
import { useEffect, useState } from "react";
import api from "@/api/api";

export function isExpo({ listingType, category, title }) {
  if (listingType === "expo" || listingType === "event")
    return listingType === "expo";

  const label = `${category ?? ""} ${title ?? ""}`;
  if (
    /\b(?:expos?|expositions?|exhibitions?|trade[\s-]+(?:shows?|fairs?))\b/i.test(
      label,
    )
  )
    return true;

  // Older records were created through the Expos workspace with no type field.
  return !/\b(?:birthdays?|weddings?|bridal|engagements?|concerts?|music|gigs?|part(?:y|ies)|showers?|festivals?|picnics?|celebrations?|receptions?)\b/i.test(
    label,
  );
}
export default function useExpos() {
  const [state, setState] = useState({
    loading: true,
    items: [],
    error: "",
    fetchedAt: null,
  });
  const [revision, setRevision] = useState(0);
  useLiveRefresh(() => setRevision((previous) => previous + 1));
  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/events/all", { signal: controller.signal })
      .then((response) => {
        setState({
          loading: false,
          items: (response.data.events || []).map((item) => ({
            ...item,
            theme: item.category,
          })),
          error: "",
          fetchedAt: Date.now(),
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          loading: false,
          items: [],
          fetchedAt: null,
          error:
            error.response?.data?.msg ||
            "Expos are temporarily unavailable. Please try again shortly.",
        });
      });
    return () => controller.abort();
  }, [revision]);
  return {
    ...state,
    retry: () => {
      setState((previous) => ({ ...previous, loading: true, error: "" }));
      setRevision((previous) => previous + 1);
    },
  };
}
