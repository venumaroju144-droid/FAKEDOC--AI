import React from 'react';

interface PurposeSelectorProps {
  onSelect: (mode: 'general' | 'advanced') => void;
}

export const PurposeSelector: React.FC<PurposeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-xl text-center">
        <h1
          id="purpose-heading"
          className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 mb-8"
        >
          How would you like to use the service?
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            id="btn-select-general"
            type="button"
            onClick={() => onSelect('general')}
            className="group flex flex-col items-center justify-center p-8 bg-white border border-neutral-300 rounded-lg text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer text-center"
          >
            <span className="text-lg font-semibold tracking-wide uppercase text-neutral-900 mb-2">
              GENERAL
            </span>
            <span className="text-sm text-neutral-600 font-normal">
              Quick single-session document verification without an account
            </span>
          </button>

          <button
            id="btn-select-advanced"
            type="button"
            onClick={() => onSelect('advanced')}
            className="group flex flex-col items-center justify-center p-8 bg-white border border-neutral-300 rounded-lg text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer text-center"
          >
            <span className="text-lg font-semibold tracking-wide uppercase text-neutral-900 mb-2">
              ADVANCED
            </span>
            <span className="text-sm text-neutral-600 font-normal">
              Account-based verification with history logs and detailed analysis
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
