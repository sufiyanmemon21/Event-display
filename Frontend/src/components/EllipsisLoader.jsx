import { useEffect, useRef } from "react";
import { EllipsisIcon } from "@animateicons/react/lucide";

const sizes = {
  viewport: { icon: 48, className: "grid min-h-dvh w-full place-items-center" },
  page: { icon: 48, className: "grid min-h-48 flex-1 place-items-center" },
  section: { icon: 36, className: "grid min-h-32 w-full place-items-center" },
  inline: {
    icon: 24,
    className: "inline-grid shrink-0 place-items-center align-middle",
  },
};

export default function EllipsisLoader({
  label = "Loading",
  scope = "section",
}) {
  const icon = useRef(null);
  const timer = useRef(null);
  const size = sizes[scope];

  useEffect(() => {
    const animation = icon.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      window.clearInterval(timer.current);
      if (motion.matches) {
        animation?.stopAnimation();
        return;
      }
      void animation?.startAnimation();
      timer.current = window.setInterval(
        () => void animation?.startAnimation(),
        1200,
      );
    }

    update();
    motion.addEventListener("change", update);
    return () => {
      window.clearInterval(timer.current);
      motion.removeEventListener("change", update);
      animation?.stopAnimation();
    };
  }, []);

  return (
    <span
      role="status"
      data-loading-scope={scope}
      className={`${size.className} text-[#87584d] dark:text-[#dfb77d]`}
    >
      <span className="sr-only">{label}</span>
      <EllipsisIcon
        ref={icon}
        aria-hidden="true"
        size={size.icon}
        className={scope === "inline" ? "[&_svg]:size-6!" : undefined}
      />
    </span>
  );
}
