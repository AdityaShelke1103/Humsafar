import { useState, useEffect } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { Traveller } from '@/components/Traveller';
import { AppHeader, StampSeal } from '@/components/Brand';
import { RouteBackdrop } from '@/components/RouteBackdrop';
import { TicketFrame } from '@/components/TicketFrame';
import { domicileJourney } from '@/data/journeyData';

interface CompleteScreenProps {
  onRestart: () => void;
}

export function CompleteScreen({ onRestart }: CompleteScreenProps) {
  const journey = domicileJourney;
  const [replayStep, setReplayStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReplayStep((prev) => {
        if (prev >= journey.steps.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 380);
    return () => clearInterval(timer);
  }, [journey.steps.length]);

  return (
    <div className="paper-bg relative flex min-h-screen flex-col overflow-hidden">
      <RouteBackdrop />
      <AppHeader />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-6 sm:px-6">
        <div className="w-full max-w-2xl">
          <TicketFrame className="anim-enter" serial="MH-DOM/2026/0927-V" label="Civic Clearance Visa">
            <div className="relative px-6 py-8 sm:px-8">
              <div className="visa-inner p-5 sm:p-7">
                {/* Official Stamped Seal */}
                <StampSeal
                  stamped
                  title="CLEARED"
                  caption="REVENUE DEPT · ALL 6 STOPS"
                  className="absolute right-4 top-6 h-36 w-36 text-teal-700/60 dark:text-teal-300/50"
                />

                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-teal-800 dark:text-teal-300">
                    Official Clearance Granted
                  </p>
                </div>

                <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink-900 sm:text-6xl dark:text-cream-50">
                  You
                  <br />
                  <span className="font-light text-saffron-500">made it.</span>
                </h1>

                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-600 dark:text-ink-300 sm:text-base">
                  <span className="font-bold text-ink-900 dark:text-cream-50">{journey.title}</span>
                  {' '}— all 6 statutory stops verified and ready for official submission. Keep this itinerary manifest for your Tahsildar appointment.
                </p>

                {/* Bearer Passport Block */}
                <div className="mt-6 grid grid-cols-1 gap-4 border border-dashed border-ink-300 p-4 sm:grid-cols-3 dark:border-ink-600">
                  <div className="flex h-20 w-16 items-center justify-center border-2 border-ink-800 bg-cream-100 sm:h-auto sm:w-auto dark:border-ink-200 dark:bg-ink-800">
                    <Traveller size={44} className="text-saffron-600 dark:text-saffron-400" />
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-300">
                      Bearer & Dossier
                    </p>
                    <p className="font-heading text-sm font-bold text-ink-800 dark:text-cream-50">
                      Civic Traveller · State of Maharashtra
                    </p>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-300">
                      Authority: <span className="font-semibold text-ink-700 dark:text-cream-100">{journey.department}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-300">
                      Jurisdiction: <span className="font-semibold text-ink-700 dark:text-cream-100">Tahsildar / Aaple Sarkar RTS</span>
                    </p>
                  </div>
                </div>

                {/* Stamped Steps Audit List */}
                <div className="mt-6 border-t border-dashed border-ink-300 pt-4 dark:border-ink-600">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
                    Procedural Audit Log
                  </p>
                  <ol className="mt-2 space-y-0">
                    {journey.steps.map((step, idx) => {
                      const isVisible = idx < replayStep;
                      return (
                        <li
                          key={step.id}
                          className={`flex items-center gap-3 border-b border-ink-200 py-2 transition-opacity duration-300 dark:border-ink-700 ${
                            isVisible ? 'opacity-100' : 'opacity-25'
                          }`}
                        >
                          <span className="w-6 font-display text-xs font-bold text-saffron-600 dark:text-saffron-400">
                            0{step.id}
                          </span>
                          <span
                            className={`truncate text-xs sm:text-sm ${
                              isVisible ? 'font-medium text-ink-800 dark:text-cream-50' : 'text-ink-400'
                            }`}
                          >
                            {step.title}
                          </span>
                          {isVisible && (
                            <span className="ml-auto shrink-0 font-heading text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                              ✓ Cleared
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={journey.sources[1].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-stamp flex-1"
                  >
                    Open Aaple Sarkar Portal
                    <ExternalLink size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-ghost flex-1"
                  >
                    Print / Save Itinerary
                  </button>
                  <button onClick={onRestart} className="btn-ghost shrink-0 px-4">
                    <RotateCcw size={16} />
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between border-t border-ink-200 pt-3 text-[10px] uppercase tracking-wider text-ink-400 dark:border-ink-700 dark:text-ink-400">
                  <span>Verified 2 official government sources</span>
                  <span>Aaple Sarkar RTS Act 2015</span>
                </div>
              </div>
            </div>
          </TicketFrame>
        </div>
      </main>
    </div>
  );
}
