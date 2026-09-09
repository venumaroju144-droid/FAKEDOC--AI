import React from 'react';
import { CreateAccountForm } from '../components/CreateAccountForm';

interface CreateAccountProps {
  onCreateAccount: (name: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  onBackToHome: () => void;
  error?: string | null;
}

export const CreateAccount: React.FC<CreateAccountProps> = ({
  onCreateAccount,
  onSwitchToLogin,
  onBackToHome,
  error,
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4 py-12">
      <CreateAccountForm
        onCreateAccount={onCreateAccount}
        onSwitchToLogin={onSwitchToLogin}
        onBackToHome={onBackToHome}
        error={error}
      />
    </div>
  );
};
