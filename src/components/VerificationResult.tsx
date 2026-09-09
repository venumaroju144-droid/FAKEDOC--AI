import React from 'react';
import { VerificationResultStatus } from '../types';

interface VerificationResultProps {
  result: VerificationResultStatus;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({ result }) => {
  const isReal = result === 'REAL';

  return (
    <div className="w-full mt-8 pt-6 border-t border-neutral-200 text-center">
      <div
        id="verification-result-container"
        className={`inline-block px-12 py-5 rounded-lg border-2 text-center transition-all ${
          isReal
            ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
            : 'bg-red-50 border-red-600 text-red-800'
        }`}
      >
        <span
          id="verification-result-text"
          className="text-3xl sm:text-4xl font-extrabold tracking-widest uppercase block"
        >
          {result}
        </span>
      </div>
    </div>
  );
};
