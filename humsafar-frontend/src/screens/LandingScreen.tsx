// import { useState } from 'react';
// import { Search, ArrowRight } from 'lucide-react';
// import { Traveller } from '@/components/Traveller';
// import { AppHeader, StampSeal } from '@/components/Brand';
// import { RouteBackdrop } from '@/components/RouteBackdrop';
// import { searchSuggestions, categoryChips } from '@/data/journeyData';

// interface LandingScreenProps {
//   onSearch: () => void;
// }

// export function LandingScreen({ onSearch }: LandingScreenProps) {
//   const [query, setQuery] = useState('');

//   const handleSearch = () => {
//     onSearch();
//   };

//   return (
//     <div className="paper-bg relative min-h-screen overflow-hidden">
//       <RouteBackdrop />
//       <StampSeal className="absolute -right-10 top-28 hidden h-40 w-40 rotate-12 sm:block" />
//       <AppHeader />

//       <main className="relative z-10 px-6 pb-20 pt-8 sm:px-10 lg:pt-12">
//         <div className="mx-auto grid max-w-6xl items-start lg:grid-cols-12">
//           <div className="lg:col-span-8">
//             <p className="anim-enter text-[11px] font-bold uppercase tracking-[0.32em] text-ink-400 dark:text-ink-300">
//               Civic route · Issue 01
//             </p>

//             <div className="mt-5 flex items-start gap-3 sm:gap-5">
//               <span
//                 className="anim-d1 hidden shrink-0 font-display text-[5.5rem] font-extrabold leading-[0.75] tracking-[-0.08em] text-saffron-500 sm:block lg:text-[8.5rem]"
//                 aria-hidden
//               >
//                 01
//               </span>
//               <h1 className="anim-d1 font-display text-[3.25rem] font-extrabold leading-[0.88] tracking-[-0.04em] text-ink-800 sm:text-7xl lg:text-8xl dark:text-cream-50">
//                 Where
//                 <br />
//                 are you
//                 <br />
//                 <span className="font-light tracking-[-0.05em] text-saffron-500">headed</span>
//               </h1>
//             </div>

//             <p className="anim-d2 mt-8 max-w-md text-base leading-relaxed text-ink-500 dark:text-ink-300">
//               Government paperwork should not feel like a maze. Name the destination —
//               this field guide maps the stops, documents, and official doors.
//             </p>

//             <form
//               className="anim-d3 mt-10 max-w-xl"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleSearch();
//               }}
//             >
//               <div className="flex items-center justify-between">
//                 <label
//                   htmlFor="destination"
//                   className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300"
//                 >
//                   Destination or procedure
//                 </label>
//                 <span className="text-[10px] font-medium tracking-wider text-ink-400 dark:text-ink-400">
//                   PRESS ENTER ↵
//                 </span>
//               </div>
//               <div className="mt-2 flex items-end gap-3 border-b-2 border-ink-800 pb-2 dark:border-ink-200">
//                 <Search className="mb-1 shrink-0 text-ink-400" size={20} strokeWidth={1.75} />
//                 <input
//                   id="destination"
//                   type="text"
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Domicile certificate in Maharashtra…"
//                   className="w-full bg-transparent py-2 font-heading text-lg text-ink-800 outline-none placeholder:text-ink-300 dark:text-cream-50"
//                 />
//                 {query && (
//                   <button
//                     type="button"
//                     onClick={() => setQuery('')}
//                     className="mb-1 p-1 text-ink-400 hover:text-ink-700 dark:hover:text-cream-50"
//                     aria-label="Clear input"
//                   >
//                     ×
//                   </button>
//                 )}
//                 <button type="submit" className="btn-stamp shrink-0 px-5 py-2.5 text-sm font-bold">
//                   Go
//                   <ArrowRight size={16} strokeWidth={2} />
//                 </button>
//               </div>
//             </form>

//             <div className="anim-d3 mt-5">
//               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-400">
//                 Popular routes
//               </p>
//               <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
//                 {(query.trim()
//                   ? searchSuggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
//                   : searchSuggestions.slice(0, 4)
//                 ).map((s) => (
//                   <li key={s}>
//                     <button
//                       onClick={() => {
//                         setQuery(s);
//                         handleSearch();
//                       }}
//                       className="text-left text-sm text-ink-600 underline decoration-ink-300 decoration-dashed underline-offset-4 hover:text-saffron-600 hover:decoration-saffron-500 dark:text-ink-200 dark:decoration-ink-600 dark:hover:text-saffron-400"
//                     >
//                       {s}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div className="anim-d4 mt-12">
//               <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
//                 Browse the atlas
//               </p>
//               <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
//                 {categoryChips.map((cat, i) => (
//                   <span key={cat.label} className="flex items-center gap-4">
//                     {i > 0 && (
//                       <span className="hidden h-3 w-px bg-ink-300 sm:block dark:bg-ink-600" />
//                     )}
//                     <button
//                       onClick={() => {
//                         setQuery(cat.label === 'Certificates' ? 'Domicile certificate in Maharashtra' : cat.label);
//                         handleSearch();
//                       }}
//                       className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-700 hover:text-saffron-600 dark:text-ink-100 dark:hover:text-saffron-400"
//                     >
//                       {cat.label}
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="relative mt-10 lg:col-span-4 lg:mt-0 lg:min-h-[32rem]">
//             <svg
//               viewBox="0 0 280 480"
//               className="pointer-events-none absolute -right-20 top-0 hidden h-[480px] w-[280px] text-ink-800/45 lg:block dark:text-cream-100/30"
//               aria-hidden
//             >
//               <path
//                 className="anim-route"
//                 d="M 40 20 C 80 80, 40 140, 90 190 S 200 250, 160 310 S 90 370, 180 450"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="1.4"
//               />
//               <circle cx="40" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
//               <circle cx="90" cy="190" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
//               <circle cx="160" cy="310" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
//             </svg>
//             <div className="anim-d4 relative z-10 flex flex-col items-start lg:absolute lg:-right-6 lg:top-36">
//               <Traveller size={120} className="text-saffron-600 dark:text-saffron-400" />
//               <p className="mt-3 max-w-[9rem] text-[11px] uppercase tracking-[0.18em] text-ink-400 dark:text-ink-300">
//                 Companion on the route
//               </p>
//             </div>
//           </div>
//         </div>

//         <dl className="anim-d4 mx-auto mt-20 grid max-w-6xl gap-6 border-t-2 border-ink-800 pt-6 sm:grid-cols-3 dark:border-ink-200">
//           <div className="sm:border-r sm:border-ink-200 sm:pr-6 dark:sm:border-ink-600">
//             <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
//               Source-linked
//             </dt>
//             <dd className="mt-2 text-sm text-ink-500 dark:text-ink-300">
//               Every fact traces back to an official government portal.
//             </dd>
//           </div>
//           <div className="sm:border-r sm:border-ink-200 sm:px-6 dark:sm:border-ink-600">
//             <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
//               Journey mapped
//             </dt>
//             <dd className="mt-2 text-sm text-ink-500 dark:text-ink-300">
//               See every stop, dependency, and document before you start.
//             </dd>
//           </div>
//           <div className="sm:pl-6">
//             <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
//               No guesswork
//             </dt>
//             <dd className="mt-2 text-sm text-ink-500 dark:text-ink-300">
//               Know exactly what to do, where to go, and what to carry.
//             </dd>
//           </div>
//         </dl>
//       </main>
//     </div>
//   );
// }





















import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { Traveller } from '@/components/Traveller';
import { AppHeader, StampSeal } from '@/components/Brand';
import { RouteBackdrop } from '@/components/RouteBackdrop';
import { searchSuggestions, categoryChips } from '@/data/journeyData';

interface LandingScreenProps {
  onSearch: (query: string) => void;
  errorMessage?: string | null;
  clarificationMessage?: string | null;
}

export function LandingScreen({ onSearch, errorMessage, clarificationMessage }: LandingScreenProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <div className="paper-bg relative min-h-screen overflow-hidden">
      <RouteBackdrop />
      <StampSeal className="absolute -right-10 top-28 hidden h-40 w-40 rotate-12 sm:block" />
      <AppHeader />

      <main className="relative z-10 px-6 pb-20 pt-8 sm:px-10 lg:pt-12">
        <div className="mx-auto grid max-w-6xl items-start lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="anim-enter text-[11px] font-bold uppercase tracking-[0.32em] text-ink-400 dark:text-ink-300">
              Civic route · Issue 01
            </p>

            <div className="mt-5 flex items-start gap-3 sm:gap-5">
              <span
                className="anim-d1 hidden shrink-0 font-display text-[5.5rem] font-extrabold leading-[0.75] tracking-[-0.08em] text-saffron-500 sm:block lg:text-[8.5rem]"
                aria-hidden
              >
                01
              </span>
              <h1 className="anim-d1 font-display text-[3.25rem] font-extrabold leading-[0.88] tracking-[-0.04em] text-ink-800 sm:text-7xl lg:text-8xl dark:text-cream-50">
                Where
                <br />
                are you
                <br />
                <span className="font-light tracking-[-0.05em] text-saffron-500">headed</span>
              </h1>
            </div>

            <p className="anim-d2 mt-8 max-w-md text-base leading-relaxed text-ink-500 dark:text-ink-300">
              Government paperwork should not feel like a maze. Name the destination —
              this field guide maps the stops, documents, and official doors.
            </p>

            <form
              className="anim-d3 mt-10 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="destination"
                  className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300"
                >
                  Destination or procedure
                </label>
                <span className="text-[10px] font-medium tracking-wider text-ink-400 dark:text-ink-400">
                  PRESS ENTER ↵
                </span>
              </div>
              <div className="mt-2 flex items-end gap-3 border-b-2 border-ink-800 pb-2 dark:border-ink-200">
                <Search className="mb-1 shrink-0 text-ink-400" size={20} strokeWidth={1.75} />
                <input
                  id="destination"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Domicile certificate in Maharashtra…"
                  className="w-full bg-transparent py-2 font-heading text-lg text-ink-800 outline-none placeholder:text-ink-300 dark:text-cream-50"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mb-1 p-1 text-ink-400 hover:text-ink-700 dark:hover:text-cream-50"
                    aria-label="Clear input"
                  >
                    ×
                  </button>
                )}
                <button type="submit" className="btn-stamp shrink-0 px-5 py-2.5 text-sm font-bold">
                  Go
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
              </div>
            </form>

            {(errorMessage || clarificationMessage) && (
              <div className="anim-d3 mt-4 max-w-xl border-2 border-saffron-500 bg-saffron-50 px-4 py-3 text-sm text-ink-700 dark:bg-ink-800 dark:text-cream-50">
                {clarificationMessage ?? errorMessage}
              </div>
            )}

            <div className="anim-d3 mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 dark:text-ink-400">
                Popular routes
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {(query.trim()
                  ? searchSuggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
                  : searchSuggestions.slice(0, 4)
                ).map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => {
                        setQuery(s);
                        onSearch(s);
                      }}
                      className="text-left text-sm text-ink-600 underline decoration-ink-300 decoration-dashed underline-offset-4 hover:text-saffron-600 hover:decoration-saffron-500 dark:text-ink-200 dark:decoration-ink-600 dark:hover:text-saffron-400"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="anim-d4 mt-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-400 dark:text-ink-300">
                Browse the atlas
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {categoryChips.map((cat, i) => (
                  <span key={cat.label} className="flex items-center gap-4">
                    {i > 0 && (
                      <span className="hidden h-3 w-px bg-ink-300 sm:block dark:bg-ink-600" />
                    )}
                    <button
                      onClick={() => {
                        const q = cat.label === 'Certificates' ? 'Domicile certificate in Maharashtra' : cat.label;
                        setQuery(q);
                        onSearch(q);
                      }}
                      className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-700 hover:text-saffron-600 dark:text-ink-100 dark:hover:text-saffron-400"
                    >
                      {cat.label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-10 lg:col-span-4 lg:mt-0 lg:min-h-[32rem]">
            <svg
              viewBox="0 0 280 480"
              className="pointer-events-none absolute -right-20 top-0 hidden h-[480px] w-[280px] text-ink-800/45 lg:block dark:text-cream-100/30"
              aria-hidden
            >
              <path
                className="anim-route"
                d="M 40 20 C 80 80, 40 140, 90 190 S 200 250, 160 310 S 90 370, 180 450"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="40" cy="20" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="90" cy="190" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="160" cy="310" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <div className="anim-d4 relative z-10 flex flex-col items-start lg:absolute lg:-right-6 lg:top-36">
              <Traveller size={120} className="text-saffron-600 dark:text-saffron-400" />
              <p className="mt-3 max-w-[9rem] text-[11px] uppercase tracking-[0.18em] text-ink-400 dark:text-ink-300">
                Companion on the route
              </p>
            </div>
          </div>
        </div>

        <dl className="anim-d4 mx-auto mt-20 grid max-w-6xl gap-6 border-t-2 border-ink-800 pt-6 sm:grid-cols-3 dark:border-ink-200">
          <div className="sm:border-r sm:border-ink-200 sm:pr-6 dark:sm:border-ink-600">
            <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
              Source-linked
            </dt>
            <dd className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              Every fact traces back to an official government portal.
            </dd>
          </div>
          <div className="sm:border-r sm:border-ink-200 sm:px-6 dark:sm:border-ink-600">
            <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
              Journey mapped
            </dt>
            <dd className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              See every stop, dependency, and document before you start.
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-saffron-600 dark:text-saffron-400">
              No guesswork
            </dt>
            <dd className="mt-2 text-sm text-ink-500 dark:text-ink-300">
              Know exactly what to do, where to go, and what to carry.
            </dd>
          </div>
        </dl>
      </main>
    </div>
  );
}