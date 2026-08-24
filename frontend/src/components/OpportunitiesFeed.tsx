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

  return (
    <div className="w-full pb-20">
      {/* Section 1: Header */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-xl">play_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-poppins text-sm font-bold text-[var(--text)]">
                  Public Sample Demo
                </span>
                <span className="text-[10px] bg-[#D4AF37]/20 text-[#8A6700] dark:text-[#D4AF37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Sample Data
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Previewing curated listings. Create your account or sign in to calculate matches with your actual skills and save opportunities.
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xs">auto_awesome</span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
              {isAuthenticated
                ? `${userProfile.fullName || 'User Profile'} • ${userProfile.skills.length} Profile Skills`
                : 'Demo Pipeline • Sample Profile'}
            </span>
          </div>
          <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] tracking-tight">
            {isAuthenticated ? 'Opportunities for You' : 'Curated Opportunities Feed'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            {isAuthenticated
              ? 'Matched specifically to your verified skills, education, and target objectives'
              : 'Browse high-impact grants, internships, and hackathons'}
          </p>
        </div>

        {onRefreshAgent && (
          <button
            onClick={onRefreshAgent}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title="Trigger autonomous scraping & AI recalculation"
          >
            <span className={`material-symbols-outlined text-base ${isRefreshing ? 'animate-spin' : ''}`}>
              autorenew
            </span>
            <span>{isRefreshing ? 'Agent Scanning...' : 'Refresh AI Feed'}</span>
          </button>
        )}
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
            No matching opportunities found
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Try adjusting your search query or selecting "All Opportunities" to explore all available listings.
          </p>
          <button
            onClick={() => setSelectedFilter('all')}
            className="btn-primary text-xs uppercase tracking-wider font-bold px-6 py-2.5 rounded-xl cursor-pointer"
          >
            Reset Filter
          </button>
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
              {/* Subtle top-right golden shimmer accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex flex-col flex-1">
                {/* Header row: Organization | Category, Source, and Match Score */}
                <div className="flex justify-between items-start gap-3 mb-2.5">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#B38600] dark:text-[#D4AF37]">
                      {opp.organization} <span className="text-[var(--text-muted)]">|</span> {opp.type}
                    </div>
                    {opp.source && (
                      <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                        <span>Source:</span>
                        <span className="text-[var(--text)]">{opp.source}</span>
                      </div>
                    )}
                  </div>

                  {/* Match Score highlighted */}
                  <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 dark:bg-[#2A2A2A] border border-[#D4AF37]/30 dark:border-[#D4AF37]/40 px-2.5 py-1 rounded-xl shrink-0 group-hover:border-[#D4AF37]/70 transition-colors">
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

                {/* Deadline */}
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
                  <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">
                    event
                  </span>
                  <span>Deadline: <strong className="text-[var(--text)]">{opp.deadline}</strong></span>
                </div>

                {/* Explanation (AI-generated) - visible */}
                <div className="bg-[var(--bg-subtle)] border border-[#D4AF37]/20 dark:border-[#D4AF37]/20 rounded-xl p-3.5 mb-4 flex flex-col gap-1 group-hover:border-[#D4AF37]/40 transition-colors">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                    <span>Reason:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    "{opp.aiMatchReason}"
                  </p>
                </div>
              </div>

              {/* Action Buttons: [Save] [Open / Details] */}
              <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => handleSaveClick(opp.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 transition-colors cursor-pointer ${
                    opp.isSaved
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#8A6700] dark:text-[#D4AF37]'
                      : 'border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[#D4AF37] hover:text-[#B38600] dark:hover:text-[#D4AF37]'
                  }`}
                  title={opp.isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: opp.isSaved ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {opp.isSaved ? 'bookmark' : 'bookmark_border'}
                  </span>
                  <span>{opp.isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => onSelectOpportunity(opp)}
                  className="flex-1 py-2.5 px-4 rounded-xl btn-primary text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex justify-center items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open</span>
                  <span className="material-symbols-outlined text-sm font-bold">open_in_new</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};
