import React, { useState, useEffect } from 'react';
import { Opportunity, UserProfile } from '../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  userProfile: UserProfile;
  onMarkApplied?: (id: string) => void;
  isApplied?: boolean;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onToggleSave,
  userProfile,
  onMarkApplied,
  isApplied = false,
}) => {
  const [applied, setApplied] = useState<boolean>(isApplied);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'eligibility' | 'ai_strategy' | 'apply_assistant'>('overview');

  useEffect(() => {
    if (opportunity) {
      const storedApplied = localStorage.getItem(`nextlane_applied_${opportunity.id}`);
      setApplied(Boolean(storedApplied) || isApplied);
    }
  }, [opportunity, isApplied]);

  if (!opportunity) return null;

  // Matching skills calculation
  const matchingSkills = userProfile.skills.filter((skill) =>
    opportunity.requirements.some((r) => r.toLowerCase().includes(skill.toLowerCase())) ||
    opportunity.description.toLowerCase().includes(skill.toLowerCase()) ||
    (opportunity.tags || []).some((t) => t.toLowerCase().includes(skill.toLowerCase()))
  );

  // Dynamic tailored pitch generated specifically for this opportunity and this user
  const skillsList = matchingSkills.length > 0 ? matchingSkills.join(', ') : (userProfile.skills.slice(0, 3).join(', ') || 'software development');
  const tailoredPitch = `Dear ${opportunity.organization} Selection Committee,\n\nI am writing to express my strong enthusiasm for the ${opportunity.title}. As an enrolled student in ${userProfile.educationLevel} studies with verified competencies in ${skillsList}, my technical foundation and project portfolio align directly with your stated requirements.\n\nThroughout my hands-on coursework and practical builds, I have focused on building robust, scalable solutions and collaborating effectively within team environments. I am eager to bring this disciplined work ethic, rapid learning ability, and dedication to ${opportunity.organization}.\n\nThank you for your consideration.\n\nSincerely,\n${userProfile.fullName || 'Candidate'}`;

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(tailoredPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleToggleApplied = () => {
    const newState = !applied;
    setApplied(newState);
    if (newState) {
      localStorage.setItem(`nextlane_applied_${opportunity.id}`, 'true');
      if (onMarkApplied) onMarkApplied(opportunity.id);
    } else {
      localStorage.removeItem(`nextlane_applied_${opportunity.id}`);
    }
  };

  const openPortalUrl = () => {
    if (opportunity.url) {
      window.open(opportunity.url, '_blank', 'noopener,noreferrer');
    }
  };

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

              {opportunity.urgent24h && (
                <span className="bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-400 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[13px]">alarm</span>
                  Closing in &lt;24h
                </span>
              )}

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

              {opportunity.source && (
                <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Verified by {opportunity.source}
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
            title="Close"
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
            Overview & Scope
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'eligibility'
                ? 'text-[#B38600] dark:text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[var(--card-bg)]/60'
                : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
            }`}
          >
            AI Match Score ({opportunity.matchScore}%)
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
            <span>AI Strategy & Pitch</span>
          </button>
          <button
            onClick={() => setActiveTab('apply_assistant')}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'apply_assistant'
                ? 'text-[#B38600] dark:text-[#D4AF37] border-b-2 border-[#D4AF37] bg-[var(--card-bg)]/60'
                : 'text-[#B38600] dark:text-[#D4AF37] hover:opacity-80'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">bolt</span>
            <span>Fast Apply Form</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 text-sm bg-[var(--card-bg)]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] mb-2">
                  Opportunity Summary
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {opportunity.description || 'Join this verified high-impact opportunity to accelerate your technical expertise.'}
                </p>
              </div>

              {opportunity.compensationOrGrant && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-lg sm:text-xl shrink-0 mt-0.5">
                    payments
                  </span>
                  <div>
                    <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Compensation / Award Value
                    </span>
                    <span className="font-poppins font-bold text-sm sm:text-base text-[var(--text)]">
                      {opportunity.compensationOrGrant}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] mb-3">
                  Verified Requirements
                </h3>
                <div className="space-y-2">
                  {opportunity.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                      <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {opportunity.tags && opportunity.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    Indexed Opportunity Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ELIGIBILITY & MATCH SCORE */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-base">psychology</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37]">
                    Gemini AI Matching Rationale
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed">
                  {opportunity.aiMatchReason}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Eligibility Breakdown for {userProfile.fullName || 'You'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-[var(--text)]">Core Technical Skill Overlap</span>
                      <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">
                        {opportunity.eligibilityBreakdown?.skillMatch || Math.min(99, opportunity.matchScore + 2)}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full transition-all duration-500"
                        style={{ width: `${opportunity.eligibilityBreakdown?.skillMatch || Math.min(99, opportunity.matchScore + 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-[var(--text)]">Academic Trajectory Alignment</span>
                      <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">
                        {opportunity.eligibilityBreakdown?.academicAlignment || Math.min(99, opportunity.matchScore - 1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full transition-all duration-500"
                        style={{ width: `${opportunity.eligibilityBreakdown?.academicAlignment || Math.min(99, opportunity.matchScore - 1)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-[var(--text)]">Deadline & Term Availability</span>
                      <span className="text-[#B38600] dark:text-[#D4AF37] font-bold">
                        {opportunity.eligibilityBreakdown?.timelineFit || opportunity.matchScore}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D4AF37] to-[#E5C158] h-full rounded-full transition-all duration-500"
                        style={{ width: `${opportunity.eligibilityBreakdown?.timelineFit || opportunity.matchScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI STRATEGY */}
          {activeTab === 'ai_strategy' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-poppins text-xs sm:text-sm font-bold text-[#B38600] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    <span>Customized Application Statement of Interest</span>
                  </h4>
                  <button
                    onClick={handleCopyPitch}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B38600] dark:text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">{copiedPitch ? 'check' : 'content_copy'}</span>
                    <span>{copiedPitch ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-[var(--card-bg)] p-3.5 rounded-lg border border-[var(--border)] shadow-xs font-mono">
                  {tailoredPitch}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Key Skills to Highlight
                </h4>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#B38600] dark:text-[#D4AF37] text-xs font-semibold">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FAST APPLY PRE-FILLED ASSISTANT */}
          {activeTab === 'apply_assistant' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xl shrink-0 mt-0.5">
                  bolt
                </span>
                <div>
                  <h4 className="font-poppins text-xs sm:text-sm font-bold text-[#B38600] dark:text-[#D4AF37]">
                    1-Click Application Assistant
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Your stored NextLane profile details have been automatically assembled below for this application. Review your information, copy your tailored pitch, and click the direct redirect button to finalize on the official portal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Candidate Name</span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text)]">{userProfile.fullName || 'Student Applicant'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Education Level</span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text)] uppercase">{userProfile.educationLevel}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">LinkedIn Profile</span>
                  <span className="text-xs text-[var(--text)] truncate block">{userProfile.linkedInUrl || 'Configured in Profile'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">GitHub Profile</span>
                  <span className="text-xs text-[var(--text)] truncate block">{userProfile.githubUrl || 'Configured in Profile'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Relevant Matching Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#B38600] dark:text-[#D4AF37] text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#B38600] dark:text-[#D4AF37]">description</span>
                  <span className="text-xs font-semibold text-[var(--text)]">Attached Resume: {userProfile.resumeFileName || 'Default Resume Attached'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPitch}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#B38600] dark:text-[#D4AF37] hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">{copiedPitch ? 'check' : 'content_copy'}</span>
                  <span>{copiedPitch ? 'Pitch Copied!' : 'Copy Statement of Interest'}</span>
                </button>
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

          <div className="flex flex-wrap items-center gap-2.5 w-full min-[480px]:w-auto justify-end">
            <button
              onClick={handleToggleApplied}
              className={`py-2.5 sm:py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                applied
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
              title={applied ? 'Click to unmark' : 'Mark this opportunity as applied'}
            >
              <span className="material-symbols-outlined text-base">{applied ? 'check_circle' : 'radio_button_unchecked'}</span>
              <span>{applied ? 'Applied' : 'Mark Applied'}</span>
            </button>

            <button
              onClick={openPortalUrl}
              className="btn-primary py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer text-[#1C1C1C]"
            >
              <span>{opportunity.deadlinePassed ? 'View Archive' : 'Open Application Portal'}</span>
              <span className="material-symbols-outlined text-base">open_in_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
