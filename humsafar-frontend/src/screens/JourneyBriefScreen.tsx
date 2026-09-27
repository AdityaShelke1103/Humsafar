import { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Traveller } from '@/components/Traveller';
import { Icon } from '@/components/Icon';
import { AppHeader } from '@/components/Brand';
import { RouteBackdrop } from '@/components/RouteBackdrop';
import { TicketFrame } from '@/components/TicketFrame';
import { domicileJourney } from '@/data/journeyData';

interface JourneyBriefScreenProps {
  onStart: () => void;
  onBack: () => void;
}

export function JourneyBriefScreen({ onStart, onBack }: JourneyBriefScreenProps) {
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);

  useEffect(() => {
    if (!showIntelligence) {
      setVisibleStep(0);
      return;
    }
    const timer = setInterval(() => {
      setVisibleStep((prev) => {
        if (prev >= domicileJourney.intelligenceSteps.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 380);
    return () => clearInterval(timer);
  }, [showIntelligence]);

  const journey = domicileJourney;

  return (
    <div className="paper-bg relative min-h-screen overflow-hidden">
      <RouteBackdrop />
      <AppHeader onBack={onBack} />

      <main className="relative z-10 px-6 pb-20 pt-6 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="anim-enter text-[11px] font-bold uppercase tracking-[0.28em] text-ink-400 dark:text-ink-300">
            Itinerary · understood
          </p>

          <TicketFrame className="anim-d1 mt-5" serial="HS–MH–01" label="Your journey">
            <div className="px-6 py-7 sm:px-8">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-800 sm:text-4xl dark:text-cream-50">
                {journey.title}
              </h1>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-500 dark:text-ink-300">
                {journey.description}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-dashed border-ink-300 py-5 sm:grid-cols-4 dark:border-ink-600">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Jurisdiction</dt>
                  <dd className="mt-1 font-heading font-bold text-ink-800 dark:text-cream-50">{journey.state}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Authority</dt>
                  <dd className="mt-1 font-heading text-sm font-bold text-ink-800 dark:text-cream-50">
                    {journey.department}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Est. Timeline</dt>
                  <dd className="mt-1 font-heading text-sm font-bold text-teal-700 dark:text-teal-300">
                    7–15 Business Days
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">Official Fee</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-saffron-500">₹53.60</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-5 dark:border-ink-600">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                    Itinerary Scale
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-700 dark:text-cream-50">
                    {journey.steps.length} sequential stops · {journey.documents.length} mandatory & supporting documents
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                    Verified {journey.sources[0].lastVerified}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIntelligence(!showIntelligence)}
                className="mt-6 flex w-full items-center justify-between border-t border-ink-200 py-3 text-left dark:border-ink-600"
              >
                <span className="font-heading text-sm font-semibold text-ink-700 dark:text-ink-100">
                  How Humsafar found this
                </span>
                <ChevronDown
                  size={18}
                  className={`text-ink-400 transition-transform duration-200 ${showIntelligence ? 'rotate-180' : ''}`}
                />
              </button>

              {showIntelligence && (
                <ol className="mb-4 space-y-3">
                  {journey.intelligenceSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        idx <= visibleStep ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="w-8 font-display text-xs text-saffron-600 dark:text-saffron-400">
                        0{idx + 1}
                      </span>
                      <Icon name={step.icon} size={14} className="text-ink-500 dark:text-ink-300" />
                      <span className="text-sm text-ink-700 dark:text-ink-100">{step.label}</span>
                    </li>
                  ))}
                </ol>
              )}

              <button onClick={onStart} className="btn-stamp mt-2 w-full">
                Start journey
                <ArrowRight size={18} />
              </button>
            </div>
          </TicketFrame>

          <div className="anim-d3 mt-8 flex items-center gap-3">
            <Traveller size={40} />
            <p className="text-sm text-ink-400 dark:text-ink-300">Ready when you are</p>
          </div>
        </div>
      </main>
    </div>
  );
}
