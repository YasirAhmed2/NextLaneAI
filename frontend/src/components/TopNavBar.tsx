import React, { useState } from 'react';
import { ActiveTab, NotificationItem, UserProfile } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface TopNavBarProps {
  isAuthenticated: boolean;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
  onOpenSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  isAuthenticated,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  savedCount,
  notifications,
  onMarkNotificationsRead,
  searchQuery,
  setSearchQuery,
  userProfile,
  onOpenSettings,
  onOpenPremium,
  onOpenSidebar,
  theme,
  onToggleTheme
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Navigation tabs for authenticated users
  const authNavItems: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'opportunities', label: 'Dashboard', icon: 'grid_view' },
    { id: 'saved', label: 'Saved', icon: 'bookmark', badge: savedCount },
    { id: 'history', label: 'Missed', icon: 'history' }
  ];

  return (
    <>
      {/* Click outside backdrop when dropdowns are open */}
      {(showNotifications || showProfileMenu) && (
        <div
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[1px] cursor-default"
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 w-full backdrop-blur-xl border-b border-[var(--border)] bg-[var(--bg)]/95 text-[var(--text)] h-14 z-40 transition-all">
      <div className="max-w-[1600px] mx-auto h-full px-2 sm:px-6 lg:px-8 flex justify-between items-center gap-1 sm:gap-4">
        {/* Left: Mobile Menu + Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile drawer trigger */}
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer shrink-0 flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <span className="material-symbols-outlined text-lg">menu</span>
          </button>

          {/* Logo */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group shrink-0"
            title="NextLane AI Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#D4AF37] to-[#E5C158] flex items-center justify-center text-[#1C1C1C] shadow-xs shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-lg sm:text-xl font-bold">
                insights
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-poppins text-xs sm:text-base font-bold text-[var(--text)] tracking-tight leading-none">
                NextLane<span className="hidden min-[360px]:inline"> AI</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Authenticated Nav OR Public Landing Nav */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-subtle)] p-0.5 rounded-xl border border-[var(--border)] shadow-xs">
            {authNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--card-bg)] text-[#B38600] dark:text-[#D4AF37] shadow-xs font-bold border border-[#D4AF37]/40'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isActive ? 'text-[#B38600] dark:text-[#D4AF37]' : 'text-[var(--text-muted)]'
                    }`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#D4AF37] text-[#1C1C1C] font-black leading-none ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--text-secondary)]">
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('opportunities');
              }}
              className="hover:text-[#B38600] dark:hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">play_circle</span>
              <span>Sample Demo</span>
            </button>
          </nav>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search (Only if on Opportunities/Saved views or authenticated) */}
          {isAuthenticated && (
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab === 'landing' && e.target.value.trim().length > 0) {
                    setActiveTab('opportunities');
                  }
                }}
                placeholder="Search grants, internships..."
                className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg py-1 pl-7 pr-6 text-xs font-medium text-[var(--text)] focus:outline-none focus:border-[#D4AF37] transition-colors w-36 xl:w-48"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Universal Theme Toggle */}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* Authenticated Controls (Notifications + Profile Menu) */}
          {isAuthenticated ? (
            <>
              {/* Notifications Trigger */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                    if (!showNotifications) onMarkNotificationsRead();
                  }}
                  className="relative p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined text-base">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[var(--card-bg)] animate-pulse"></span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifications && (
                  <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/30 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="font-poppins text-sm font-bold text-[var(--text)]">
                          Alerts
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-[#D4AF37]/20 text-[#8A6700] dark:text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={onMarkNotificationsRead}
                        className="text-[11px] text-[#B38600] dark:text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                      >
                        Mark read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pt-3">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center text-[var(--text-muted)] py-4">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border text-xs transition-colors ${
                              n.read
                                ? 'border-[var(--border)] bg-[var(--bg-subtle)]/50 opacity-75'
                                : 'border-[#D4AF37]/30 bg-[#D4AF37]/10'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-[var(--text)]">{n.title}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">{n.time}</span>
                            </div>
                            <p className="text-[var(--text-secondary)] leading-relaxed">{n.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Icon (Right) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:border-[#D4AF37] transition-all cursor-pointer group"
                  aria-label="User Profile menu"
                >
                  <div className="w-6 h-6 rounded-md bg-[#D4AF37]/20 text-[#B38600] dark:text-[#D4AF37] font-bold text-xs flex items-center justify-center">
                    {userProfile.fullName ? userProfile.fullName.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[var(--text)] hidden sm:inline max-w-[90px] truncate">
                    {userProfile.fullName.split(' ')[0] || 'Account'}
                  </span>
                  <span className="material-symbols-outlined text-xs text-[var(--text-muted)] group-hover:text-[var(--text)]">
                    expand_more
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-3 w-[calc(100vw-24px)] sm:w-64 max-w-xs rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-[var(--border)]">
                      <div className="font-bold text-xs text-[var(--text)] truncate">
                        {userProfile.fullName || 'User Profile'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] capitalize">
                        {userProfile.educationLevel} Level
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('profile_init');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base text-[#B38600] dark:text-[#D4AF37]">
                          manage_accounts
                        </span>
                        <span>Edit Profile & Skills</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenSettings();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] flex items-center gap-2.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base text-[var(--text-muted)]">tune</span>
                        <span>Filter Preferences</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenPremium();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#8A6700] dark:text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center gap-2.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base text-[#B38600] dark:text-[#D4AF37]">
                          workspace_premium
                        </span>
                        <span>Membership Tier</span>
                      </button>

                      <div className="pt-1 border-t border-[var(--border)]">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 flex items-center gap-2.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">logout</span>
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Unauthenticated Visitor Actions */
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2 py-1 min-[360px]:px-2.5 min-[360px]:py-1.5 sm:px-3.5 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:border-[#D4AF37] text-[var(--text)] text-[11px] min-[360px]:text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                Log In
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn-primary text-[10px] min-[360px]:text-xs uppercase tracking-wider font-bold px-2 py-1 min-[360px]:px-3 min-[360px]:py-1.5 sm:px-4 rounded-lg text-[#1C1C1C] shadow-xs sm:shadow-md shadow-[#D4AF37]/20 cursor-pointer whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  );
};
