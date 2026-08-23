import React from 'react';
import { motion } from 'motion/react';
import { Opportunity, ActiveTab } from '../types';

interface SavedOpportunitiesProps {
  opportunities: Opportunity[];
  onToggleSave: (id: string) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const SavedOpportunities: React.FC<SavedOpportunitiesProps> = ({
  opportunities,
  onToggleSave,
  onSelectOpportunity,
  setActiveTab
}) => {
  const savedOpportunities = opportunities.filter((o) => o.isSaved);

  return (
    <div className="w-full pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xs">
              bookmark
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
              Saved Collection ({savedOpportunities.length})
            </span>
          </div>
          <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] tracking-tight">
            Saved Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Track and prioritize your selected applications and upcoming deadlines.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {savedOpportunities.length === 0 ? (
        <div className="rounded-2xl p-8 sm:p-12 text-center border border-[var(--border)] bg-[var(--card-bg)] my-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 dark:bg-[#2A2A2A] flex items-center justify-center text-[#B38600] dark:text-[#D4AF37] mb-3">
            <span className="material-symbols-outlined text-3xl">bookmark_border</span>
          </div>
          <h3 className="font-poppins text-lg sm:text-xl font-bold text-[var(--text)] mb-2">
            No saved opportunities yet
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            Bookmark items from the dashboard to curate your personal target list.
          </p>
          <button
            onClick={() => setActiveTab('opportunities')}
            className="btn-primary text-xs uppercase tracking-wider font-bold px-7 py-3 rounded-xl cursor-pointer shadow-md"
          >
            Explore Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full">
          {savedOpportunities.map((opp, idx) => (
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

                {/* AI Rationale snippet */}
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

              {/* Action Buttons: [Remove from Saved] [Open] */}
              <div className="flex gap-2 pt-3 border-t border-[var(--border)] relative z-10">
                <button
                  onClick={() => onToggleSave(opp.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] hover:border-[#D4AF37] text-[var(--text-secondary)] hover:text-[#B38600] dark:hover:text-[#D4AF37] text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#B38600] dark:text-[#D4AF37]">
                    bookmark_remove
                  </span>
                  <span>Remove</span>
                </button>
                <button
                  onClick={() => onSelectOpportunity(opp)}
                  className="flex-1 py-2.5 px-4 rounded-xl btn-primary text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex justify-center items-center gap-1 cursor-pointer shadow-xs"
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
