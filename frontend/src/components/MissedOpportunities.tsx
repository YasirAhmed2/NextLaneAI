import React from 'react';
import { motion } from 'motion/react';
import { Opportunity } from '../types';

interface MissedOpportunitiesProps {
  missedOpportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
}

export const MissedOpportunities: React.FC<MissedOpportunitiesProps> = ({
  missedOpportunities,
  onSelectOpportunity
}) => {
  return (
    <div className="w-full pb-20 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xs">
              history
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
              Historical Retrospective
            </span>
          </div>
          <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] tracking-tight">
            Opportunities You Could Have Applied To
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Valuable programs and cycles that closed before you calibrated your profile. Use these insights to get primed for upcoming application rounds.
          </p>
        </div>
      </div>

      {/* Grid of Missed Opportunities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 w-full">
        {missedOpportunities.map((opp, idx) => (
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
              {/* Header row */}
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
                  <span className="text-xs font-bold text-[#B38600] dark:text-[#D4AF37]">
                    Match: {opp.matchScore}%
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2
                onClick={() => onSelectOpportunity(opp)}
                className="font-poppins text-lg font-bold text-[var(--text)] mb-2 group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-2 leading-snug"
              >
                {opp.title}
              </h2>

              {/* Deadline (past) */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
                <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">
                  schedule
                </span>
                <span>Deadline: <strong className="text-[var(--text)]">{opp.deadline}</strong> (Closed)</span>
              </div>

              {/* Reason why eligible */}
              <div className="bg-[var(--bg-subtle)] border border-[#D4AF37]/20 dark:border-[#D4AF37]/20 rounded-xl p-3.5 mb-4 flex flex-col gap-1 group-hover:border-[#D4AF37]/40 transition-colors">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    insights
                  </span>
                  <span>Reason why eligible:</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                  "{opp.aiMatchReason}"
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-between items-center z-10 pt-3 border-t border-[var(--border)]">
              <div className="text-[11px] font-semibold text-[var(--text-muted)]">
                Next intake cycle expected soon
              </div>

              <button
                onClick={() => onSelectOpportunity(opp)}
                className="py-2 px-4 rounded-xl bg-[var(--bg-subtle)] hover:bg-[#D4AF37]/20 hover:text-[#8A6700] dark:hover:text-[#D4AF37] border border-[var(--border)] text-[var(--text)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Details</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
