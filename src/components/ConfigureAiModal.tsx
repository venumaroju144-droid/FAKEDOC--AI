import React, { useState } from 'react';
import { getConfiguredApiKey, saveConfiguredApiKey } from '../services/storage';

interface ConfigureAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ConfigureAiModal: React.FC<ConfigureAiModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiKey, setApiKey] = useState(getConfiguredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfiguredApiKey(apiKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
      <div
        id="configure-ai-modal"
        className="w-full max-w-md bg-white border border-neutral-200 rounded-lg p-6 shadow-sm"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Configure AI Verification</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 text-lg cursor-pointer leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
          Document Verify uses the Gemini API for document OCR, layout verification, and authenticity analysis.
          Provide your Gemini API key below.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="input-gemini-key" className="block text-xs font-medium text-neutral-700 mb-1">
              Gemini API Key
            </label>
            <input
              id="input-gemini-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded focus:outline-none focus:border-neutral-900 transition-colors"
            />
            <span className="block text-[11px] text-neutral-500 mt-1">
              Key is stored locally in your browser storage for this session.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded border border-emerald-200">
              API key configured successfully.
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-ai-config"
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition-colors cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
