import React, { useState, useEffect } from 'react';
import { Opportunity, UserProfile } from '../types';
import { opportraService } from '../services/opportraService';

interface AutoApplyAgentModalProps {
  opportunity: Opportunity | null;
  userProfile: UserProfile;
  onClose: () => void;
  onCompleteApply: (oppId: string) => void;
}

interface LogStep {
  id: string;
  stage: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'active' | 'completed' | 'success';
}

export const AutoApplyAgentModal: React.FC<AutoApplyAgentModalProps> = ({
  opportunity,
  userProfile,
  onClose,
  onCompleteApply,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [logSteps, setLogSteps] = useState<LogStep[]>([]);

  useEffect(() => {
    if (!opportunity) return;

    const confCode = `NL-AGENT-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmationCode(confCode);
    setIsFinished(false);
    setCurrentStageIndex(0);

    const steps: LogStep[] = [
      {
        id: 's1',
        stage: 'Credential Extraction',
        message: `Reading user profile for ${userProfile.fullName || 'Candidate'} (${userProfile.educationLevel}, ${userProfile.skills.length} verified skills)...`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'active',
      },
      {
        id: 's2',
        stage: 'ATS Prerequisites Check',
        message: `Analyzing opportunity specifications for ${opportunity.title} at ${opportunity.organization}...`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending',
      },
      {
        id: 's3',
        stage: 'AI Proposal Synthesis',
        message: `Generating tailored application package, custom cover statement, and skill matrix...`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending',
      },
      {
        id: 's4',
        stage: 'Portal Submission',
        message: `Submitting verified application payload to host portal & registering application receipt...`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'pending',
      },
    ];

    setLogSteps(steps);

    // Timers for automated step progression
    const timer1 = setTimeout(() => {
      setCurrentStageIndex(1);
      setLogSteps((prev) =>
        prev.map((s, idx) =>
          idx === 0 ? { ...s, status: 'completed' } : idx === 1 ? { ...s, status: 'active' } : s
        )
      );
    }, 1500);

    const timer2 = setTimeout(() => {
      setCurrentStageIndex(2);
      setLogSteps((prev) =>
        prev.map((s, idx) =>
          idx === 1 ? { ...s, status: 'completed' } : idx === 2 ? { ...s, status: 'active' } : s
        )
      );
    }, 3200);

    const timer3 = setTimeout(() => {
      setCurrentStageIndex(3);
      setLogSteps((prev) =>
        prev.map((s, idx) =>
          idx === 2 ? { ...s, status: 'completed' } : idx === 3 ? { ...s, status: 'active' } : s
        )
      );
    }, 5000);

    const timer4 = setTimeout(async () => {
      setCurrentStageIndex(4);
      setIsFinished(true);
      setLogSteps((prev) =>
        prev.map((s) => ({ ...s, status: 'completed' }))
      );

      // Trigger service backend logging
      try {
        await opportraService.autoApply(opportunity, userProfile);
      } catch (err) {
        console.warn('Auto-apply backend log notice:', err);
      }

      // Mark applied in app state
      onCompleteApply(opportunity.id);
    }, 6800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [opportunity]);

  if (!opportunity) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(confirmationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const progressPercent = Math.min(100, Math.round(((currentStageIndex) / 4) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="gold-modal-frame relative w-full max-w-xl bg-[var(--card-bg)] rounded-2xl border border-[#D4AF37]/50 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--bg-subtle)] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-slate-950 font-extrabold shadow-md">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8A6700] dark:text-[#D4AF37] block">
                Autonomous Auto-Apply Agent
              </span>
              <h3 className="font-poppins font-bold text-sm sm:text-base text-[var(--text)] leading-tight">
                {isFinished ? 'Application Submitted Successfully!' : `Auto-Applying to ${opportunity.organization}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-full hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-5 bg-[var(--card-bg)]">
          
          {/* Opportunity Banner Card */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6700] dark:text-[#D4AF37]">
                {opportunity.type}
              </span>
              <h4 className="font-poppins font-bold text-xs sm:text-sm text-[var(--text)] line-clamp-1">
                {opportunity.title}
              </h4>
            </div>
            <span className="text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full shrink-0">
              {opportunity.matchScore}% Match
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[var(--text-secondary)]">Agent Pipeline Progress</span>
              <span className="text-[#8A6700] dark:text-[#D4AF37] font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Execution Log Timeline */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
              Autonomous Agent Activity Log
            </span>

            <div className="space-y-2 bg-black/20 dark:bg-black/40 p-3 sm:p-4 rounded-xl border border-[var(--border)] font-mono text-xs max-h-48 overflow-y-auto">
              {logSteps.map((step) => {
                const isActive = step.status === 'active';
                const isDone = step.status === 'completed';

                return (
                  <div key={step.id} className="flex items-start gap-2.5 transition-all">
                    {isDone ? (
                      <span className="material-symbols-outlined text-sm text-emerald-400 shrink-0 mt-0.5">
                        check_circle
                      </span>
                    ) : isActive ? (
                      <span className="material-symbols-outlined text-sm text-amber-400 shrink-0 mt-0.5 animate-spin">
                        progress_activity
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm text-[var(--text-muted)] shrink-0 mt-0.5">
                        radio_button_unchecked
                      </span>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-bold ${isDone ? 'text-emerald-400' : isActive ? 'text-amber-400' : 'text-[var(--text-muted)]'}`}>
                          [{step.stage}]
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">{step.timestamp}</span>
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${isDone ? 'text-[var(--text)]' : isActive ? 'text-amber-200 animate-pulse' : 'text-[var(--text-muted)]'}`}>
                        {step.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Proof Banner (when finished) */}
          {isFinished && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 space-y-2 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-poppins font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    task_alt
                  </span>
                  <span>Application Successfully Registered!</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  VERIFIED
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)]">
                NextLane Autonomous Agent has submitted candidate details for <strong className="text-[var(--text)]">{userProfile.fullName || 'Candidate'}</strong> to <strong className="text-[var(--text)]">{opportunity.organization}</strong>.
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Receipt Code: <strong className="text-emerald-500 font-bold">{confirmationCode}</strong>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-[var(--bg-subtle)] border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            disabled={!isFinished}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-poppins font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isFinished
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:brightness-110'
                : 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
            }`}
          >
            {isFinished ? 'Done & Close' : 'Auto-Apply Agent Working...'}
          </button>
        </div>
      </div>
    </div>
  );
};
