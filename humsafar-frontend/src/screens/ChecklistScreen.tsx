import { useState } from 'react';
import { ArrowRight, Check, Info, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/components/Brand';
import { RouteBackdrop } from '@/components/RouteBackdrop';
import { domicileJourney } from '@/data/journeyData';
import type { Document } from '@/data/journeyData';

interface ChecklistScreenProps {
  onStart: () => void;
  onBack: () => void;
  checkedDocs: Record<string, boolean>;
  setCheckedDocs: (checked: Record<string, boolean>) => void;
}

export function ChecklistScreen({
  onStart,
  onBack,
  checkedDocs,
  setCheckedDocs,
}: ChecklistScreenProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const journey = domicileJourney;
  const checkedCount = journey.documents.filter((d) => checkedDocs[d.id]).length;
  const totalCount = journey.documents.length;
  const mandatoryDocs = journey.documents.filter((d) => !d.optional);
  const mandatoryChecked = mandatoryDocs.filter((d) => checkedDocs[d.id]).length;
  const allMandatoryReady = mandatoryChecked === mandatoryDocs.length;
  const progressPct = Math.round((checkedCount / totalCount) * 100);

  const toggleDoc = (id: string) => {
    setCheckedDocs({ ...checkedDocs, [id]: !checkedDocs[id] });
  };

  return (
    <div className="paper-bg relative min-h-screen overflow-hidden">
      <RouteBackdrop />
      <AppHeader onBack={onBack} />

      <main className="relative z-10 px-6 pb-20 pt-6 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="anim-enter flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink-400 dark:text-ink-300">
                Packing list
              </p>
              <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink-800 sm:text-5xl dark:text-cream-50">
                Pack before
                <br />
                <span className="font-light text-saffron-500">you go</span>
              </h1>
              <p className="mt-4 max-w-md text-ink-500 dark:text-ink-300">
                Gather these for{' '}
                <span className="font-semibold text-ink-700 dark:text-cream-50">{journey.title}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-5xl font-extrabold tracking-tighter text-saffron-500">{progressPct}%</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {checkedCount}/{totalCount} packed
              </p>
            </div>
          </div>

          <div className="anim-d1 mt-6">
            <div className="h-[3px] bg-ink-200 dark:bg-ink-700">
              <div
                className="h-full bg-ink-800 transition-all duration-300 dark:bg-saffron-400"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {!allMandatoryReady && (
              <p className="mt-3 flex items-center gap-2 text-sm text-saffron-700 dark:text-saffron-400">
                <AlertTriangle size={14} />
                {mandatoryDocs.length - mandatoryChecked} mandatory document(s) still needed
              </p>
            )}
            {allMandatoryReady && (
              <p className="mt-3 flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300">
                <ShieldCheck size={14} />
                All mandatory documents ready
              </p>
            )}
          </div>

          <div className="anim-d2 mt-8 border-t-2 border-ink-800 dark:border-ink-200">
            {journey.documents.map((doc, idx) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                checked={!!checkedDocs[doc.id]}
                expanded={expandedDoc === doc.id}
                onToggle={() => toggleDoc(doc.id)}
                onExpand={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                delay={idx * 0.04}
              />
            ))}
          </div>

          <button
            onClick={onStart}
            disabled={!allMandatoryReady}
            className="btn-stamp mt-8 w-full"
          >
            {allMandatoryReady ? (
              <>
                I&apos;m ready — start the journey
                <ArrowRight size={18} />
              </>
            ) : (
              'Gather all mandatory documents first'
            )}
          </button>

          {allMandatoryReady && (
            <p className="mt-3 text-center text-sm text-ink-400 dark:text-ink-300">
              Optional documents can be gathered during the journey
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function DocumentItem({
  doc,
  checked,
  expanded,
  onToggle,
  onExpand,
  delay,
}: {
  doc: Document;
  checked: boolean;
  expanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  delay: number;
}) {
  return (
    <div
      className="anim-enter border-b border-ink-200 opacity-0 dark:border-ink-600"
      style={{ animationDelay: `${delay + 0.12}s` }}
    >
      <div className="flex items-start gap-4 py-4">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-colors duration-150 ${
            checked
              ? 'border-teal-700 bg-teal-600 text-white dark:border-teal-300 dark:bg-teal-500'
              : 'border-ink-400 bg-transparent text-transparent hover:border-saffron-500'
          }`}
        >
          {checked && <Check size={14} strokeWidth={3} />}
        </button>

        <button onClick={onExpand} className="min-w-0 flex-1 text-left">
          <div className="flex items-baseline gap-2">
            <h3
              className={`font-heading font-semibold ${
                checked
                  ? 'text-ink-400 line-through dark:text-ink-400'
                  : 'text-ink-800 dark:text-cream-50'
              }`}
            >
              {doc.name}
            </h3>
            {doc.optional && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                Optional
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-400 dark:text-ink-300">{doc.description}</p>
        </button>

        <button
          onClick={onExpand}
          className="shrink-0 p-1 text-ink-300 hover:text-saffron-500"
          title="Why do I need this?"
        >
          <Info size={16} strokeWidth={1.75} />
        </button>
      </div>

      {expanded && (
        <div className="anim-enter pb-4 pl-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
            Why do I need this?
          </p>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-200">
            Required for <span className="font-semibold">Step {doc.requiredForStep}</span>.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-300">
            <ShieldCheck size={12} className="text-teal-700 dark:text-teal-300" />
            <span className="font-semibold text-ink-700 dark:text-ink-100">{doc.source.name}</span>
            <a
              href={doc.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-300"
            >
              {doc.source.domain}
              <ExternalLink size={10} />
            </a>
            <span className="ml-auto">{doc.source.lastVerified}</span>
          </div>
        </div>
      )}
    </div>
  );
}
