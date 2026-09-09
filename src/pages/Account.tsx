import React, { useState } from 'react';
import { hashPassword, verifyPassword } from '../services/auth';
import { deleteUserAccount, saveUser } from '../services/storage';
import { User } from '../types';

interface AccountProps {
  currentUser: User;
  onLogout: () => void;
  onAccountDeleted: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

export const Account: React.FC<AccountProps> = ({
  currentUser,
  onLogout,
  onAccountDeleted,
  onUserUpdated,
}) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      const isCorrect = await verifyPassword(currentPassword, currentUser.passwordHash);
      if (!isCorrect) {
        setPasswordMsg({ type: 'error', text: 'Current password is incorrect.' });
        return;
      }

      const newHash = await hashPassword(newPassword);
      const updatedUser: User = {
        ...currentUser,
        passwordHash: newHash,
      };

      saveUser(updatedUser);
      onUserUpdated(updatedUser);

      setPasswordMsg({ type: 'success', text: 'Password successfully changed.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordMsg(null);
      }, 1500);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    deleteUserAccount(currentUser.id);
    onAccountDeleted();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div>
        <h1 id="account-page-title" className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Account
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your account profile and credentials
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
        <div>
          <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold block mb-1">
            Name
          </span>
          <p id="account-name-display" className="text-base font-semibold text-neutral-900">
            {currentUser.name}
          </p>
        </div>

        <div className="pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold block mb-1">
            Account created date
          </span>
          <p id="account-created-display" className="text-sm text-neutral-700 font-medium">
            {formatDate(currentUser.createdAt)}
          </p>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
        <h2 className="text-sm font-semibold text-neutral-900">Security & Settings</h2>

        {/* Change Password Toggle */}
        {!showPasswordChange ? (
          <div>
            <button
              id="btn-open-change-password"
              type="button"
              onClick={() => setShowPasswordChange(true)}
              className="px-4 py-2 bg-white border border-neutral-300 text-xs font-medium text-neutral-800 rounded hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Change Password
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
              Change Password
            </h3>

            {passwordMsg && (
              <div
                className={`p-3 text-xs rounded border ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <div>
              <label htmlFor="current-pw-input" className="block text-xs font-medium text-neutral-700 mb-1">
                Current Password
              </label>
              <input
                id="current-pw-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="new-pw-input" className="block text-xs font-medium text-neutral-700 mb-1">
                New Password
              </label>
              <input
                id="new-pw-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="confirm-pw-input" className="block text-xs font-medium text-neutral-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-pw-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                id="btn-save-new-password"
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordMsg(null);
                }}
                disabled={passwordLoading}
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Delete Account */}
        <div className="pt-4 border-t border-neutral-100">
          {!showDeleteConfirm ? (
            <button
              id="btn-trigger-delete-account"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-medium text-red-600 hover:text-red-800 hover:underline cursor-pointer"
            >
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <p className="text-xs text-red-800 font-medium">
                Are you sure you want to permanently delete your account and all associated verification records?
              </p>
              <div className="flex items-center space-x-2">
                <button
                  id="btn-confirm-delete-account"
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes, Delete My Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-neutral-300 text-xs font-medium text-neutral-700 rounded hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout button */}
      <div className="pt-2 text-center">
        <button
          id="btn-account-logout"
          type="button"
          onClick={onLogout}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 cursor-pointer"
        >
          Sign out of Document Verify
        </button>
      </div>
    </div>
  );
};
