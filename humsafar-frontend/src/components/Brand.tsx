import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme';

function CompassMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className="text-saffron-400">
      <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 4.5 V6.5 M11 15.5 V17.5 M4.5 11 H6.5 M15.5 11 H17.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 7.2 L12.6 11 L11 14.8 L9.4 11 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center border-2 border-ink-800 bg-ink-800 dark:border-saffron-400">
        <CompassMark />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-bold leading-none text-ink-800 dark:text-cream-50">
            Humsafar
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
            Field guide
          </p>
        </div>
      )}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center border-2 border-ink-800 text-ink-700 transition-transform duration-150 hover:bg-cream-100 active:translate-x-px active:translate-y-px dark:border-ink-200 dark:text-cream-100 dark:hover:bg-ink-800"
    >
      {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
    </button>
  );
}

export function AppHeader({ onBack }: { onBack?: () => void }) {
  return (
    <header className="relative z-20 px-6 pt-5 sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-ink-800/30 pb-4 dark:border-ink-200/30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 font-heading text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-cream-50"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
              Back
            </button>
          )}
          <BrandMark />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function StampSeal({
  className = '',
  caption = 'OFFICIAL SOURCES',
  title = 'HUMSAFAR',
  stamped = false,
}: {
  className?: string;
  caption?: string;
  title?: string;
  stamped?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={`pointer-events-none text-ink-800/20 dark:text-saffron-300/35 ${stamped ? 'anim-stamp' : ''} ${className}`}
      aria-hidden
    >
      <circle cx="70" cy="70" r="62" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="70" cy="70" r="54" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" />
      <text
        x="70"
        y="66"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Sora, sans-serif"
        fontSize="11"
        fontWeight="700"
        letterSpacing="2"
      >
        {title}
      </text>
      <text
        x="70"
        y="82"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Inter, sans-serif"
        fontSize="7"
        letterSpacing="1.5"
      >
        {caption}
      </text>
    </svg>
  );
}
