import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  theme,
  onToggleTheme
}) => {
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email || 'alex.vance@stanford.edu');
  const [institution, setInstitution] = useState(userProfile.institution || 'Stanford University');
  const [gpa, setGpa] = useState(userProfile.gpa || '3.92');
  const [tier] = useState(userProfile.tier);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...userProfile,
      fullName,
      email,
      institution,
      gpa,
      tier
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="gold-modal-frame relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[var(--card-bg)] rounded-2xl border border-[#D4AF37]/40 p-5 sm:p-8 shadow-2xl text-[var(--text)]">
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-2xl">settings</span>
            <h3 className="font-poppins text-base sm:text-lg font-bold text-[var(--text)]">System & Profile Settings</h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Academic Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Current GPA
              </label>
              <input
                type="text"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Appearance Setting */}
          {onToggleTheme && theme && (
            <div className="pt-2 border-t border-[var(--border)]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Interface Appearance
              </label>
              <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37]">
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text)]">
                      {theme === 'dark' ? 'Dark Obsidian Theme' : 'Light Ivory Theme'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Toggle between dark and light color modes
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full min-[480px]:w-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37]/15 text-[#8A6700] dark:text-[#D4AF37] hover:bg-[#D4AF37]/25 transition-colors cursor-pointer text-center"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[var(--border)]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Notification Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={deadlineAlerts}
                  onChange={(e) => setDeadlineAlerts(e.target.checked)}
                  className="custom-check"
                />
                <span>Instant alerts for upcoming application deadlines</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="custom-check"
                />
                <span>Weekly digest of 90%+ neural match opportunities</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col min-[400px]:flex-row justify-end gap-2.5 sm:gap-3 pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="w-full min-[400px]:w-auto px-5 py-2.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full min-[400px]:w-auto btn-primary px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold cursor-pointer text-[#1C1C1C] text-center"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

