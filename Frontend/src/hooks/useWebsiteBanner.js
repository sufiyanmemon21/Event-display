import { useSyncExternalStore } from "react";

const key = "eventsphere.websiteBanner";
const changed = "eventsphere-banner-changed";

function snapshot() {
  try {
    return localStorage.getItem(key) || "{}";
  } catch {
    return "{}";
  }
}

function parse(value) {
  try {
    return JSON.parse(value) || {};
  } catch {
    return {};
  }
}

function subscribe(listener) {
  function onStorage(event) {
    if (event.key === key || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changed, listener);
  };
}

export function readWebsiteBanner() {
  return parse(snapshot());
}

export function saveWebsiteBanner(banner) {
  localStorage.setItem(key, JSON.stringify(banner));
  window.dispatchEvent(new Event(changed));
}

export default function useWebsiteBanner() {
  return parse(useSyncExternalStore(subscribe, snapshot, () => "{}"));
}
