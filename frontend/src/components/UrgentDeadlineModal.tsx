import React, { useState } from 'react';
import { Opportunity } from '../types';
import { getRemainingDeadlineHours, isScholarshipType, filterRequirements } from '../utils/requirementUtils';

interface UrgentDeadlineModalProps {
  urgentOpportunities: Opportunity[];
  onClose: () => void;
  onAutoApply: (opportunity: Opportunity) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

export const UrgentDeadlineModal: React.FC<UrgentDeadlineModalProps> = ({
  urgentOpportunities,
  onClose,
  onAutoApply,
  onSelectOpportunity,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urgentOpportunities || urgentOpportunities.length === 0) return null;

  const activeOpp = urgentOpportunities[currentIndex] || urgentOpportunities[0];
  const totalCount = urgentOpportunities.length;
  const remainingHours = getRemainingDeadlineHours(activeOpp) ?? 14.5;

  const isScholarship = isScholarshipType(activeOpp.type);
  const displayRequirements = filterRequirements(activeOpp.requirements, activeOpp.type);

  const hoursInt = Math.floor(remainingHours);
  const minsInt = Math.round((remainingHours - hoursInt) * 60);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCount);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="gold-modal-frame relative w-full max-w-2xl bg-[var(--card-bg)] rounded-2xl border-2 border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Animated Banner Top */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white p-3.5 sm:p-4 px-4 sm:px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
              alarm
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-200 block leading-tight">
                Critical Deadline Sentry Alert
              </span>
              <h3 className="font-poppins font-black text-sm sm:text-base leading-tight">
                Opportunity Closing in &lt; 24 Hours!
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            title="Close Alert"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 bg-[var(--card-bg)] overflow-y-auto max-h-[80vh]">
          
          {/* Urgency Counter Badge & Opp Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-red-600 dark:text-red-400">
                {hoursInt}h {minsInt}m Remaining to Apply
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold bg-[#D4AF37]/15 text-[#8A6700] dark:text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full">
              {activeOpp.matchScore}% Match Score
            </span>
          </div>

          {/* Opportunity Header Details */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#8A6700] dark:text-[#D4AF37] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {activeOpp.type}
              </span>
              {activeOpp.source && (
                <span className="text-[10px] text-[var(--text-muted)] font-semibold">
                  Source: {activeOpp.source}
                </span>
              )}
            </div>

            <h2 className="font-poppins text-lg sm:text-xl font-bold text-[var(--text)] leading-snug">
              {activeOpp.title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-medium">
              {activeOpp.organization} • {activeOpp.location}
            </p>
          </div>

          {/* Description Snippet */}
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border)]">
            {activeOpp.description}
          </p>

          {/* Highlights & Verified Requirements */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A6700] dark:text-[#D4AF37] block">
              Key Requirements
            </span>
            <div className="space-y-1.5">
              {displayRequirements.slice(0, 3).map((req, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text)]">
                  <span className="material-symbols-outlined text-sm text-emerald-500 shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Award / Compensation */}
          {activeOpp.compensationOrGrant && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <span className="material-symbols-outlined text-base">payments</span>
              <span>Reward: {activeOpp.compensationOrGrant}</span>
            </div>
          )}

          {/* Multi-Opportunity Switcher (if > 1) */}
          {totalCount > 1 && (
            <div className="flex items-center justify-between pt-1 text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
              <span>Urgent Opportunity {currentIndex + 1} of {totalCount}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text)] cursor-pointer"
                  title="Previous"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text)] cursor-pointer"
                  title="Next"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-[var(--bg-subtle)] border-t border-[var(--border)] flex flex-col sm:flex-row gap-2.5 justify-end">
          <button
            onClick={() => {
              onClose();
              onSelectOpportunity(activeOpp);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-center"
          >
            View Details
          </button>

          <button
            onClick={() => {
              onClose();
              onAutoApply(activeOpp);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#B38600] text-slate-950 font-poppins font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span>Auto-Apply with AI Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
