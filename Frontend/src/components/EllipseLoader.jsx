export default function EllipseLoader({ label = "Loading", inline = false }) {
  return <span role="status" className={inline ? "inline-flex shrink-0 items-center" : "flex min-h-32 items-center justify-center"}>
    <span className="sr-only">{label}</span>
    <svg aria-hidden="true" viewBox="0 0 44 32" className={inline ? "h-4 w-5" : "h-8 w-11"} fill="none">
      <ellipse cx="22" cy="16" rx="19" ry="10" stroke="#bd9561" strokeWidth="2.5" opacity=".35" />
      <ellipse cx="22" cy="16" rx="19" ry="10" pathLength="100" stroke="#a6753c" strokeWidth="3" strokeLinecap="round" strokeDasharray="24 76" className="motion-safe:animate-[ellipse-orbit_1.2s_linear_infinite]" />
    </svg>
  </span>;
}
