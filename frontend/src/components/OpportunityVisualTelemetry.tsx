import React from 'react';
import { Opportunity } from '../types';

interface OpportunityVisualTelemetryProps {
  opportunities: Opportunity[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  savedCount: number;
}

export const OpportunityVisualTelemetry: React.FC<OpportunityVisualTelemetryProps> = ({
  opportunities,
  activeFilter,
  onSelectFilter,
  savedCount
}) => {
  const totalCount = opportunities.length;
  const highMatchCount = opportunities.filter((o) => o.matchScore >= 90).length;

  const typeCounts = {
    all: totalCount,
    internship: opportunities.filter((o) => o.type.toLowerCase().includes('internship') || o.type.toLowerCase().includes('fellowship')).length,
    scholarship: opportunities.filter((o) => o.type.toLowerCase().includes('scholarship') || o.type.toLowerCase().includes('grant')).length,
    hackathon: opportunities.filter((o) => o.type.toLowerCase().includes('hackathon') || o.type.toLowerCase().includes('residency')).length
  };

  return (
    <div className="w-full mb-6 space-y-4">
      {/* 3 Focused, Non-Redundant Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Metric 1: Analyzed Feeds */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Active Feeds
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--text)]">
                {totalCount}
              </span>
              <span className="text-[11px] text-[#B38600] dark:text-[#D4AF37] font-semibold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span> Live Stream
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#B38600] dark:text-[#D4AF37]">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              radar
            </span>
          </div>
        </div>

        {/* Metric 2: Prime Matches (≥90%) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Prime Alignment (≥90%)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-poppins text-2xl sm:text-3xl font-bold text-[#B38600] dark:text-[#D4AF37]">
                {highMatchCount}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                top-tier fits
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#B38600] dark:text-[#D4AF37]">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
        </div>

        {/* Metric 3: Target Portfolio */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Target Portfolio
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-poppins text-2xl sm:text-3xl font-bold text-[var(--text)]">
                {savedCount}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                bookmarked
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#B38600] dark:text-[#D4AF37]">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              bookmark
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (No clutter, pure gold & obsidian highlight) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onSelectFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#D4AF37] text-[#1C1C1C] font-bold shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>All Pathways</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 font-bold">
              {typeCounts.all}
            </span>
          </button>

          <button
            onClick={() => onSelectFilter('internship')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'internship'
                ? 'bg-[#D4AF37] text-[#1C1C1C] font-bold shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Internships & Fellowships</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 font-bold">
              {typeCounts.internship}
            </span>
          </button>

          <button
            onClick={() => onSelectFilter('scholarship')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'scholarship'
                ? 'bg-[#D4AF37] text-[#1C1C1C] font-bold shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Grants & Awards</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 font-bold">
              {typeCounts.scholarship}
            </span>
          </button>

          <button
            onClick={() => onSelectFilter('hackathon')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'hackathon'
                ? 'bg-[#D4AF37] text-[#1C1C1C] font-bold shadow-xs'
                : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>Residencies & Labs</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/15 font-bold">
              {typeCounts.hackathon}
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium px-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
          <span>Vector stream calibrated</span>
        </div>
      </div>
    </div>
  );
};
