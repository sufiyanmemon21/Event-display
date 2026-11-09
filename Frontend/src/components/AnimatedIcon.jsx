import { useSyncExternalStore } from "react";
import { useIconHover } from "@animateicons/react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(update) {
  const media = window.matchMedia(query);
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}

function useAnimatedIcon() {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
  const { ref, triggerProps } = useIconHover();
  return {
    iconProps: {
      ref,
      isAnimated: !reduced,
      duration: 0.55,
      "aria-hidden": true,
    },
    triggerProps: reduced ? {} : triggerProps,
  };
}

export default function AnimatedIcon({ icon: Icon, size = 16, children }) {
  const { iconProps, triggerProps } = useAnimatedIcon();
  return children(<Icon {...iconProps} size={size} />, triggerProps);
}
