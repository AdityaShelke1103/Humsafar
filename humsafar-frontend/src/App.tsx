import { useState, type ReactElement } from 'react';
import { ThemeProvider } from '@/theme';
import { LandingScreen } from '@/screens/LandingScreen';
import { JourneyBriefScreen } from '@/screens/JourneyBriefScreen';
import { ChecklistScreen } from '@/screens/ChecklistScreen';
import { JourneyMapScreen } from '@/screens/JourneyMapScreen';
import { CompleteScreen } from '@/screens/CompleteScreen';

type Screen = 'landing' | 'brief' | 'checklist' | 'journey' | 'complete';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const handleSearch = () => {
    setScreen('brief');
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
    setCompletedSteps((prev) => {
      if (prev.includes(currentStep)) return prev;
      return [...prev, currentStep];
    });
    const nextStep = currentStep + 1;
    if (nextStep > 6) {
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
    setCurrentStep(1);
    setCompletedSteps([]);
    setCheckedDocs({});
  };

  const handleBackToLanding = () => {
    setScreen('landing');
  };

  let view: ReactElement;
  switch (screen) {
    case 'landing':
      view = <LandingScreen onSearch={handleSearch} />;
      break;
    case 'brief':
      view = (
        <JourneyBriefScreen
          onStart={handleStartJourney}
          onBack={handleBackToLanding}
        />
      );
      break;
    case 'checklist':
      view = (
        <ChecklistScreen
          onStart={handleChecklistContinue}
          onBack={() => setScreen('brief')}
          checkedDocs={checkedDocs}
          setCheckedDocs={setCheckedDocs}
        />
      );
      break;
    case 'journey':
      view = (
        <JourneyMapScreen
          currentStep={currentStep}
          completedSteps={completedSteps}
          onAdvanceStep={handleAdvanceStep}
          onBack={() => setScreen('checklist')}
          onComplete={handleComplete}
        />
      );
      break;
    case 'complete':
      view = <CompleteScreen onRestart={handleRestart} />;
      break;
    default:
      view = <LandingScreen onSearch={handleSearch} />;
  }

  return <ThemeProvider>{view}</ThemeProvider>;
}

export default App;
