// import { useState, type ReactElement } from 'react';
// import { ThemeProvider } from '@/theme';
// import { LandingScreen } from '@/screens/LandingScreen';
// import { JourneyBriefScreen } from '@/screens/JourneyBriefScreen';
// import { ChecklistScreen } from '@/screens/ChecklistScreen';
// import { JourneyMapScreen } from '@/screens/JourneyMapScreen';
// import { CompleteScreen } from '@/screens/CompleteScreen';

// type Screen = 'landing' | 'brief' | 'checklist' | 'journey' | 'complete';

// function App() {
//   const [screen, setScreen] = useState<Screen>('landing');
//   const [currentStep, setCurrentStep] = useState(1);
//   const [completedSteps, setCompletedSteps] = useState<number[]>([]);
//   const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

//   const handleSearch = () => {
//     setScreen('brief');
//   };

//   const handleStartJourney = () => {
//     setScreen('checklist');
//   };

//   const handleChecklistContinue = () => {
//     setCurrentStep(1);
//     setCompletedSteps([]);
//     setScreen('journey');
//   };

//   const handleAdvanceStep = () => {
//     setCompletedSteps((prev) => {
//       if (prev.includes(currentStep)) return prev;
//       return [...prev, currentStep];
//     });
//     const nextStep = currentStep + 1;
//     if (nextStep > 6) {
//       setScreen('complete');
//     } else {
//       setCurrentStep(nextStep);
//     }
//   };

//   const handleComplete = () => {
//     setScreen('complete');
//   };

//   const handleRestart = () => {
//     setScreen('landing');
//     setCurrentStep(1);
//     setCompletedSteps([]);
//     setCheckedDocs({});
//   };

//   const handleBackToLanding = () => {
//     setScreen('landing');
//   };

//   let view: ReactElement;
//   switch (screen) {
//     case 'landing':
//       view = <LandingScreen onSearch={handleSearch} />;
//       break;
//     case 'brief':
//       view = (
//         <JourneyBriefScreen
//           onStart={handleStartJourney}
//           onBack={handleBackToLanding}
//         />
//       );
//       break;
//     case 'checklist':
//       view = (
//         <ChecklistScreen
//           onStart={handleChecklistContinue}
//           onBack={() => setScreen('brief')}
//           checkedDocs={checkedDocs}
//           setCheckedDocs={setCheckedDocs}
//         />
//       );
//       break;
//     case 'journey':
//       view = (
//         <JourneyMapScreen
//           currentStep={currentStep}
//           completedSteps={completedSteps}
//           onAdvanceStep={handleAdvanceStep}
//           onBack={() => setScreen('checklist')}
//           onComplete={handleComplete}
//         />
//       );
//       break;
//     case 'complete':
//       view = <CompleteScreen onRestart={handleRestart} />;
//       break;
//     default:
//       view = <LandingScreen onSearch={handleSearch} />;
//   }

//   return <ThemeProvider>{view}</ThemeProvider>;
// }

// export default App;














import { useState, type ReactElement } from 'react';
import { ThemeProvider } from '@/theme';
import { LandingScreen } from '@/screens/LandingScreen';
import { JourneyBriefScreen } from '@/screens/JourneyBriefScreen';
import { ChecklistScreen } from '@/screens/ChecklistScreen';
import { JourneyMapScreen } from '@/screens/JourneyMapScreen';
import { CompleteScreen } from '@/screens/CompleteScreen';
import { fetchRoadmap } from '@/lib/api';
import { adaptProcedureToJourney } from '@/lib/adapter';
import type { Journey } from '@/data/journeyData';

type Screen = 'landing' | 'loading' | 'brief' | 'checklist' | 'journey' | 'complete';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Understanding your request…');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clarificationMessage, setClarificationMessage] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const handleSearch = async (query: string, jurisdictionHint?: string) => {
    setErrorMessage(null);
    setClarificationMessage(null);
    setScreen('loading');
    setLoadingMessage('Understanding your request…');

    const t1 = setTimeout(() => setLoadingMessage('Checking verified procedures…'), 900);
    const t2 = setTimeout(() => setLoadingMessage('Finding official government information…'), 2200);
    const t3 = setTimeout(() => setLoadingMessage('Building your Humsafar journey…'), 4500);

    try {
      const response = await fetchRoadmap(query, jurisdictionHint);

      if (response.clarification) {
        setClarificationMessage(response.clarification.prompt_to_user);
        setScreen('landing');
        return;
      }

      if (!response.success || !response.procedure) {
        setErrorMessage(
          response.error ?? 'We could not retrieve this procedure right now. Please try again.'
        );
        setScreen('landing');
        return;
      }

      const adapted = adaptProcedureToJourney(response.procedure);
      setJourney(adapted);
      setScreen('brief');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong reaching Humsafar. Please try again.'
      );
      setScreen('landing');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    }
  };

  const handleStartJourney = () => {
    setScreen('checklist');
  };

  const handleChecklistContinue = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setScreen('journey');
  };

  const handleAdvanceStep = () => {
    if (!journey) return;
    setCompletedSteps((prev) => {
      if (prev.includes(currentStep)) return prev;
      return [...prev, currentStep];
    });
    const nextStep = currentStep + 1;
    if (nextStep > journey.steps.length) {
      setScreen('complete');
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleComplete = () => {
    setScreen('complete');
  };

  const handleRestart = () => {
    setScreen('landing');
    setJourney(null);
    setCurrentStep(1);
    setCompletedSteps([]);
    setCheckedDocs({});
    setErrorMessage(null);
    setClarificationMessage(null);
  };

  const handleBackToLanding = () => {
    setScreen('landing');
  };

  let view: ReactElement;
  switch (screen) {
    case 'landing':
      view = (
        <LandingScreen
          onSearch={handleSearch}
          errorMessage={errorMessage}
          clarificationMessage={clarificationMessage}
        />
      );
      break;
    case 'loading':
      view = <LoadingScreen message={loadingMessage} />;
      break;
    case 'brief':
      view = journey ? (
        <JourneyBriefScreen journey={journey} onStart={handleStartJourney} onBack={handleBackToLanding} />
      ) : (
        <LandingScreen onSearch={handleSearch} errorMessage={null} clarificationMessage={null} />
      );
      break;
    case 'checklist':
      view = journey ? (
        <ChecklistScreen
          journey={journey}
          onStart={handleChecklistContinue}
          onBack={() => setScreen('brief')}
          checkedDocs={checkedDocs}
          setCheckedDocs={setCheckedDocs}
        />
      ) : (
        <LandingScreen onSearch={handleSearch} errorMessage={null} clarificationMessage={null} />
      );
      break;
    case 'journey':
      view = journey ? (
        <JourneyMapScreen
          journey={journey}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onAdvanceStep={handleAdvanceStep}
          onBack={() => setScreen('checklist')}
          onComplete={handleComplete}
        />
      ) : (
        <LandingScreen onSearch={handleSearch} errorMessage={null} clarificationMessage={null} />
      );
      break;
    case 'complete':
      view = <CompleteScreen journey={journey} onRestart={handleRestart} />;
      break;
    default:
      view = <LandingScreen onSearch={handleSearch} errorMessage={null} clarificationMessage={null} />;
  }

  return <ThemeProvider>{view}</ThemeProvider>;
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="paper-bg flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink-800 border-t-transparent dark:border-cream-50 dark:border-t-transparent" />
      <p className="font-heading text-lg font-semibold text-ink-700 dark:text-cream-50">{message}</p>
      <p className="max-w-sm text-sm text-ink-400 dark:text-ink-300">
        Humsafar is checking official government sources — this can take a few seconds.
      </p>
    </div>
  );
}

export default App;