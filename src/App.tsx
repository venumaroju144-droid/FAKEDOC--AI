import React, { useEffect, useState } from 'react';
import { AdvancedNavigation } from './components/AdvancedNavigation';
import { Account } from './pages/Account';
import { AdvancedVerify } from './pages/AdvancedVerify';
import { CreateAccount } from './pages/CreateAccount';
import { GeneralVerify } from './pages/GeneralVerify';
import { History } from './pages/History';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { hashPassword, verifyPassword } from './services/auth';
import {
  clearSession,
  findUserById,
  findUserByName,
  getActiveSessionUserId,
  saveUser,
  setActiveSession,
} from './services/storage';
import { AdvancedPage, ServiceMode, User } from './types';

export default function App() {
  const [mode, setMode] = useState<ServiceMode>('none');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [advancedAuthView, setAdvancedAuthView] = useState<'create' | 'login'>('create');
  const [advancedPage, setAdvancedPage] = useState<AdvancedPage>('verify');
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize session check
  useEffect(() => {
    try {
      const activeUserId = getActiveSessionUserId();
      if (activeUserId) {
        const found = findUserById(activeUserId);
        if (found) {
          setCurrentUser(found);
        }
      }
    } catch (err) {
      console.error('Session restoration error:', err);
    }
  }, []);

  const handleSelectMode = (selectedMode: 'general' | 'advanced') => {
    setAuthError(null);
    setMode(selectedMode);
    if (selectedMode === 'advanced') {
      // Check if user is already logged in from active session
      const activeUserId = getActiveSessionUserId();
      if (activeUserId) {
        const found = findUserById(activeUserId);
        if (found) {
          setCurrentUser(found);
          setAdvancedPage('verify');
          return;
        }
      }
      setAdvancedAuthView('create');
    }
  };

  const handleCreateAccount = async (name: string, password: string): Promise<void> => {
    setAuthError(null);
    const existing = findUserByName(name);
    if (existing) {
      throw new Error('An account with this name already exists. Please log in instead.');
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setActiveSession(newUser.id);
    setCurrentUser(newUser);
    setAdvancedPage('verify');
  };

  const handleLogin = async (name: string, password: string): Promise<void> => {
    setAuthError(null);
    const user = findUserByName(name);
    if (!user) {
      throw new Error('Account not found. Please create an account.');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Incorrect password. Please try again.');
    }

    setActiveSession(user.id);
    setCurrentUser(user);
    setAdvancedPage('verify');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setMode('none');
    setAdvancedPage('verify');
    setAdvancedAuthView('create');
    setAuthError(null);
  };

  const handleAccountDeleted = () => {
    clearSession();
    setCurrentUser(null);
    setMode('none');
    setAdvancedPage('verify');
    setAdvancedAuthView('create');
    setAuthError(null);
  };

  // 1. First Screen: Choose General or Advanced
  if (mode === 'none') {
    return <Home onSelectMode={handleSelectMode} />;
  }

  // 2. General Mode
  if (mode === 'general') {
    return <GeneralVerify onBackToHome={() => setMode('none')} />;
  }

  // 3. Advanced Mode - Auth screen (if not logged in)
  if (mode === 'advanced' && !currentUser) {
    if (advancedAuthView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToCreate={() => {
            setAuthError(null);
            setAdvancedAuthView('create');
          }}
          onBackToHome={() => setMode('none')}
          error={authError}
        />
      );
    }
    return (
      <CreateAccount
        onCreateAccount={handleCreateAccount}
        onSwitchToLogin={() => {
          setAuthError(null);
          setAdvancedAuthView('login');
        }}
        onBackToHome={() => setMode('none')}
        error={authError}
      />
    );
  }

  // 4. Advanced Mode - Logged in views
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AdvancedNavigation
        currentPage={advancedPage}
        onPageChange={(page) => setAdvancedPage(page)}
        currentUser={currentUser!}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {advancedPage === 'verify' && (
          <AdvancedVerify currentUser={currentUser!} />
        )}
        {advancedPage === 'history' && (
          <History currentUser={currentUser!} />
        )}
        {advancedPage === 'account' && (
          <Account
            currentUser={currentUser!}
            onLogout={handleLogout}
            onAccountDeleted={handleAccountDeleted}
            onUserUpdated={(updated) => setCurrentUser(updated)}
          />
        )}
      </main>
    </div>
  );
}
