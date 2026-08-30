/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, AuthUser, Opportunity, UserProfile } from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_OPPORTUNITIES,
  MISSED_OPPORTUNITIES,
  PATHWAY_MILESTONES,
  INITIAL_NOTIFICATIONS
} from './data/mockOpportunities';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { HeroLanding } from './components/HeroLanding';
import { ProfileInitialization } from './components/ProfileInitialization';
import { OpportunitiesFeed } from './components/OpportunitiesFeed';
import { SavedOpportunities } from './components/SavedOpportunities';
import { MissedOpportunities } from './components/MissedOpportunities';
import { PathwaysView } from './components/PathwaysView';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { UrgentDeadlineModal } from './components/UrgentDeadlineModal';
import { AutoApplyAgentModal } from './components/AutoApplyAgentModal';
import { PremiumModal } from './components/PremiumModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthView } from './components/AuthView';
import { authService } from './services/authService';
import { opportraService } from './services/opportraService';
import { isUrgentUnder24h } from './utils/requirementUtils';

const EMPTY_USER_PROFILE: UserProfile = {
  fullName: '',
  educationLevel: 'undergrad',
  skills: [],
  targetObjectives: ['internships', 'scholarships', 'hackathons'],
  tier: 'Standard Tier',
  isProfileComplete: false
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');

  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nextlane_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(EMPTY_USER_PROFILE);

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('nextlane_opportunities');
    return saved ? JSON.parse(saved) : INITIAL_OPPORTUNITIES;
  });

  const [missedOpportunities] = useState<Opportunity[]>(MISSED_OPPORTUNITIES);
  const [milestones] = useState(PATHWAY_MILESTONES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isAgentRefreshing, setIsAgentRefreshing] = useState(false);

  // Urgent 24h & Auto-Apply Agent States
  const [isUrgentModalDismissed, setIsUrgentModalDismissed] = useState<boolean>(false);
  const [autoApplyTarget, setAutoApplyTarget] = useState<Opportunity | null>(null);

  const [appliedIds, setAppliedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nextlane_applied_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync theme to document element, body and localStorage
  useEffect(() => {
    localStorage.setItem('nextlane_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;
    authService.checkSession().then((user) => {
      if (!isMounted) return;
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        if (user.profile) {
          setUserProfile({
            ...user.profile,
            fullName: user.profile.fullName || user.username,
            isProfileComplete: user.profileComplete ?? true
          });
        } else {
          setUserProfile({
            ...EMPTY_USER_PROFILE,
            fullName: user.username,
            isProfileComplete: user.profileComplete ?? false
          });
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setUserProfile(EMPTY_USER_PROFILE);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync opportunities to local storage
  useEffect(() => {
    localStorage.setItem('nextlane_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  // Auto-fetch live opportunities on mount if feed is empty
  useEffect(() => {
    if (opportunities.length === 0) {
      handleRefreshAgent();
    }
  }, []);

  // Autonomous Hourly Auto-Scraper (runs every 60 minutes)
  useEffect(() => {
    const HOURLY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
    const timer = setInterval(() => {
      console.info('[Autonomous Agent] Triggering hourly background scrape cycle...');
      handleRefreshAgent();
    }, HOURLY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [userProfile]);

  // Handle subtle discovery glow tracking mouse on desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth >= 768) {
        const glows = document.querySelectorAll<HTMLElement>('.discovery-glow');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        glows.forEach((glow, index) => {
          const factor = index % 2 === 0 ? 12 : -12;
          glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser, isNewRegistration?: boolean) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAuthModalOpen(false);

    if (user.profile) {
      setUserProfile({
        ...user.profile,
        fullName: user.profile.fullName || user.username,
        isProfileComplete: user.profileComplete ?? true
      });
    } else {
      setUserProfile({
        ...EMPTY_USER_PROFILE,
        fullName: user.username,
        isProfileComplete: false
      });
    }

    if (isNewRegistration || !user.profileComplete) {
      setActiveTab('profile_init');
    } else {
      setActiveTab('opportunities');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserProfile(EMPTY_USER_PROFILE);
    setOpportunities((prev) => prev.map((o) => ({ ...o, isSaved: false })));
    setActiveTab('landing');
  };

  const handleTabChange = (tab: ActiveTab) => {
    // Route guarding for protected tabs
    if (!isAuthenticated) {
      if (tab === 'saved' || tab === 'history' || tab === 'profile_init' || tab === 'pathways') {
        handleOpenAuth('login');
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleToggleSave = (id: string) => {
    if (!isAuthenticated) {
      handleOpenAuth('login');
      return;
    }
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, isSaved: !opp.isSaved } : opp))
    );
    if (selectedOpportunity && selectedOpportunity.id === id) {
      setSelectedOpportunity((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : null));
    }
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkApplied = (oppId: string) => {
    setAppliedIds((prev) => {
      const next = prev.includes(oppId) ? prev.filter((id) => id !== oppId) : [...prev, oppId];
      localStorage.setItem('nextlane_applied_ids', JSON.stringify(next));
      return next;
    });
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    authService.saveProfile(newProfile);
    
    // Call FastAPI AI Agent matching
    try {
      const liveMatched = await opportraService.matchAll(newProfile);
      setOpportunities(liveMatched);

      // Trigger 24-hour deadline reminder sentry check if user email is active
      const userEmail = currentUser?.email || (userProfile as any).email;
      if (userEmail) {
        const reminderRes = await opportraService.checkDeadlineReminders(
          userEmail,
          newProfile.fullName || currentUser?.username || 'User',
          liveMatched,
          appliedIds
        );
        if (reminderRes.reminderSent) {
          setNotifications((prev) => [
            {
              id: `notif-${Date.now()}`,
              title: '🚨 Deadline Alert Dispatched',
              description: reminderRes.message || 'Urgent 24h deadline reminder sent to your inbox.',
              time: 'Just now',
              read: false,
              type: 'match'
            },
            ...prev
          ]);
        }
      }
    } catch (err) {
      console.warn('Match calculation warning:', err);
    }
  };

  const handleRefreshAgent = async () => {
    setIsAgentRefreshing(true);
    try {
      await opportraService.runAgent();
      const updated = await opportraService.matchAll(userProfile);
      setOpportunities(updated);

      // Check deadline reminders
      const userEmail = currentUser?.email || (userProfile as any).email;
      if (userEmail) {
        await opportraService.checkDeadlineReminders(
          userEmail,
          userProfile.fullName || currentUser?.username || 'User',
          updated,
          appliedIds
        );
      }

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'Opportunity Pipeline Refreshed',
          description: 'AI agent completed autonomous discovery & scoring cycle with real listings.',
          time: 'Just now',
          read: false,
          type: 'match'
        },
        ...prev
      ]);
    } catch (err) {
      console.warn('Agent refresh error:', err);
    } finally {
      setIsAgentRefreshing(false);
    }
  };

  const savedCount = opportunities.filter((o) => o.isSaved).length;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-inter flex flex-col antialiased selection:bg-[#D4AF37] selection:text-[#1C1C1C] transition-colors duration-200">
      {/* Collapsible Slide-Out Sidebar Drawer */}
      <SideNavBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        savedCount={savedCount}
        userProfile={userProfile}
        onOpenSettings={() => {
          if (!isAuthenticated) {
            handleOpenAuth('login');
          } else {
            setIsSettingsOpen(true);
          }
        }}
        onOpenPremium={() => setIsPremiumOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Universal Top Navigation Bar */}
      <TopNavBar
        isAuthenticated={isAuthenticated}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        savedCount={savedCount}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userProfile={userProfile}
        onOpenSettings={() => {
          if (!isAuthenticated) {
            handleOpenAuth('login');
          } else {
            setIsSettingsOpen(true);
          }
        }}
        onOpenPremium={() => setIsPremiumOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <div className={`flex-1 w-full max-w-full overflow-x-hidden pt-14 sm:pt-16 ${activeTab !== 'landing' ? 'pb-12' : ''}`}>
        <main className="w-full max-w-[1600px] mx-auto px-2.5 min-[400px]:px-4 sm:px-6 lg:px-10 py-3 sm:py-6 transition-all duration-200 overflow-x-hidden">
          {activeTab === 'landing' && (
            <HeroLanding
              onGetStarted={() => {
                if (!isAuthenticated) {
                  handleOpenAuth('register');
                } else if (!userProfile.isProfileComplete) {
                  setActiveTab('profile_init');
                } else {
                  setActiveTab('opportunities');
                }
              }}
              setActiveTab={handleTabChange}
              theme={theme}
            />
          )}

          {activeTab === 'profile_init' && (
            <ProfileInitialization
              userProfile={userProfile}
              onSaveProfile={handleSaveProfile}
              onComplete={() => setActiveTab('opportunities')}
              theme={theme}
            />
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesFeed
              opportunities={opportunities}
              onToggleSave={handleToggleSave}
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              searchQuery={searchQuery}
              userProfile={userProfile}
              isAuthenticated={isAuthenticated}
              onOpenAuth={handleOpenAuth}
              onRefreshAgent={handleRefreshAgent}
              isRefreshing={isAgentRefreshing}
              onAutoApply={(opp) => setAutoApplyTarget(opp)}
            />
          )}

          {activeTab === 'saved' && (
            <SavedOpportunities
              opportunities={opportunities}
              onToggleSave={handleToggleSave}
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === 'history' && (
            <MissedOpportunities
              missedOpportunities={missedOpportunities}
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            />
          )}

          {activeTab === 'pathways' && (
            <PathwaysView
              milestones={milestones}
              opportunities={opportunities}
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* 24-Hour Urgent Deadline Popup Alert — Triggers ONLY inside Dashboard after Login for REAL Scraped Items */}
      {isAuthenticated && activeTab === 'opportunities' && !isUrgentModalDismissed && opportunities.filter((o) => !appliedIds.includes(o.id) && isUrgentUnder24h(o)).length > 0 && (
        <UrgentDeadlineModal
          urgentOpportunities={opportunities.filter((o) => !appliedIds.includes(o.id) && isUrgentUnder24h(o))}
          onClose={() => setIsUrgentModalDismissed(true)}
          onAutoApply={(opp) => {
            setIsUrgentModalDismissed(true);
            setAutoApplyTarget(opp);
          }}
          onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
        />
      )}

      {/* Auto-Apply Autonomous AI Agent Modal */}
      {autoApplyTarget && (
        <AutoApplyAgentModal
          opportunity={autoApplyTarget}
          userProfile={userProfile}
          onClose={() => setAutoApplyTarget(null)}
          onCompleteApply={(oppId) => {
            handleMarkApplied(oppId);
            if (autoApplyTarget) {
              setNotifications((prev) => [
                {
                  id: `notif-${Date.now()}`,
                  title: '⚡ Auto-Apply Agent Complete',
                  description: `Successfully auto-applied to ${autoApplyTarget.title} at ${autoApplyTarget.organization}`,
                  time: 'Just now',
                  read: false,
                  type: 'match'
                },
                ...prev
              ]);
            }
          }}
        />
      )}

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onToggleSave={handleToggleSave}
        userProfile={userProfile}
        onMarkApplied={handleMarkApplied}
        isApplied={selectedOpportunity ? appliedIds.includes(selectedOpportunity.id) : false}
        onAutoApply={(opp) => setAutoApplyTarget(opp)}
      />

      {/* Premium Membership Modal */}
      <PremiumModal
        isOpen={isPremiumOpen}
        onClose={() => setIsPremiumOpen(false)}
        userProfile={userProfile}
        onUpgradeSuccess={() => {
          setUserProfile((prev) => ({ ...prev, tier: 'Elite Diamond' }));
          setNotifications((prev) => [
            {
              id: `notif-${Date.now()}`,
              title: 'Elite Tier Activated',
              description: 'Real-time deadline sniper and automated proposal synthesizer unlocked.',
              time: 'Just now',
              read: false,
              type: 'system'
            },
            ...prev
          ]);
        }}
      />

      {/* User Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Authentication Modal */}
      {authModalOpen && (
        <AuthView
          initialMode={authModalMode}
          onAuthSuccess={handleAuthSuccess}
          onCancel={() => setAuthModalOpen(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
