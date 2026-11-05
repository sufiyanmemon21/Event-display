import { useSyncExternalStore } from "react";

const mobileQuery = "(max-width: 767px)";

function subscribe(callback) {
  const media = window.matchMedia(mobileQuery);

  media.addEventListener("change", callback);

  return () => {
    media.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return window.matchMedia(mobileQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
}