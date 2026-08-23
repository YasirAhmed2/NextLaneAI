import React, { useState } from 'react';
import { Opportunity, UserProfile } from '../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  userProfile: UserProfile;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onToggleSave,
  userProfile
}) => {
  const [applied, setApplied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'ai_strategy'>('overview');

  if (!opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 min-[400px]:p-4 sm:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="gold-modal-frame relative w-full max-w-3xl max-h-[94vh] bg-[var(--card-bg)] rounded-2xl border border-[#D4AF37]/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--border)] flex justify-between items-start bg-[var(--bg-subtle)] gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#8A6700] dark:text-[#D4AF37] text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider">
                {opportunity.type}
              </span>
              {opportunity.deadlinePassed ? (
                <span className="missed-badge text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] sm:text-[13px]">event_busy</span>
                  Deadline Passed ({opportunity.deadline})
                </span>
              ) : (
                <span className="bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-secondary)] text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] sm:text-[13px] text-[#B38600] dark:text-[#D4AF37]">calendar_today</span>
                  Deadline: {opportunity.deadline}
                </span>
              )}
            </div>
            <h2 className="font-poppins text-lg sm:text-2xl font-bold text-[var(--text)] leading-snug">
              {opportunity.title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 truncate">
              <span className="text-[var(--text)] font-semibold">{opportunity.organization}</span> • {opportunity.location}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] p-1.5 rounded-full hover:bg-[var(--bg-hover)] transition-colors cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[var(--border)] bg-[var(--bg-subtle)] px-3 sm:px-6 text-[11px] sm:text-xs font-bold uppercase tracking-wider overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'text-[#B38600] dark:text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[var(--card-bg)]/60'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            Overview & Requirements
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'eligibility'
                ? 'text-[#B38600] dark:text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[var(--card-bg)]/60'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            Match Score ({opportunity.matchScore}%)
          </button>
          <button
            onClick={() => setActiveTab('ai_strategy')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'ai_strategy'
                ? 'text-[#B38600] dark:text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[var(--card-bg)]/60'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">auto_awesome</span>
            <span>AI Application Strategy</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-sm bg-[var(--card-bg)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] mb-2">
                  Program Description
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {opportunity.description}
                </p>
              </div>

              {opportunity.compensationOrGrant && (
                <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-2xl">
                      payments
                    </span>
                    <div>
                      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                        Compensation / Grant Package
                      </div>
                      <div className="text-sm font-bold text-[var(--text)]">
                        {opportunity.compensationOrGrant}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] mb-3">
                  Candidate Requirements & Expectations
                </h3>
                <ul className="space-y-2">
                  {opportunity.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[var(--text-secondary)]">
                      <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-base shrink-0 mt-0.5">
                        check
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Domain Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border)] text-xs font-medium text-[var(--text)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              {/* Score header */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#D4AF37] flex flex-col items-center justify-center bg-[var(--card-bg)] shadow-xs shrink-0">
                  <span className="font-poppins text-xl sm:text-2xl font-bold text-[#B38600] dark:text-[#D4AF37]">
                    {opportunity.matchScore}%
                  </span>
                </div>
                <div>
                  <h4 className="font-poppins text-base sm:text-lg font-bold text-[var(--text)]">
                    Deep Vector Alignment
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Your profile matches top-tier qualifications with strong skill matrix overlap.
                  </p>
                </div>
              </div>

              {/* Rationale explanation */}
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <div className="flex items-center gap-2 text-xs font-bold text-[#B38600] dark:text-[#D4AF37] uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-base">psychology</span>
                  <span>AI Matching Analysis</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {opportunity.aiMatchReason}
                </p>
              </div>

              {/* Vector Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Dimensional Match Ratios
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-[var(--text)]">Skill Matrix (PyTorch, Python, Algorithms)</span>
                      <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">95%</span>
                    </div>
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full w-[95%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-[var(--text)]">Academic Trajectory Alignment</span>
                      <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">92%</span>
                    </div>
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full w-[92%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-[var(--text)]">Deadline & Term Availability</span>
                      <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">90%</span>
                    </div>
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full w-[90%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai_strategy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <h4 className="font-poppins text-sm font-bold text-[#B38600] dark:text-[#D4AF37] mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  <span>Personalized Application Pitch Draft</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--card-bg)] p-3.5 rounded-lg border border-[var(--border)] shadow-xs">
                  "As an aspiring researcher with verified proficiencies in {userProfile.skills.join(', ')}, my recent exploratory work directly aligns with {opportunity.organization}'s mission in {opportunity.title}. I bring hands-on implementation rigor paired with disciplined empirical methodology..."
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Recommended Portfolio Highlights
                </h4>
                <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-base">check_circle</span>
                    <span>Emphasize your PyTorch model optimization and loss ablation benchmarks.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-base">check_circle</span>
                    <span>Attach a 1-page summary of your open-source repositories and hackathon builds.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--bg-subtle)] flex flex-col min-[480px]:flex-row justify-between items-center gap-3 sm:gap-4">
          <button
            onClick={() => onToggleSave(opportunity.id)}
            className={`w-full min-[480px]:w-auto py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              opportunity.isSaved
                ? 'bg-[#D4AF37]/15 text-[#8A6700] dark:text-[#D4AF37] border border-[#D4AF37]/40'
                : 'border border-[var(--border)] text-[var(--text)] hover:border-[#D4AF37] hover:text-[#B38600] bg-[var(--card-bg)]'
            }`}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: opportunity.isSaved ? "'FILL' 1" : "'FILL' 0" }}>
              {opportunity.isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
            <span>{opportunity.isSaved ? 'Saved in Portfolio' : 'Bookmark Opportunity'}</span>
          </button>

          <div className="flex items-center gap-3 w-full min-[480px]:w-auto">
            {applied ? (
              <div className="w-full min-[480px]:w-auto py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8A6700] dark:text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">task_alt</span>
                <span>Application Logged</span>
              </div>
            ) : (
              <button
                onClick={() => setApplied(true)}
                className="w-full min-[480px]:w-auto btn-primary py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer text-[#1C1C1C]"
              >
                <span>{opportunity.deadlinePassed ? 'Request Retrospective' : 'Start Application'}</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
