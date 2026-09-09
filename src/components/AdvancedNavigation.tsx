import React from 'react';
import { AdvancedPage, User } from '../types';

interface AdvancedNavigationProps {
  currentPage: AdvancedPage;
  onPageChange: (page: AdvancedPage) => void;
  currentUser: User;
  onLogout: () => void;
}

export const AdvancedNavigation: React.FC<AdvancedNavigationProps> = ({
  currentPage,
  onPageChange,
  currentUser,
  onLogout,
}) => {
  const navItems: { page: AdvancedPage; label: string }[] = [
    { page: 'verify', label: 'Verify' },
    { page: 'history', label: 'History' },
    { page: 'account', label: 'Account' },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="font-semibold text-neutral-900 tracking-tight text-sm sm:text-base">
            Document Verify
          </span>

          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  id={`nav-link-${item.page}`}
                  type="button"
                  onClick={() => onPageChange(item.page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'text-neutral-900 bg-neutral-100 font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-neutral-500 hidden sm:inline-block truncate max-w-[140px]">
            {currentUser.name}
          </span>
          <button
            id="nav-btn-logout"
            type="button"
            onClick={onLogout}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1.5 rounded border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
