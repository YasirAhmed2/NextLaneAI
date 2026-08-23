import React from 'react';
import { UserProfile } from '../types';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpgradeSuccess: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="gold-modal-frame relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[var(--card-bg)] rounded-2xl border border-[#D4AF37]/50 p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Glow */}
        <div className="discovery-glow -top-20 -right-20 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <span className="font-poppins text-lg sm:text-xl font-bold text-[var(--text)]">NextLane AI Elite Tier</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5 sm:mb-6 leading-relaxed">
          Upgrade your neural search trajectory with institutional-grade discovery algorithms and dedicated research advisors.
        </p>

        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-lg mt-0.5 shrink-0">auto_awesome</span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[var(--text)]">Automated Real-time Deadline Snipers</div>
              <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">Direct SMS & Calendar push notifications before application portals close.</div>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-lg mt-0.5 shrink-0">psychology</span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[var(--text)]">Deep Vector Essay & Prospectus Synthesizer</div>
              <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">Bespoke alignment statements crafted to match faculty funding priorities.</div>
            </div>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-lg mt-0.5 shrink-0">group</span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[var(--text)]">Exclusive Lab Alumni & Referral Network</div>
              <div className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5">Direct warm introduction channels into DeepMind, CERN, and MIT Media Lab.</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[var(--border)]">
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-bold font-poppins text-[#B38600] dark:text-[#D4AF37]">
              $0 <span className="text-xs text-[var(--text-muted)] font-normal">/ Student Academic Pass</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium mt-0.5">Full access sponsored for current university scholars</div>
          </div>

          <button
            onClick={() => {
              onUpgradeSuccess();
              onClose();
            }}
            className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg shadow-[#D4AF37]/20 cursor-pointer text-[#1C1C1C] text-center"
          >
            Activate Elite Tier
          </button>
        </div>
      </div>
    </div>
  );
};
