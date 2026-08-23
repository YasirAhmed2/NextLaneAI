import React, { useEffect } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface SideNavBarProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  savedCount,
  userProfile,
  onOpenSettings,
  onOpenPremium,
  theme,
  onToggleTheme
}) => {
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems: { id: ActiveTab; label: string; icon: string; badge?: number; description: string }[] = [
    { id: 'opportunities', label: 'Dashboard', icon: 'grid_view', description: 'Curated opportunities feed' },
    { id: 'saved', label: 'Saved', icon: 'bookmark', badge: savedCount, description: 'Your saved opportunities' },
    { id: 'history', label: 'Missed Opportunities', icon: 'history', description: 'Past cycles and retrospective insights' },
    { id: 'profile_init', label: 'Profile Setup', icon: 'manage_accounts', description: 'Update skills and education' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        className="relative z-10 w-full max-w-sm h-full bg-[var(--card-bg)] border-r border-[var(--border)] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200 transition-all text-[var(--text)]"
        aria-label="Navigation drawer"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div
              onClick={() => {
                setActiveTab('landing');
                onClose();
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B38600] to-[#D4AF37] flex items-center justify-center text-[#1C1C1C] shadow-md shadow-[#D4AF37]/20">
                <span className="material-symbols-outlined text-2xl font-bold">
                  insights
                </span>
              </div>
              <div>
                <span className="font-poppins text-lg font-bold text-[var(--text)] tracking-tight block leading-tight">
                  NextLane AI
                </span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold block">
                  Discovery Engine
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Authenticated User Profile Mini Badge OR Unauthenticated CTA */}
          {isAuthenticated ? (
            <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#8A6700] dark:text-[#D4AF37] font-bold text-sm flex items-center justify-center">
                  {userProfile.fullName ? userProfile.fullName.charAt(0) : 'U'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-[var(--text)] truncate">
                    {userProfile.fullName || 'User Profile'}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] capitalize">
                    {userProfile.educationLevel} Level
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onOpenPremium();
                  onClose();
                }}
                className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[10px] font-bold text-[#8A6700] dark:text-[#D4AF37] uppercase tracking-wider hover:bg-[#D4AF37]/25 transition-colors cursor-pointer"
              >
                {userProfile.tier}
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] space-y-2">
              <p className="text-xs text-[var(--text-secondary)]">
                Sign in to customize and save opportunities matching your career goals.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-xs font-bold text-[var(--text)] hover:border-[#D4AF37] transition-all cursor-pointer text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth('register');
                  }}
                  className="flex-1 py-2 rounded-lg btn-primary text-[#1C1C1C] text-xs font-bold uppercase tracking-wider text-center cursor-pointer shadow-sm"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="p-4 sm:p-6 space-y-1.5 flex-1">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] px-3 mb-2">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#8A6700] dark:text-[#D4AF37] border border-[#D4AF37]/30 font-bold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#1C1C1C]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-normal leading-tight">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1C1C1C] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-[var(--border)] space-y-3 bg-[var(--bg-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Display Appearance
            </span>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>

          {isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[#D4AF37] text-xs font-bold text-[var(--text)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[var(--text-muted)]">tune</span>
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
