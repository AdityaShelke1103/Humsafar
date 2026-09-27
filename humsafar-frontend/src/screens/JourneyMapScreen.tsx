// import { useRef, useEffect, useState } from 'react';
// import {
//   ArrowRight,
//   Check,
//   MapPin,
//   Lightbulb,
//   MessagesSquare,
//   Building,
//   Globe,
//   X,
//   Send,
//   ShieldCheck,
//   Lock,
//   Construction,
// } from 'lucide-react';
// import { VerificationBadge, SourceDrawer } from '@/components/SourceDrawer';
// import { AppHeader } from '@/components/Brand';
// import { RouteBackdrop } from '@/components/RouteBackdrop';
// import { Traveller } from '@/components/Traveller';
// import { TicketFrame } from '@/components/TicketFrame';
// import { domicileJourney } from '@/data/journeyData';
// import type { JourneyStep, SourceLink } from '@/data/journeyData';

// interface JourneyMapScreenProps {
//   currentStep: number;
//   completedSteps: number[];
//   onAdvanceStep: () => void;
//   onBack: () => void;
//   onComplete: () => void;
// }

// const modeIcon = { online: Globe, office: Building, both: Building };

// export function JourneyMapScreen({
//   currentStep,
//   completedSteps,
//   onAdvanceStep,
//   onBack,
//   onComplete,
// }: JourneyMapScreenProps) {
//   const journey = domicileJourney;
//   const [selectedStep, setSelectedStep] = useState<JourneyStep | null>(null);
//   const [showDoubtPanel, setShowDoubtPanel] = useState(false);
//   const [showSourceDrawer, setShowSourceDrawer] = useState(false);
//   const [sourceDrawerData, setSourceDrawerData] = useState<SourceLink>(journey.sources[0]);
//   const [showWhyThisStep, setShowWhyThisStep] = useState(false);

//   const isStepBlocked = (step: JourneyStep): boolean => {
//     if (!step.dependsOn) return false;
//     return step.dependsOn.some((dep) => !completedSteps.includes(dep));
//   };

//   const handleStepClick = (step: JourneyStep) => {
//     setSelectedStep(step);
//     setShowWhyThisStep(false);
//     setShowDoubtPanel(false);
//   };

//   const handleAdvance = () => {
//     if (currentStep < journey.steps.length) {
//       onAdvanceStep();
//       setSelectedStep(null);
//       setShowDoubtPanel(false);
//     } else {
//       onComplete();
//     }
//   };

//   const openSourceDrawer = (source: SourceLink) => {
//     setSourceDrawerData(source);
//     setShowSourceDrawer(true);
//   };

//   const progressPct = Math.round((completedSteps.length / journey.steps.length) * 100);

//   return (
//     <div className="paper-bg relative min-h-screen overflow-hidden">
//       <RouteBackdrop />

//       <div className="sticky top-0 z-20 border-b-2 border-ink-800 bg-cream-50 dark:border-ink-600 dark:bg-ink-900">
//         <AppHeader onBack={onBack} />
//       </div>

//       <main className="relative z-10 px-4 pb-24 pt-6 sm:px-10">
//         <div className="mx-auto max-w-5xl">
//           <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink-400 dark:text-ink-300">
//                 {journey.state} · {journey.department}
//               </p>
//               <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-800 sm:text-4xl dark:text-cream-50">
//                 {journey.title}
//               </h1>
//             </div>
//             <div className="sm:text-right">
//               <p className="font-display text-3xl font-extrabold tracking-tighter text-saffron-500">{progressPct}%</p>
//               <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
//                 {completedSteps.length} of {journey.steps.length} stops
//               </p>
//               <div className="mt-2 h-[3px] w-40 bg-ink-200 sm:ml-auto dark:bg-ink-700">
//                 <div
//                   className="h-full bg-ink-800 transition-all duration-300 dark:bg-saffron-400"
//                   style={{ width: `${progressPct}%` }}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
//             <div className="relative">
//               <Roadmap
//                 steps={journey.steps}
//                 currentStep={currentStep}
//                 completedSteps={completedSteps}
//                 onStepClick={handleStepClick}
//                 isStepBlocked={isStepBlocked}
//               />
//             </div>

//             <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
//               {/* Manifest Card */}
//               <div className="ticket-mini p-4">
//                 <div className="border-b border-dashed border-ink-200 pb-3 dark:border-ink-700">
//                   <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
//                     Route Manifest
//                   </p>
//                   <p className="mt-1 font-heading text-sm font-bold text-ink-800 dark:text-cream-50">
//                     Maharashtra Domicile
//                   </p>
//                 </div>
//                 <dl className="mt-3 space-y-2 text-xs">
//                   <div className="flex justify-between">
//                     <span className="text-ink-500 dark:text-ink-400">Current Position:</span>
//                     <span className="font-bold text-saffron-600 dark:text-saffron-400">
//                       Stop {currentStep} of {journey.steps.length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-ink-500 dark:text-ink-400">Cleared Stops:</span>
//                     <span className="font-bold text-teal-700 dark:text-teal-300">
//                       {completedSteps.length} of {journey.steps.length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-ink-500 dark:text-ink-400">Total Statutory Fee:</span>
//                     <span className="font-bold text-ink-800 dark:text-cream-50">₹53.60</span>
//                   </div>
//                 </dl>

//                 <button
//                   type="button"
//                   onClick={() => openSourceDrawer(journey.sources[0])}
//                   className="mt-4 flex w-full items-center justify-center gap-1.5 border border-ink-800 py-2 text-center text-xs font-bold text-ink-800 transition-colors hover:bg-cream-200 dark:border-ink-200 dark:text-cream-50 dark:hover:bg-ink-700"
//                 >
//                   <ShieldCheck size={13} className="text-teal-600 dark:text-teal-300" />
//                   Inspect Provenance (2 Sources)
//                 </button>
//               </div>

//               {/* Stops Quick-Jump List */}
//               <div>
//                 <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
//                   Stops Index
//                 </p>
//                 <div className="space-y-2">
//                   {journey.steps.map((step) => {
//                     const isDone = completedSteps.includes(step.id);
//                     const isCurrent = step.id === currentStep;
//                     const isBlocked = isStepBlocked(step);
//                     return (
//                       <button
//                         key={step.id}
//                         type="button"
//                         onClick={() => handleStepClick(step)}
//                         className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-transform duration-150 ${
//                           isCurrent
//                             ? 'ticket-mini scale-[1.02]'
//                             : isDone
//                               ? 'border-2 border-teal-800/40 bg-teal-50/30 hover:border-teal-700 dark:border-teal-500/40 dark:bg-teal-950/20'
//                               : 'border-2 border-transparent hover:border-ink-200 dark:hover:border-ink-600'
//                         }`}
//                       >
//                         <span
//                           className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold ${
//                             isDone
//                               ? 'border-2 border-teal-700 bg-teal-600 text-white dark:border-teal-300 dark:bg-teal-500'
//                               : isCurrent
//                                 ? 'rotate-6 bg-saffron-500 text-ink-900 shadow-sm'
//                                 : isBlocked
//                                   ? 'border border-dashed border-ink-300 text-ink-400'
//                                   : 'border border-ink-400 text-ink-600 dark:border-ink-400 dark:text-ink-300'
//                           }`}
//                         >
//                           {isDone ? <Check size={12} strokeWidth={3} /> : isBlocked ? <Lock size={10} /> : step.id}
//                         </span>
//                         <span
//                           className={`truncate text-xs ${
//                             isCurrent
//                               ? 'font-heading font-bold text-ink-900 dark:text-cream-50'
//                               : isDone
//                                 ? 'text-ink-600 line-through dark:text-ink-300'
//                                 : 'text-ink-600 dark:text-ink-300'
//                           }`}
//                         >
//                           {step.shortTitle}
//                         </span>
//                         {isCurrent && (
//                           <span className="ml-auto shrink-0 text-[9px] font-extrabold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
//                             Here
//                           </span>
//                         )}
//                         {isDone && (
//                           <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
//                             Stamped
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </aside>
//           </div>
//         </div>
//       </main>

//       {selectedStep && (
//         <StepDetailModal
//           step={selectedStep}
//           isCurrent={selectedStep.id === currentStep}
//           isDone={completedSteps.includes(selectedStep.id)}
//           isBlocked={isStepBlocked(selectedStep)}
//           blockedBySteps={
//             selectedStep.dependsOn
//               ?.filter((dep) => !completedSteps.includes(dep))
//               .map((dep) => journey.steps.find((s) => s.id === dep))
//               .filter(Boolean) as JourneyStep[]
//           }
//           onClose={() => setSelectedStep(null)}
//           onAdvance={handleAdvance}
//           onShowDoubt={() => setShowDoubtPanel(true)}
//           onShowSource={(src) => openSourceDrawer(src)}
//           showWhyThisStep={showWhyThisStep}
//           setShowWhyThisStep={setShowWhyThisStep}
//           isLastStep={selectedStep.id === journey.steps.length}
//         />
//       )}

//       {showDoubtPanel && selectedStep && (
//         <DoubtAssistant
//           step={selectedStep}
//           onClose={() => setShowDoubtPanel(false)}
//           onShowSource={(src) => openSourceDrawer(src)}
//         />
//       )}

//       {showSourceDrawer && (
//         <SourceDrawer
//           source={sourceDrawerData}
//           allSources={journey.sources}
//           onClose={() => setShowSourceDrawer(false)}
//         />
//       )}
//     </div>
//   );
// }

// interface RoadmapProps {
//   steps: JourneyStep[];
//   currentStep: number;
//   completedSteps: number[];
//   onStepClick: (step: JourneyStep) => void;
//   isStepBlocked: (step: JourneyStep) => boolean;
// }

// function Roadmap({
//   steps,
//   currentStep,
//   completedSteps,
//   onStepClick,
//   isStepBlocked,
// }: RoadmapProps) {
//   return (
//     <div className="relative space-y-6">
//       {steps.map((step, idx) => {
//         const isDone = completedSteps.includes(step.id);
//         const isCurrent = step.id === currentStep;
//         const isBlocked = isStepBlocked(step);
//         const isLast = idx === steps.length - 1;
//         const ModeIcon = modeIcon[step.detail.mode];

//         return (
//           <div
//             key={step.id}
//             className={`relative flex items-start gap-4 sm:gap-6 ${
//               isCurrent ? 'z-10' : 'z-0'
//             }`}
//           >
//             {/* Visual Route Spine Column */}
//             <div className="relative flex flex-col items-center">
//               {/* Node Marker */}
//               <button
//                 type="button"
//                 onClick={() => !isBlocked && onStepClick(step)}
//                 disabled={isBlocked}
//                 aria-label={`Stop ${step.id}: ${step.title}`}
//                 className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-150 ${
//                   isDone
//                     ? 'border-2 border-teal-700 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-ink-800 dark:text-teal-300'
//                     : isCurrent
//                       ? 'rotate-3 border-2 border-ink-800 bg-saffron-500 text-ink-900 shadow-[3px_3px_0_0_var(--stamp-shadow)] hover:scale-105 active:translate-x-0.5 active:translate-y-0.5'
//                       : isBlocked
//                         ? 'cursor-not-allowed border border-dashed border-ink-300 bg-cream-100 text-ink-400 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-500'
//                         : 'border-2 border-ink-400 bg-cream-50 text-ink-700 hover:border-ink-800 dark:border-ink-500 dark:bg-ink-800 dark:text-ink-200'
//                 }`}
//               >
//                 {isDone ? (
//                   <div className="flex flex-col items-center">
//                     <Check size={18} strokeWidth={3} className="-rotate-6" />
//                   </div>
//                 ) : isCurrent ? (
//                   <span className="font-display text-base font-extrabold">{step.id}</span>
//                 ) : isBlocked ? (
//                   <Lock size={15} />
//                 ) : (
//                   <span className="font-display text-sm font-bold">{step.id}</span>
//                 )}

//                 {/* Stamped decorative ring for completed stops */}
//                 {isDone && (
//                   <span
//                     className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-teal-600/60 dark:border-teal-400/50"
//                     aria-hidden
//                   />
//                 )}
//               </button>

//               {/* Traveller positioned at current stop */}
//               {isCurrent && (
//                 <div
//                   className="pointer-events-none absolute -left-12 -top-6 hidden sm:block"
//                   style={{ animation: 'fade-rise 320ms ease-out both' }}
//                 >
//                   <div className="relative animate-float">
//                     <Traveller size={44} className="text-saffron-600 dark:text-saffron-400" />
//                     <span className="absolute -right-2 top-0 flex h-3 w-3">
//                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron-400 opacity-75"></span>
//                       <span className="relative inline-flex h-3 w-3 rounded-full bg-saffron-500"></span>
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Vertical connecting route trail */}
//               {!isLast && (
//                 <div
//                   className={`mt-2 h-24 w-0.5 sm:h-20 ${
//                     isDone
//                       ? 'bg-teal-600 dark:bg-teal-400'
//                       : 'border-l-2 border-dashed border-ink-300 dark:border-ink-600'
//                   }`}
//                   aria-hidden
//                 />
//               )}
//             </div>

//             {/* Stop Ticket Stub Card */}
//             <button
//               type="button"
//               onClick={() => !isBlocked && onStepClick(step)}
//               disabled={isBlocked}
//               className={`ticket-card flex-1 p-5 text-left ${
//                 isCurrent
//                   ? 'is-active'
//                   : isDone
//                     ? 'is-done opacity-95'
//                     : isBlocked
//                       ? 'cursor-not-allowed border-dashed opacity-75'
//                       : 'hover:border-ink-700'
//               }`}
//             >
//               <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-ink-200 pb-3 dark:border-ink-700">
//                 <div className="flex items-center gap-2">
//                   <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
//                     Stop 0{step.id}
//                   </span>
//                   <span className="h-2.5 w-px bg-ink-200 dark:bg-ink-600" />
//                   <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 dark:text-ink-300">
//                     <ModeIcon size={12} strokeWidth={2} />
//                     {step.detail.mode === 'online'
//                       ? 'Online portal'
//                       : step.detail.mode === 'office'
//                         ? 'Government office'
//                         : 'Online & Office'}
//                   </span>
//                 </div>
//                 <span className="font-heading text-xs font-bold text-ink-600 dark:text-ink-300">
//                   ⏱ {step.detail.estimatedTime}
//                 </span>
//               </div>

//               <div className="mt-3">
//                 <h2
//                   className={`font-heading text-lg font-bold sm:text-xl ${
//                     isCurrent
//                       ? 'text-ink-900 dark:text-cream-50'
//                       : isDone
//                         ? 'text-ink-700 dark:text-cream-100'
//                         : isBlocked
//                           ? 'text-ink-400 dark:text-ink-400'
//                           : 'text-ink-800 dark:text-cream-50'
//                   }`}
//                 >
//                   {step.title}
//                 </h2>
//                 <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
//                   {step.description}
//                 </p>
//               </div>

//               <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
//                 {isDone && (
//                   <span className="stamp-badge border-teal-700 bg-teal-50/50 text-teal-800 dark:border-teal-300 dark:bg-teal-950/30 dark:text-teal-300">
//                     <Check size={11} strokeWidth={3} />
//                     Verified & Stamped
//                   </span>
//                 )}
//                 {isCurrent && (
//                   <span className="inline-flex items-center gap-1.5 font-heading text-xs font-bold text-saffron-600 dark:text-saffron-400">
//                     <span className="h-2 w-2 rounded-full bg-saffron-500" />
//                     Here — Tap to view directive & clear stop →
//                   </span>
//                 )}
//                 {isBlocked && (
//                   <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 dark:text-ink-400">
//                     <Lock size={12} />
//                     Complete prior stops to unlock
//                   </span>
//                 )}
//                 {!isDone && !isCurrent && !isBlocked && (
//                   <span className="text-xs font-semibold text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-cream-50">
//                     View stop requirements →
//                   </span>
//                 )}

//                 <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-400">
//                   {step.detail.department}
//                 </span>
//               </div>
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// interface StepDetailModalProps {
//   step: JourneyStep;
//   isCurrent: boolean;
//   isDone: boolean;
//   isBlocked: boolean;
//   blockedBySteps: JourneyStep[];
//   onClose: () => void;
//   onAdvance: () => void;
//   onShowDoubt: () => void;
//   onShowSource: (source: SourceLink) => void;
//   showWhyThisStep: boolean;
//   setShowWhyThisStep: (v: boolean) => void;
//   isLastStep: boolean;
// }

// function StepDetailModal({
//   step,
//   isCurrent,
//   isDone,
//   isBlocked,
//   blockedBySteps,
//   onClose,
//   onAdvance,
//   onShowDoubt,
//   onShowSource,
//   showWhyThisStep,
//   setShowWhyThisStep,
//   isLastStep,
// }: StepDetailModalProps) {
//   const detail = step.detail;
//   const ModeIcon = modeIcon[detail.mode];

//   return (
//     <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-6">
//       <div className="absolute inset-0 bg-ink-900/55" onClick={onClose} />
//       <TicketFrame className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto custom-scroll anim-enter">
//         <div className="sticky top-0 z-10 flex items-start justify-between border-b-2 border-ink-800 bg-cream-50 px-6 py-4 dark:border-ink-200 dark:bg-ink-800">
//           <div className="flex items-center gap-3">
//             <span
//               className={`flex h-10 w-10 items-center justify-center font-display font-bold ${
//                 isDone
//                   ? 'border-2 border-teal-700 text-teal-700 dark:border-teal-300 dark:text-teal-300'
//                   : isCurrent
//                     ? 'rotate-6 bg-saffron-500 text-ink-900'
//                     : 'border-2 border-ink-300 text-ink-400'
//               }`}
//             >
//               {isDone ? <Check size={18} strokeWidth={3} /> : step.id}
//             </span>
//             <div>
//               <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400">
//                 Stop {step.id} of {domicileJourney.steps.length}
//               </p>
//               <h2 className="font-display text-lg font-bold text-ink-800 dark:text-cream-50">{step.title}</h2>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="border-2 border-ink-800 p-1 text-ink-600 dark:border-ink-200 dark:text-ink-200"
//           >
//             <X size={16} />
//           </button>
//         </div>

//         <div className="space-y-6 px-6 py-5">
//           {isBlocked && blockedBySteps.length > 0 && (
//             <div className="border-2 border-dashed border-saffron-500 p-4">
//               <div className="flex items-start gap-3">
//                 <Construction className="mt-0.5 shrink-0 text-saffron-600" size={18} />
//                 <div>
//                   <h3 className="font-heading text-sm font-bold text-ink-800 dark:text-cream-50">
//                     Roadblock ahead
//                   </h3>
//                   <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">Complete these stops first:</p>
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {blockedBySteps.map((bs) => (
//                       <span
//                         key={bs.id}
//                         className="inline-flex items-center gap-1.5 border border-ink-300 px-2 py-1 text-xs font-medium text-ink-600 dark:text-ink-200"
//                       >
//                         <Lock size={11} />
//                         {bs.shortTitle}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div>
//             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">What to do</h3>
//             <p className="mt-2 leading-relaxed text-ink-600 dark:text-ink-200">{detail.whatToDo}</p>
//           </div>

//           <dl className="grid grid-cols-2 gap-4 border-y border-dashed border-ink-300 py-4 dark:border-ink-600">
//             <div>
//               <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
//                 <Building size={12} /> Department
//               </dt>
//               <dd className="mt-1 text-sm font-semibold text-ink-800 dark:text-cream-50">{detail.department}</dd>
//             </div>
//             <div>
//               <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
//                 <MapPin size={12} /> Location
//               </dt>
//               <dd className="mt-1 text-sm font-semibold text-ink-800 dark:text-cream-50">{detail.location}</dd>
//             </div>
//             <div>
//               <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
//                 <ModeIcon size={12} /> Mode
//               </dt>
//               <dd className="mt-1 text-sm font-semibold capitalize text-ink-800 dark:text-cream-50">{detail.mode}</dd>
//             </div>
//             <div>
//               <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Est. time</dt>
//               <dd className="mt-1 text-sm font-semibold text-ink-800 dark:text-cream-50">{detail.estimatedTime}</dd>
//             </div>
//           </dl>

//           {detail.facts.length > 0 && (
//             <div>
//               <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
//                 Key information
//               </h3>
//               <div className="divide-y divide-ink-200 dark:divide-ink-600">
//                 {detail.facts.map((fact, idx) => (
//                   <div key={idx} className="flex items-center justify-between gap-3 py-3">
//                     <div className="min-w-0">
//                       <span className="text-xs text-ink-400">{fact.label}</span>
//                       <p className="font-heading text-sm font-bold text-ink-800 dark:text-cream-50">{fact.value}</p>
//                     </div>
//                     <div className="flex shrink-0 items-center gap-2">
//                       <VerificationBadge status={fact.status} />
//                       <button
//                         onClick={() => onShowSource(detail.source)}
//                         className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
//                       >
//                         Source
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {detail.fee && (
//             <div className="flex items-end justify-between border-2 border-ink-800 px-4 py-4 dark:border-ink-200">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
//                   Application fee
//                 </p>
//                 <p className="font-display text-3xl font-extrabold text-ink-800 dark:text-cream-50">
//                   {detail.fee.amount}
//                 </p>
//               </div>
//               <div className="flex flex-col items-end gap-2">
//                 <VerificationBadge status={detail.fee.status} />
//                 <button
//                   onClick={() => onShowSource(detail.source)}
//                   className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
//                 >
//                   View source →
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="border-t border-ink-200 dark:border-ink-600">
//             <button
//               onClick={() => setShowWhyThisStep(!showWhyThisStep)}
//               className="flex w-full items-center justify-between py-3"
//             >
//               <span className="flex items-center gap-2 font-heading text-sm font-semibold text-ink-700 dark:text-ink-100">
//                 <Lightbulb size={16} className="text-saffron-500" />
//                 Why this step?
//               </span>
//               <span className="text-xs text-ink-400">{showWhyThisStep ? 'Hide' : 'Show'}</span>
//             </button>
//             {showWhyThisStep && (
//               <div className="anim-enter pb-3">
//                 <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-200">{detail.whyThisStep}</p>
//                 <button
//                   onClick={() => onShowSource(detail.source)}
//                   className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-300"
//                 >
//                   <ShieldCheck size={14} />
//                   Source: {detail.source.name}
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="flex flex-col gap-3 pt-1 sm:flex-row">
//             {isCurrent && !isBlocked && (
//               <>
//                 <button onClick={onAdvance} className="btn-stamp flex-1">
//                   {isLastStep ? 'Complete journey' : 'Continue to next stop'}
//                   <ArrowRight size={16} />
//                 </button>
//                 <button onClick={onShowDoubt} className="btn-ghost flex-1">
//                   <MessagesSquare size={16} />
//                   Ask about this step
//                 </button>
//               </>
//             )}
//             {isDone && (
//               <div className="flex flex-1 items-center justify-center gap-2 border-2 border-teal-700 py-3 font-heading font-bold text-teal-800 dark:border-teal-300 dark:text-teal-300">
//                 <Check size={18} strokeWidth={3} />
//                 Stamped complete
//               </div>
//             )}
//             {isBlocked && (
//               <div className="flex flex-1 items-center justify-center gap-2 border-2 border-dashed border-ink-300 py-3 font-heading font-bold text-ink-400">
//                 <Lock size={16} />
//                 Complete previous steps first
//               </div>
//             )}
//           </div>
//         </div>
//       </TicketFrame>
//     </div>
//   );
// }

// interface DoubtAssistantProps {
//   step: JourneyStep;
//   onClose: () => void;
//   onShowSource: (source: SourceLink) => void;
// }

// interface Message {
//   role: 'user' | 'humsafar';
//   text: string;
//   source?: SourceLink;
// }

// export function DoubtAssistant({ step, onClose, onShowSource }: DoubtAssistantProps) {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       role: 'humsafar',
//       text: `I can help with questions about "${step.title}". Ask me anything about this step — I'll answer based on official sources.`,
//     },
//   ]);
//   const [isTyping, setIsTyping] = useState(false);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
//   }, [messages, isTyping]);

//   const findAnswer = (question: string): Message => {
//     const lower = question.toLowerCase();
//     const match = step.detail.commonQuestions.find((q) => {
//       const keywords = q.q.toLowerCase().split(' ').filter((w) => w.length > 3);
//       return keywords.some((kw) => lower.includes(kw));
//     });
//     if (match) {
//       return { role: 'humsafar', text: match.a, source: match.source };
//     }
//     return {
//       role: 'humsafar',
//       text: `I don't have verified information about that specific question for this step. I recommend checking the official source: ${step.detail.source.name} (${step.detail.source.domain}). I can only share information that's been verified from official government sources.`,
//       source: step.detail.source,
//     };
//   };

//   const handleSend = () => {
//     if (!input.trim()) return;
//     const userMsg: Message = { role: 'user', text: input.trim() };
//     setMessages((prev) => [...prev, userMsg]);
//     setInput('');
//     setIsTyping(true);
//     setTimeout(() => {
//       const answer = findAnswer(userMsg.text);
//       setMessages((prev) => [...prev, answer]);
//       setIsTyping(false);
//     }, 380);
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end">
//       <div className="absolute inset-0 bg-ink-900/45" onClick={onClose} />
//       <div className="relative flex h-full w-full max-w-md flex-col border-l-2 border-ink-800 bg-cream-50 dark:border-ink-200 dark:bg-ink-900">
//         <div className="flex items-center justify-between border-b-2 border-ink-800 px-5 py-4 dark:border-ink-200">
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400">Field notes</p>
//             <h2 className="font-display text-sm font-bold text-ink-800 dark:text-cream-50">Ask about this step</h2>
//             <p className="text-xs text-ink-400">{step.shortTitle}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="border-2 border-ink-800 p-1 text-ink-600 dark:border-ink-200 dark:text-ink-200"
//           >
//             <X size={16} />
//           </button>
//         </div>

//         <div ref={scrollRef} className="custom-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
//           {messages.map((msg, idx) => (
//             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//               <div
//                 className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
//                   msg.role === 'user'
//                     ? 'bg-ink-800 text-cream-50 dark:bg-ink-700'
//                     : 'border border-ink-200 text-ink-700 dark:border-ink-600 dark:text-ink-100'
//                 }`}
//               >
//                 <p>{msg.text}</p>
//                 {msg.source && (
//                   <button
//                     onClick={() => onShowSource(msg.source!)}
//                     className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
//                       msg.role === 'user' ? 'text-saffron-300' : 'text-teal-700 dark:text-teal-300'
//                     }`}
//                   >
//                     <ShieldCheck size={12} />
//                     Source: {msg.source.name}
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}

//           {messages.length === 1 && (
//             <div className="space-y-2 pt-2">
//               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">Suggested questions</p>
//               {step.detail.commonQuestions.map((q, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => {
//                     setInput(q.q);
//                     setTimeout(() => {
//                       setMessages((prev) => [...prev, { role: 'user', text: q.q }]);
//                       setInput('');
//                       setIsTyping(true);
//                       setTimeout(() => {
//                         setMessages((prev) => [
//                           ...prev,
//                           { role: 'humsafar', text: q.a, source: q.source },
//                         ]);
//                         setIsTyping(false);
//                       }, 380);
//                     }, 50);
//                   }}
//                   className="block w-full border-b border-dashed border-ink-300 py-2 text-left text-sm text-ink-600 hover:text-saffron-600 dark:border-ink-600 dark:text-ink-200"
//                 >
//                   {q.q}
//                 </button>
//               ))}
//             </div>
//           )}

//           {isTyping && (
//             <div className="flex justify-start">
//               <div className="border border-ink-200 px-4 py-3 dark:border-ink-600">
//                 <div className="flex gap-1">
//                   <span className="h-1.5 w-1.5 bg-ink-400" />
//                   <span className="h-1.5 w-1.5 bg-ink-400" />
//                   <span className="h-1.5 w-1.5 bg-ink-400" />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="border-t-2 border-ink-800 px-4 py-3 dark:border-ink-200">
//           <div className="flex items-center gap-2 border-b-2 border-ink-800 dark:border-ink-200">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="Ask about this step..."
//               className="flex-1 bg-transparent py-2 text-sm text-ink-700 outline-none placeholder:text-ink-300 dark:text-cream-50"
//             />
//             <button
//               onClick={handleSend}
//               disabled={!input.trim()}
//               className="p-2 text-saffron-600 disabled:text-ink-300"
//             >
//               <Send size={16} />
//             </button>
//           </div>
//           <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-ink-400">
//             Answers from official sources only
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

























import { useRef, useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  MapPin,
  Lightbulb,
  MessagesSquare,
  Building,
  Globe,
  X,
  Send,
  ShieldCheck,
  Lock,
  Construction,
} from 'lucide-react';
import { askDoubt } from '@/lib/api';
import { VerificationBadge, SourceDrawer } from '@/components/SourceDrawer';
import { AppHeader } from '@/components/Brand';
import { RouteBackdrop } from '@/components/RouteBackdrop';
import { Traveller } from '@/components/Traveller';
import { TicketFrame } from '@/components/TicketFrame';
import type { Journey, JourneyStep, SourceLink } from '@/data/journeyData';

interface JourneyMapScreenProps {
  journey: Journey;
  currentStep: number;
  completedSteps: number[];
  onAdvanceStep: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const modeIcon = { online: Globe, office: Building, both: Building };

export function JourneyMapScreen({
  journey,
  currentStep,
  completedSteps,
  onAdvanceStep,
  onBack,
  onComplete,
}: JourneyMapScreenProps) {
  const [selectedStep, setSelectedStep] = useState<JourneyStep | null>(null);
  const [showDoubtPanel, setShowDoubtPanel] = useState(false);
  const [showSourceDrawer, setShowSourceDrawer] = useState(false);
  const [sourceDrawerData, setSourceDrawerData] = useState<SourceLink>(journey.sources[0]);
  const [showWhyThisStep, setShowWhyThisStep] = useState(false);

  const isStepBlocked = (step: JourneyStep): boolean => {
    if (!step.dependsOn) return false;
    return step.dependsOn.some((dep) => !completedSteps.includes(dep));
  };

  const handleStepClick = (step: JourneyStep) => {
    setSelectedStep(step);
    setShowWhyThisStep(false);
    setShowDoubtPanel(false);
  };

  const handleAdvance = () => {
    if (currentStep < journey.steps.length) {
      onAdvanceStep();
      setSelectedStep(null);
      setShowDoubtPanel(false);
    } else {
      onComplete();
    }
  };

  const openSourceDrawer = (source: SourceLink) => {
    setSourceDrawerData(source);
    setShowSourceDrawer(true);
  };

  const progressPct =
    journey.steps.length > 0 ? Math.round((completedSteps.length / journey.steps.length) * 100) : 0;

  return (
    <div className="paper-bg relative min-h-screen overflow-hidden">
      <RouteBackdrop />

      <div className="sticky top-0 z-20 border-b-2 border-ink-800 bg-cream-50 dark:border-ink-600 dark:bg-ink-900">
        <AppHeader onBack={onBack} />
      </div>

      <main className="relative z-10 px-4 pb-24 pt-6 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-ink-400 dark:text-ink-300">
                {journey.state} · {journey.department}
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-800 sm:text-4xl dark:text-cream-50">
                {journey.title}
              </h1>
            </div>
            <div className="sm:text-right">
              <p className="font-display text-3xl font-extrabold tracking-tighter text-saffron-500">{progressPct}%</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">
                {completedSteps.length} of {journey.steps.length} stops
              </p>
              <div className="mt-2 h-[3px] w-40 bg-ink-200 sm:ml-auto dark:bg-ink-700">
                <div
                  className="h-full bg-ink-800 transition-all duration-300 dark:bg-saffron-400"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
            <div className="relative">
              <Roadmap
                steps={journey.steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
                isStepBlocked={isStepBlocked}
              />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Manifest Card */}
              <div className="ticket-mini p-4">
                <div className="border-b border-dashed border-ink-200 pb-3 dark:border-ink-700">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
                    Route Manifest
                  </p>
                  <p className="mt-1 font-heading text-sm font-bold text-ink-800 dark:text-cream-50">
                    Maharashtra Domicile
                  </p>
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-500 dark:text-ink-400">Current Position:</span>
                    <span className="font-bold text-saffron-600 dark:text-saffron-400">
                      Stop {currentStep} of {journey.steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500 dark:text-ink-400">Cleared Stops:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {completedSteps.length} of {journey.steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-500 dark:text-ink-400">Total Statutory Fee:</span>
                    <span className="font-bold text-ink-800 dark:text-cream-50">₹53.60</span>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => openSourceDrawer(journey.sources[0])}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 border border-ink-800 py-2 text-center text-xs font-bold text-ink-800 transition-colors hover:bg-cream-200 dark:border-ink-200 dark:text-cream-50 dark:hover:bg-ink-700"
                >
                  <ShieldCheck size={13} className="text-teal-600 dark:text-teal-300" />
                  Inspect Provenance (2 Sources)
                </button>
              </div>

              {/* Stops Quick-Jump List */}
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
                  Stops Index
                </p>
                <div className="space-y-2">
                  {journey.steps.map((step) => {
                    const isDone = completedSteps.includes(step.id);
                    const isCurrent = step.id === currentStep;
                    const isBlocked = isStepBlocked(step);
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStepClick(step)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-transform duration-150 ${
                          isCurrent
                            ? 'ticket-mini scale-[1.02]'
                            : isDone
                              ? 'border-2 border-teal-800/40 bg-teal-50/30 hover:border-teal-700 dark:border-teal-500/40 dark:bg-teal-950/20'
                              : 'border-2 border-transparent hover:border-ink-200 dark:hover:border-ink-600'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? 'border-2 border-teal-700 bg-teal-600 text-white dark:border-teal-300 dark:bg-teal-500'
                              : isCurrent
                                ? 'rotate-6 bg-saffron-500 text-ink-900 shadow-sm'
                                : isBlocked
                                  ? 'border border-dashed border-ink-300 text-ink-400'
                                  : 'border border-ink-400 text-ink-600 dark:border-ink-400 dark:text-ink-300'
                          }`}
                        >
                          {isDone ? <Check size={12} strokeWidth={3} /> : isBlocked ? <Lock size={10} /> : step.id}
                        </span>
                        <span
                          className={`truncate text-xs ${
                            isCurrent
                              ? 'font-heading font-bold text-ink-900 dark:text-cream-50'
                              : isDone
                                ? 'text-ink-600 line-through dark:text-ink-300'
                                : 'text-ink-600 dark:text-ink-300'
                          }`}
                        >
                          {step.shortTitle}
                        </span>
                        {isCurrent && (
                          <span className="ml-auto shrink-0 text-[9px] font-extrabold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
                            Here
                          </span>
                        )}
                        {isDone && (
                          <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                            Stamped
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          isCurrent={selectedStep.id === currentStep}
          isDone={completedSteps.includes(selectedStep.id)}
          isBlocked={isStepBlocked(selectedStep)}
          totalSteps={journey.steps.length}
          blockedBySteps={
            selectedStep.dependsOn
              ?.filter((dep) => !completedSteps.includes(dep))
              .map((dep) => journey.steps.find((s) => s.id === dep))
              .filter(Boolean) as JourneyStep[]
          }
          onClose={() => setSelectedStep(null)}
          onAdvance={handleAdvance}
          onShowDoubt={() => setShowDoubtPanel(true)}
          onShowSource={(src) => openSourceDrawer(src)}
          showWhyThisStep={showWhyThisStep}
          setShowWhyThisStep={setShowWhyThisStep}
          isLastStep={selectedStep.id === journey.steps.length}
        />
      )}

      {showDoubtPanel && selectedStep && (
        <DoubtAssistant
          step={selectedStep}
          service={journey.service}
          jurisdiction={journey.state}
          onClose={() => setShowDoubtPanel(false)}
          onShowSource={(src) => openSourceDrawer(src)}
        />
      )}

      {showSourceDrawer && (
        <SourceDrawer
          source={sourceDrawerData}
          allSources={journey.sources}
          onClose={() => setShowSourceDrawer(false)}
        />
      )}
    </div>
  );
}

interface RoadmapProps {
  steps: JourneyStep[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: JourneyStep) => void;
  isStepBlocked: (step: JourneyStep) => boolean;
}

function Roadmap({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  isStepBlocked,
}: RoadmapProps) {
  return (
    <div className="relative space-y-6">
      {steps.map((step, idx) => {
        const isDone = completedSteps.includes(step.id);
        const isCurrent = step.id === currentStep;
        const isBlocked = isStepBlocked(step);
        const isLast = idx === steps.length - 1;
        const ModeIcon = modeIcon[step.detail.mode];

        return (
          <div
            key={step.id}
            className={`relative flex items-start gap-4 sm:gap-6 ${
              isCurrent ? 'z-10' : 'z-0'
            }`}
          >
            {/* Visual Route Spine Column */}
            <div className="relative flex flex-col items-center">
              {/* Node Marker */}
              <button
                type="button"
                onClick={() => !isBlocked && onStepClick(step)}
                disabled={isBlocked}
                aria-label={`Stop ${step.id}: ${step.title}`}
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-150 ${
                  isDone
                    ? 'border-2 border-teal-700 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-ink-800 dark:text-teal-300'
                    : isCurrent
                      ? 'rotate-3 border-2 border-ink-800 bg-saffron-500 text-ink-900 shadow-[3px_3px_0_0_var(--stamp-shadow)] hover:scale-105 active:translate-x-0.5 active:translate-y-0.5'
                      : isBlocked
                        ? 'cursor-not-allowed border border-dashed border-ink-300 bg-cream-100 text-ink-400 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-500'
                        : 'border-2 border-ink-400 bg-cream-50 text-ink-700 hover:border-ink-800 dark:border-ink-500 dark:bg-ink-800 dark:text-ink-200'
                }`}
              >
                {isDone ? (
                  <div className="flex flex-col items-center">
                    <Check size={18} strokeWidth={3} className="-rotate-6" />
                  </div>
                ) : isCurrent ? (
                  <span className="font-display text-base font-extrabold">{step.id}</span>
                ) : isBlocked ? (
                  <Lock size={15} />
                ) : (
                  <span className="font-display text-sm font-bold">{step.id}</span>
                )}

                {/* Stamped decorative ring for completed stops */}
                {isDone && (
                  <span
                    className="pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-teal-600/60 dark:border-teal-400/50"
                    aria-hidden
                  />
                )}
              </button>

              {/* Traveller positioned at current stop */}
              {isCurrent && (
                <div
                  className="pointer-events-none absolute -left-12 -top-6 hidden sm:block"
                  style={{ animation: 'fade-rise 320ms ease-out both' }}
                >
                  <div className="relative animate-float">
                    <Traveller size={44} className="text-saffron-600 dark:text-saffron-400" />
                    <span className="absolute -right-2 top-0 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-saffron-400 opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-saffron-500"></span>
                    </span>
                  </div>
                </div>
              )}

              {/* Vertical connecting route trail */}
              {!isLast && (
                <div
                  className={`mt-2 h-24 w-0.5 sm:h-20 ${
                    isDone
                      ? 'bg-teal-600 dark:bg-teal-400'
                      : 'border-l-2 border-dashed border-ink-300 dark:border-ink-600'
                  }`}
                  aria-hidden
                />
              )}
            </div>

            {/* Stop Ticket Stub Card */}
            <button
              type="button"
              onClick={() => !isBlocked && onStepClick(step)}
              disabled={isBlocked}
              className={`ticket-card flex-1 p-5 text-left ${
                isCurrent
                  ? 'is-active'
                  : isDone
                    ? 'is-done opacity-95'
                    : isBlocked
                      ? 'cursor-not-allowed border-dashed opacity-75'
                      : 'hover:border-ink-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-ink-200 pb-3 dark:border-ink-700">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
                    Stop 0{step.id}
                  </span>
                  <span className="h-2.5 w-px bg-ink-200 dark:bg-ink-600" />
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 dark:text-ink-300">
                    <ModeIcon size={12} strokeWidth={2} />
                    {step.detail.mode === 'online'
                      ? 'Online portal'
                      : step.detail.mode === 'office'
                        ? 'Government office'
                        : 'Online & Office'}
                  </span>
                </div>
                <span className="font-heading text-xs font-bold text-ink-600 dark:text-ink-300">
                  ⏱ {step.detail.estimatedTime}
                </span>
              </div>

              <div className="mt-3">
                <h2
                  className={`font-heading text-lg font-bold sm:text-xl ${
                    isCurrent
                      ? 'text-ink-900 dark:text-cream-50'
                      : isDone
                        ? 'text-ink-700 dark:text-cream-100'
                        : isBlocked
                          ? 'text-ink-400 dark:text-ink-400'
                          : 'text-ink-800 dark:text-cream-50'
                  }`}
                >
                  {step.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
                {isDone && (
                  <span className="stamp-badge border-teal-700 bg-teal-50/50 text-teal-800 dark:border-teal-300 dark:bg-teal-950/30 dark:text-teal-300">
                    <Check size={11} strokeWidth={3} />
                    Verified & Stamped
                  </span>
                )}
                {isCurrent && (
                  <span className="inline-flex items-center gap-1.5 font-heading text-xs font-bold text-saffron-600 dark:text-saffron-400">
                    <span className="h-2 w-2 rounded-full bg-saffron-500" />
                    Here — Tap to view directive & clear stop →
                  </span>
                )}
                {isBlocked && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 dark:text-ink-400">
                    <Lock size={12} />
                    Complete prior stops to unlock
                  </span>
                )}
                {!isDone && !isCurrent && !isBlocked && (
                  <span className="text-xs font-semibold text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-cream-50">
                    View stop requirements →
                  </span>
                )}

                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 dark:text-ink-400">
                  {step.detail.department}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface StepDetailModalProps {
  step: JourneyStep;
  totalSteps: number;
  isCurrent: boolean;
  isDone: boolean;
  isBlocked: boolean;
  blockedBySteps: JourneyStep[];
  onClose: () => void;
  onAdvance: () => void;
  onShowDoubt: () => void;
  onShowSource: (source: SourceLink) => void;
  showWhyThisStep: boolean;
  setShowWhyThisStep: (v: boolean) => void;
  isLastStep: boolean;
}

function StepDetailModal({
  step,
  totalSteps,
  isCurrent,
  isDone,
  isBlocked,
  blockedBySteps,
  onClose,
  onAdvance,
  onShowDoubt,
  onShowSource,
  showWhyThisStep,
  setShowWhyThisStep,
  isLastStep,
}: StepDetailModalProps) {
  const detail = step.detail;
  const ModeIcon = modeIcon[detail.mode];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink-900/55" onClick={onClose} />
      <TicketFrame className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto custom-scroll anim-enter">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b-2 border-ink-800 bg-cream-50 px-6 py-4 dark:border-ink-200 dark:bg-ink-800">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center font-display font-bold ${
                isDone
                  ? 'border-2 border-teal-700 text-teal-700 dark:border-teal-300 dark:text-teal-300'
                  : isCurrent
                    ? 'rotate-6 bg-saffron-500 text-ink-900'
                    : 'border-2 border-ink-300 text-ink-400'
              }`}
            >
              {isDone ? <Check size={18} strokeWidth={3} /> : step.id}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400">
                Stop {step.id} of {totalSteps}
              </p>
              <h2 className="font-display text-lg font-bold text-ink-800 dark:text-cream-50">{step.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-ink-800 p-1 text-ink-600 dark:border-ink-200 dark:text-ink-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {isBlocked && blockedBySteps.length > 0 && (
            <div className="border-2 border-dashed border-saffron-500 p-4">
              <div className="flex items-start gap-3">
                <Construction className="mt-0.5 shrink-0 text-saffron-600" size={18} />
                <div>
                  <h3 className="font-heading text-sm font-bold text-ink-800 dark:text-cream-50">
                    Roadblock ahead
                  </h3>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">Complete these stops first:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blockedBySteps.map((bs) => (
                      <span
                        key={bs.id}
                        className="inline-flex items-center gap-1.5 border border-ink-300 px-2 py-1 text-xs font-medium text-ink-600 dark:text-ink-200"
                      >
                        <Lock size={11} />
                        {bs.shortTitle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">What to do</h3>
            <p className="mt-2 leading-relaxed text-ink-600 dark:text-ink-200">{detail.whatToDo}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 border-y border-dashed border-ink-300 py-4 dark:border-ink-600">
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                <Building size={12} /> Department
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink-800 dark:text-cream-50">{detail.department}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                <MapPin size={12} /> Location
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink-800 dark:text-cream-50">{detail.location}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                <ModeIcon size={12} /> Mode
              </dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-ink-800 dark:text-cream-50">{detail.mode}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Est. time</dt>
              <dd className="mt-1 text-sm font-semibold text-ink-800 dark:text-cream-50">{detail.estimatedTime}</dd>
            </div>
          </dl>

          {detail.facts.length > 0 && (
            <div>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
                Key information
              </h3>
              <div className="divide-y divide-ink-200 dark:divide-ink-600">
                {detail.facts.map((fact, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <span className="text-xs text-ink-400">{fact.label}</span>
                      <p className="font-heading text-sm font-bold text-ink-800 dark:text-cream-50">{fact.value}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <VerificationBadge status={fact.status} />
                      <button
                        onClick={() => onShowSource(detail.source)}
                        className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
                      >
                        Source
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.fee && (
            <div className="flex items-end justify-between border-2 border-ink-800 px-4 py-4 dark:border-ink-200">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-saffron-600 dark:text-saffron-400">
                  Application fee
                </p>
                <p className="font-display text-3xl font-extrabold text-ink-800 dark:text-cream-50">
                  {detail.fee.amount}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <VerificationBadge status={detail.fee.status} />
                <button
                  onClick={() => onShowSource(detail.source)}
                  className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
                >
                  View source →
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-ink-200 dark:border-ink-600">
            <button
              onClick={() => setShowWhyThisStep(!showWhyThisStep)}
              className="flex w-full items-center justify-between py-3"
            >
              <span className="flex items-center gap-2 font-heading text-sm font-semibold text-ink-700 dark:text-ink-100">
                <Lightbulb size={16} className="text-saffron-500" />
                Why this step?
              </span>
              <span className="text-xs text-ink-400">{showWhyThisStep ? 'Hide' : 'Show'}</span>
            </button>
            {showWhyThisStep && (
              <div className="anim-enter pb-3">
                <p className="text-sm leading-relaxed text-ink-600 dark:text-ink-200">{detail.whyThisStep}</p>
                <button
                  onClick={() => onShowSource(detail.source)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-300"
                >
                  <ShieldCheck size={14} />
                  Source: {detail.source.name}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            {isCurrent && !isBlocked && (
              <>
                <button onClick={onAdvance} className="btn-stamp flex-1">
                  {isLastStep ? 'Complete journey' : 'Continue to next stop'}
                  <ArrowRight size={16} />
                </button>
                <button onClick={onShowDoubt} className="btn-ghost flex-1">
                  <MessagesSquare size={16} />
                  Ask about this step
                </button>
              </>
            )}
            {isDone && (
              <div className="flex flex-1 items-center justify-center gap-2 border-2 border-teal-700 py-3 font-heading font-bold text-teal-800 dark:border-teal-300 dark:text-teal-300">
                <Check size={18} strokeWidth={3} />
                Stamped complete
              </div>
            )}
            {isBlocked && (
              <div className="flex flex-1 items-center justify-center gap-2 border-2 border-dashed border-ink-300 py-3 font-heading font-bold text-ink-400">
                <Lock size={16} />
                Complete previous steps first
              </div>
            )}
          </div>
        </div>
      </TicketFrame>
    </div>
  );
}

interface DoubtAssistantProps {
  step: JourneyStep;
  service: string;
  jurisdiction: string;
  onClose: () => void;
  onShowSource: (source: SourceLink) => void;
}

interface Message {
  role: 'user' | 'humsafar';
  text: string;
  source?: SourceLink;
}

export function DoubtAssistant({ step, service, jurisdiction, onClose, onShowSource }: DoubtAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'humsafar',
      text: `I can help with questions about "${step.title}". Ask me anything about this step — I'll answer based on official sources.`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const askBackend = async (question: string): Promise<Message> => {
    try {
      const result = await askDoubt({
        service,
        jurisdiction,
        stepId: step.backendStepId,
        question,
      });

      if (!result.success) {
        return {
          role: 'humsafar',
          text: result.error ?? "I couldn't find an answer for that right now.",
          source: step.detail.source,
        };
      }

      // Only attach a source link if the answer was actually confirmed
      // against official sources (matches spec: never imply confirmation
      // for an answer that wasn't grounded in a real source).
      const cited = result.confirmed ? step.detail.source : undefined;

      return { role: 'humsafar', text: result.answer, source: cited };
    } catch (err) {
      return {
        role: 'humsafar',
        text: 'I could not reach Humsafar right now. Please try again in a moment.',
      };
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    askBackend(userMsg.text).then((answer) => {
      setMessages((prev) => [...prev, answer]);
      setIsTyping(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink-900/45" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l-2 border-ink-800 bg-cream-50 dark:border-ink-200 dark:bg-ink-900">
        <div className="flex items-center justify-between border-b-2 border-ink-800 px-5 py-4 dark:border-ink-200">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400">Field notes</p>
            <h2 className="font-display text-sm font-bold text-ink-800 dark:text-cream-50">Ask about this step</h2>
            <p className="text-xs text-ink-400">{step.shortTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="border-2 border-ink-800 p-1 text-ink-600 dark:border-ink-200 dark:text-ink-200"
          >
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="custom-scroll flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-ink-800 text-cream-50 dark:bg-ink-700'
                    : 'border border-ink-200 text-ink-700 dark:border-ink-600 dark:text-ink-100'
                }`}
              >
                <p>{msg.text}</p>
                {msg.source && (
                  <button
                    onClick={() => onShowSource(msg.source!)}
                    className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                      msg.role === 'user' ? 'text-saffron-300' : 'text-teal-700 dark:text-teal-300'
                    }`}
                  >
                    <ShieldCheck size={12} />
                    Source: {msg.source.name}
                  </button>
                )}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">Suggested questions</p>
              {step.detail.commonQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(q.q);
                    setTimeout(() => {
                      setMessages((prev) => [...prev, { role: 'user', text: q.q }]);
                      setInput('');
                      setIsTyping(true);
                      setTimeout(() => {
                        setMessages((prev) => [
                          ...prev,
                          { role: 'humsafar', text: q.a, source: q.source },
                        ]);
                        setIsTyping(false);
                      }, 380);
                    }, 50);
                  }}
                  className="block w-full border-b border-dashed border-ink-300 py-2 text-left text-sm text-ink-600 hover:text-saffron-600 dark:border-ink-600 dark:text-ink-200"
                >
                  {q.q}
                </button>
              ))}
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="border border-ink-200 px-4 py-3 dark:border-ink-600">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 bg-ink-400" />
                  <span className="h-1.5 w-1.5 bg-ink-400" />
                  <span className="h-1.5 w-1.5 bg-ink-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-ink-800 px-4 py-3 dark:border-ink-200">
          <div className="flex items-center gap-2 border-b-2 border-ink-800 dark:border-ink-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this step..."
              className="flex-1 bg-transparent py-2 text-sm text-ink-700 outline-none placeholder:text-ink-300 dark:text-cream-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 text-saffron-600 disabled:text-ink-300"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-ink-400">
            Answers from official sources only
          </p>
        </div>
      </div>
    </div>
  );
}