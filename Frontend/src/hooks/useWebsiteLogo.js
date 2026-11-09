import { useSyncExternalStore } from "react";
import API from "@/api/api";
let state = { url: "", filename: "", loading: true, error: "" };
let generation = 0;
let pending;
let timer;
const listeners = new Set();
const emit = value => {
  state = { ...state, ...value };
  listeners.forEach(listener => listener());
};
const apply = data => emit({
  url: data.hasLogo ? API.getUri({ url: "/website-settings/logo/image", params: { v: data.version } }) : "",
  filename: data.filename, loading: false, error: "",
});
export function refreshWebsiteLogo() {
  if (pending) return pending;
  const revision = generation;
  pending = API.get("/website-settings/logo").then(({ data }) => {
    if (revision === generation) apply(data);
  }).catch(() => {
    if (revision === generation) emit({ loading: false, error: "Unable to load the saved logo. Please retry." });
  }).finally(() => { pending = null; });
  return pending;
}
export async function saveWebsiteLogo(file) {
  generation++;
  let response;
  if (file) {
    const data = new FormData();
    data.append("logo", file);
    response = await API.put("/website-settings/logo", data, { headers: { "Content-Type": "multipart/form-data" } });
  } else {
    response = await API.delete("/website-settings/logo");
  }
  generation++;
  apply(response.data);
}
function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshWebsiteLogo();
    window.addEventListener("focus", refreshWebsiteLogo);
    window.addEventListener("eventsphere-update", refreshWebsiteLogo);
    timer = window.setInterval(refreshWebsiteLogo, 60000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWebsiteLogo);
      window.removeEventListener("eventsphere-update", refreshWebsiteLogo);
    }
  };
}
export function useWebsiteLogoState() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
export default function useWebsiteLogo() {
  return useWebsiteLogoState().url;
}
