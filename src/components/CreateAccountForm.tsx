import React, { useState } from 'react';

interface CreateAccountFormProps {
  onCreateAccount: (name: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  onBackToHome: () => void;
  error?: string | null;
}

export const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  onCreateAccount,
  onSwitchToLogin,
  onBackToHome,
  error,
}) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError('Please enter your name.');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }
    if (password.length < 4) {
      setLocalError('Password must be at least 4 characters.');
      return;
    }

    try {
      setLoading(true);
      await onCreateAccount(name.trim(), password);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-6">
        <button
          id="btn-create-back-home"
          type="button"
          onClick={onBackToHome}
          className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center cursor-pointer mb-4"
        >
          ← Back to selection
        </button>
        <h2
          id="create-account-title"
          className="text-2xl font-semibold text-neutral-900 tracking-tight"
        >
          Create Account
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Set up an account to save verification history and access advanced analysis
        </p>
      </div>

      {displayError && (
        <div
          id="create-account-error-alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded"
        >
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="create-name-input" className="block text-xs font-medium text-neutral-700 mb-1">
            Name
          </label>
          <input
            id="create-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoComplete="username"
            className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900 transition-colors"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="create-password-input" className="block text-xs font-medium text-neutral-700 mb-1">
            Password
          </label>
          <input
            id="create-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900 transition-colors"
            placeholder="Create a password"
          />
        </div>

        <div className="pt-2 space-y-3">
          <button
            id="btn-submit-create-account"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>

          <button
            id="btn-switch-to-login"
            type="button"
            onClick={onSwitchToLogin}
            disabled={loading}
            className="w-full py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline cursor-pointer"
          >
            I ALREADY HAVE AN ACCOUNT
          </button>
        </div>
      </form>
    </div>
  );
};
