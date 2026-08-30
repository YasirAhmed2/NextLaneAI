import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Opportunity, UserProfile } from '../types';
import { VisualScoreArc } from './VisualScoreArc';

interface OpportunitiesFeedProps {
  opportunities: Opportunity[];
  onToggleSave: (id: string) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  searchQuery: string;
  userProfile: UserProfile;
  isAuthenticated?: boolean;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onRefreshAgent?: () => void;
  isRefreshing?: boolean;
  onAutoApply?: (opp: Opportunity) => void;
}

export const OpportunitiesFeed: React.FC<OpportunitiesFeedProps> = ({
  opportunities,
  onToggleSave,
  onSelectOpportunity,
  searchQuery,
  userProfile,
  isAuthenticated = false,
  onOpenAuth,
  onRefreshAgent,
  isRefreshing = false,
  onAutoApply,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleSaveClick = (id: string) => {
    if (!isAuthenticated && onOpenAuth) {
      onOpenAuth('login');
      return;
    }
    onToggleSave(id);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    // Category filter
    if (selectedFilter !== 'all') {
      const typeLower = opp.type.toLowerCase();
      if (selectedFilter === 'internship' && !typeLower.includes('internship') && !typeLower.includes('fellowship')) return false;
      if (selectedFilter === 'scholarship' && !typeLower.includes('scholarship') && !typeLower.includes('grant')) return false;
      if (selectedFilter === 'hackathon' && !typeLower.includes('hackathon') && !typeLower.includes('residency')) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchOrg = opp.organization.toLowerCase().includes(q);
      const matchSource = opp.source?.toLowerCase().includes(q);
      const matchTags = opp.tags.some((t) => t.toLowerCase().includes(q));
      const matchReason = opp.aiMatchReason.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchSource && !matchTags && !matchReason) return false;
    }

    return true;
  });

  const categories = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'internship', label: 'Internships' },
    { id: 'scholarship', label: 'Scholarships' },
    { id: 'hackathon', label: 'Hackathons' }
  ];

  const uniqueSources = Array.from(new Set(opportunities.map((o) => o.source).filter(Boolean)));

  // Simulated agent execution steps when isRefreshing is true
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  React.useEffect(() => {
    if (isRefreshing) {
      setCurrentStep(1);
      const t1 = setTimeout(() => setCurrentStep(2), 900);
      const t2 = setTimeout(() => setCurrentStep(3), 1800);
      const t3 = setTimeout(() => setCurrentStep(4), 2700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setCurrentStep(1);
    }
  }, [isRefreshing]);

  const stepLabels = [
    "Step 1: Agent analyzing your profile...",
    "Step 2: Agent collecting opportunities from sources...",
    "Step 3: Agent matching and prioritizing...",
    "Step 4: Preparing results..."
  ];

  return (
    <div className="w-full pb-20">
      {/* Visual Agent Execution Steps Modal / Bar when isRefreshing */}
      {isRefreshing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-5 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37] shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-2xl animate-spin">
                sync
              </span>
              <div>
                <h3 className="font-poppins text-sm font-bold text-[var(--text)]">
                  Autonomous Agent Pipeline Active
                </h3>
                <p className="text-xs text-[#B38600] dark:text-[#D4AF37] font-semibold mt-0.5">
                  {stepLabels[currentStep - 1]}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#B38600] dark:text-[#D4AF37]">
              Step {currentStep} of 4
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden border border-[#D4AF37]/30">
            <motion.div
              className="bg-gradient-to-r from-[#B38600] via-[#D4AF37] to-[#F5D77F] h-full rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: `${currentStep * 25}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 text-[11px] font-semibold text-[var(--text-secondary)]">
            <div className={`p-2 rounded-xl border transition-all ${currentStep >= 1 ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[var(--text)] font-bold' : 'border-[var(--border)] opacity-50'}`}>
              1. Profile Analysis
            </div>
            <div className={`p-2 rounded-xl border transition-all ${currentStep >= 2 ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[var(--text)] font-bold' : 'border-[var(--border)] opacity-50'}`}>
              2. Live Scraper Run
            </div>
            <div className={`p-2 rounded-xl border transition-all ${currentStep >= 3 ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[var(--text)] font-bold' : 'border-[var(--border)] opacity-50'}`}>
              3. AI Match & Rank
            </div>
            <div className={`p-2 rounded-xl border transition-all ${currentStep >= 4 ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[var(--text)] font-bold' : 'border-[var(--border)] opacity-50'}`}>
              4. Results Render
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-xl">travel_explore</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-poppins text-sm font-bold text-[var(--text)]">
                  Live Opportunity Discovery
                </span>
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#8A6700] dark:text-[#D4AF37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live Scrapers Active
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Fetching real-time authenticated opportunities from Devpost, Remotive, Unstop, Jobicy, and RemoteOK. Log in to personalize match scores.
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text)] hover:border-[#D4AF37] transition-all cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex-1 sm:flex-initial btn-primary text-xs uppercase tracking-wider font-bold px-4 py-1.5 rounded-xl text-[#1C1C1C] cursor-pointer shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}

      {/* Agent Summary Banner */}
      {opportunities.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 via-[var(--card-bg)] to-[var(--card-bg)] border border-[#D4AF37]/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[var(--text)]">
                Agent found {opportunities.length} live opportunities from {uniqueSources.length} sources
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {uniqueSources.map((src) => (
                  <span key={src} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-[#B38600] dark:text-[#D4AF37]">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {onRefreshAgent && (
            <button
              onClick={onRefreshAgent}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                autorenew
              </span>
              <span>{isRefreshing ? 'Scanning...' : 'Rescrape Live Data'}</span>
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xs">auto_awesome</span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
              {isAuthenticated
                ? `${userProfile.fullName || 'User Profile'} • ${userProfile.skills.length} Profile Skills`
                : 'Live Agent Pipeline • Real-Time Data'}
            </span>
          </div>
          <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] tracking-tight">
            {isAuthenticated ? 'Opportunities for You' : 'Live Opportunities Feed'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isAuthenticated
              ? 'Matched specifically to your verified skills, education, and target objectives'
              : 'Browse live verified hackathons, internships, and scholarships directly from official APIs'}
          </p>
        </div>
      </div>

      {/* Section 2: Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isActive = selectedFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3.5 py-2 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-[#1C1C1C] font-extrabold shadow-xs border border-[#C59B27]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-[var(--text-muted)] px-2 sm:px-3 font-semibold text-right sm:text-left">
          Showing <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">{filteredOpportunities.length}</span> results
        </div>
      </div>

      {/* Section 3: Opportunity Cards */}
      {filteredOpportunities.length === 0 ? (
        <div className="rounded-2xl p-8 sm:p-12 text-center border border-[var(--border)] bg-[var(--card-bg)] my-6">
          <span className="material-symbols-outlined text-4xl sm:text-5xl text-[#B38600] dark:text-[#D4AF37] opacity-80 mb-3">
            search_off
          </span>
          <h3 className="font-poppins text-lg sm:text-xl font-bold text-[var(--text)] mb-2">
            No live opportunities fetched
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Click the button below to trigger the Autonomous Agent Scraper and collect live opportunities from Devpost, Remotive, and Unstop.
          </p>
          {onRefreshAgent && (
            <button
              onClick={onRefreshAgent}
              disabled={isRefreshing}
              className="btn-primary text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Run Agent Scrapers Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full">
          {filteredOpportunities.map((opp, idx) => (
            <motion.article
              key={opp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="gold-glitter-card rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all shadow-xs group"
            >
              {/* Top-right shimmer accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex flex-col flex-1">
                {/* Company Legitimacy Badge */}
                {opp.companyLegitimacy && (
                  <div className="mb-2 flex items-center justify-between gap-2 px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-emerald-500/30 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span className="font-bold">{opp.companyLegitimacy.status}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {opp.companyLegitimacy.trustScore}% Trust Score
                    </span>
                  </div>
                )}

                {/* Priority Level Tag */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/20 text-[#8A6700] dark:text-[#D4AF37] border border-[#D4AF37]/40">
                    {opp.priorityLevel || (opp.matchScore >= 90 ? 'High Priority — Top Match' : 'Medium Priority')}
                  </span>
                  {opp.source && (
                    <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                      {opp.source}
                    </span>
                  )}
                </div>

                {/* Header row: Organization | Category and Match Score */}
                <div className="flex justify-between items-start gap-3 mb-2.5">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#B38600] dark:text-[#D4AF37]">
                      {opp.organization} <span className="text-[var(--text-muted)]">|</span> {opp.type}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 dark:bg-[#2A2A2A] border border-[#D4AF37]/40 px-2.5 py-1 rounded-xl shrink-0">
                    <span className="text-xs font-black text-[#B38600] dark:text-[#D4AF37]">
                      Match: {opp.matchScore}%
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectOpportunity(opp)}
                  className="font-poppins text-lg font-bold text-[var(--text)] mb-2 group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-2 leading-snug"
                >
                  {opp.title}
                </h3>

                {/* Deadline & Location */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">
                      event
                    </span>
                    <span>Deadline: <strong className="text-[var(--text)]">{opp.deadline}</strong></span>
                  </div>
                  {opp.location && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">
                        location_on
                      </span>
                      <span>{opp.location}</span>
                    </div>
                  )}
                </div>

                {/* Compensation / Grant */}
                {opp.compensationOrGrant && (
                  <div className="mb-3 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-xs font-bold text-[#B38600] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    <span>{opp.compensationOrGrant}</span>
                  </div>
                )}

                {/* Decision Reason (AI-generated) */}
                <div className="bg-[var(--bg-subtle)] border border-[#D4AF37]/20 rounded-xl p-3.5 mb-4 flex flex-col gap-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <span>Decision Reason:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    "{opp.aiMatchReason}"
                  </p>
                </div>
              </div>

              {/* Action Buttons: [Save] [Auto-Apply] [Portal] */}
              <div className="relative z-10 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => handleSaveClick(opp.id)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-1 transition-colors cursor-pointer border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[#D4AF37] hover:text-[#B38600] dark:hover:text-[#D4AF37]"
                  title={opp.isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: opp.isSaved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {opp.isSaved ? 'bookmark' : 'bookmark_border'}
                  </span>
                </button>

                {onAutoApply && !opp.deadlinePassed && (
                  <button
                    onClick={() => onAutoApply(opp)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-slate-950 font-poppins font-black text-xs uppercase tracking-wider flex justify-center items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    <span>Auto-Apply</span>
                  </button>
                )}

                <a
                  href={opp.url && typeof opp.url === 'string' && opp.url.startsWith('http') ? opp.url : (opp.url || 'https://devpost.com')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="py-2 px-3 rounded-xl btn-primary text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex justify-center items-center gap-1 cursor-pointer shadow-xs font-bold text-[#1C1C1C]"
                  title="Open Official Application Portal"
                >
                  <span>Portal</span>
                  <span className="material-symbols-outlined text-sm font-bold">open_in_new</span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};
