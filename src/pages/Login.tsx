import React from 'react';
import { LoginForm } from '../components/LoginForm';

interface LoginProps {
  onLogin: (name: string, password: string) => Promise<void>;
  onSwitchToCreate: () => void;
  onBackToHome: () => void;
  error?: string | null;
}

export const Login: React.FC<LoginProps> = ({
  onLogin,
  onSwitchToCreate,
  onBackToHome,
  error,
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4 py-12">
      <LoginForm
        onLogin={onLogin}
        onSwitchToCreate={onSwitchToCreate}
        onBackToHome={onBackToHome}
        error={error}
      />
    </div>
  );
};
