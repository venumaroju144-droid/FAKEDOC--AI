import React, { useEffect, useState } from 'react';

const STEPS = [
  'Reading document...',
  'Extracting information...',
  'Analyzing document...',
  'Preparing result...',
];

interface ProcessingViewProps {
  onComplete?: () => void;
}

export const ProcessingView: React.FC<ProcessingViewProps> = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="processing-view-container"
      className="w-full max-w-md mx-auto py-16 px-6 flex flex-col items-center justify-center text-center"
    >
      {/* Simple, clean, human-designed spinner */}
      <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-8" />

      <h2
        id="processing-status-text"
        className="text-lg font-medium text-neutral-900 mb-6 min-h-[28px]"
      >
        {STEPS[currentStepIndex]}
      </h2>

      <div className="w-full max-w-xs space-y-2 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={step}
              className={`flex items-center text-xs transition-opacity duration-300 ${
                isDone
                  ? 'text-neutral-900 font-medium'
                  : isCurrent
                  ? 'text-neutral-900 font-medium'
                  : 'text-neutral-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  isDone
                    ? 'bg-neutral-900'
                    : isCurrent
                    ? 'bg-neutral-900 animate-pulse'
                    : 'bg-neutral-300'
                }`}
              />
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
