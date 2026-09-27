interface TravellerProps {
  className?: string;
  size?: number;
}

export function Traveller({ className = '', size = 48 }: TravellerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`text-ink-800 dark:text-cream-100 ${className}`}
      aria-hidden
    >
      <circle cx="32" cy="14" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M32 22 V38 M32 28 L18 24 M32 28 L48 22 M32 38 L22 56 M32 38 L44 56"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M44 22 C50 20, 54 26, 50 32"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="50" cy="33" r="2.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
