export function RouteBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-ink-800/[0.12] dark:text-cream-100/[0.12]"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path
        className="anim-route"
        d="M -20 120 C 180 80, 280 240, 460 200 S 720 80, 860 220 S 1100 480, 1220 360"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M 80 620 C 260 540, 400 700, 620 580 S 940 420, 1240 540"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 9"
        opacity="0.7"
      />
      <circle cx="460" cy="200" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="860" cy="220" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="620" cy="580" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
