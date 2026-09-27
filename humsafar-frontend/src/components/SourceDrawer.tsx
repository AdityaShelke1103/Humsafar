import { ShieldCheck, AlertCircle, Circle, ExternalLink, X } from 'lucide-react';
import type { SourceLink, VerificationStatus } from '@/data/journeyData';

const statusConfig: Record<
  VerificationStatus,
  { label: string; icon: typeof ShieldCheck; classes: string }
> = {
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    classes:
      'border border-teal-700 text-teal-800 dark:border-teal-400 dark:text-teal-300',
  },
  needs_confirmation: {
    label: 'Needs confirmation',
    icon: AlertCircle,
    classes:
      'border border-saffron-600 text-saffron-800 dark:border-saffron-400 dark:text-saffron-300',
  },
  not_available: {
    label: 'Not available',
    icon: Circle,
    classes: 'border border-ink-300 text-ink-400 dark:border-ink-500 dark:text-ink-300',
  },
};

export function VerificationBadge({
  status,
  className = '',
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider ${cfg.classes} ${className}`}
    >
      <StatusIcon size={11} strokeWidth={2} />
      {cfg.label}
    </span>
  );
}

export function SourceDrawer({
  source,
  allSources,
  onClose,
}: {
  source: SourceLink;
  allSources: SourceLink[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l-2 border-ink-800 bg-cream-50 dark:border-ink-600 dark:bg-ink-900">
        <div className="flex items-start justify-between border-b-2 border-ink-800 px-6 py-4 dark:border-ink-600">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
              Provenance
            </p>
            <h2 className="font-display text-xl font-bold text-ink-800 dark:text-cream-50">
              Where this came from
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-ink-800 p-1.5 text-ink-600 hover:bg-cream-100 dark:border-ink-200 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="custom-scroll flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-300">
              Source for this fact
            </h3>
            <div className="border-2 border-ink-800 p-4 dark:border-ink-200">
              <p className="font-heading font-bold text-ink-800 dark:text-cream-50">{source.name}</p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-teal-700 hover:underline dark:text-teal-300"
              >
                {source.domain}
                <ExternalLink size={12} />
              </a>
              <p className="mt-3 border-t border-dashed border-ink-300 pt-2 text-xs text-ink-400 dark:border-ink-500 dark:text-ink-300">
                Last verified {source.lastVerified}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-300">
              All sources on this route
            </h3>
            <div className="divide-y divide-ink-200 border-y border-ink-200 dark:divide-ink-600 dark:border-ink-600">
              {allSources.map((s) => (
                <div key={s.id} className="flex items-start gap-3 py-3">
                  <ShieldCheck className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-300" size={16} strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-ink-700 dark:text-ink-100">
                      {s.name}
                    </p>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-cream-50"
                    >
                      {s.domain}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-ink-400">
                    {s.lastVerified}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-300">
              How Humsafar verifies
            </h3>
            <ol className="ruled-paper space-y-2 py-2 text-sm text-ink-600 dark:text-ink-200">
              {[
                'Search official government portals',
                'Cross-check facts across sources',
                'Flag conflicting information',
                'Link every fact to its source',
              ].map((line, i) => (
                <li key={line} className="flex gap-3">
                  <span className="font-display text-xs text-saffron-600 dark:text-saffron-400">
                    0{i + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
