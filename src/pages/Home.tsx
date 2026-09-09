import React from 'react';
import { PurposeSelector } from '../components/PurposeSelector';

interface HomeProps {
  onSelectMode: (mode: 'general' | 'advanced') => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
  return (
    <main className="min-h-screen flex flex-col justify-center bg-white">
      <PurposeSelector onSelect={onSelectMode} />
    </main>
  );
};
