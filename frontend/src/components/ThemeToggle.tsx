import React from 'react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
  variant = 'compact'
}) => {
  const isDark = theme === 'dark';

  if (variant === 'full') {
    return (
      <div className={`inline-flex p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-inner select-none ${className}`}>
        <button
          type="button"
          onClick={() => isDark && onToggle()}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            !isDark
              ? 'bg-[var(--card-bg)] text-[var(--text)] shadow-xs border border-[var(--border)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
          aria-pressed={!isDark}
        >
          <span className="material-symbols-outlined text-base text-[#B38600]" style={{ fontVariationSettings: "'FILL' 1" }}>
            light_mode
          </span>
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => !isDark && onToggle()}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
            isDark
              ? 'bg-[#252526] text-[#D4AF37] shadow-xs border border-[#D4AF37]/30'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
          aria-pressed={isDark}
        >
          <span className="material-symbols-outlined text-base text-[#D4AF37]" style={{ fontVariationSettings: "'FILL' 1" }}>
            dark_mode
          </span>
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'} — Click to toggle`}
      className={`group relative inline-flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-1.5 rounded-full transition-all duration-300 border cursor-pointer select-none shrink-0 ${
        isDark
          ? 'bg-[#252526] hover:bg-[#2f3031] border-[#3C3C3B] hover:border-[#D4AF37]/60 text-[#E3E2E3] shadow-md shadow-black/20'
          : 'bg-[var(--card-bg)] hover:bg-[var(--bg-hover)] border-[var(--border)] hover:border-[#D4AF37] text-[var(--text)] shadow-xs hover:shadow'
      } ${className}`}
    >
      {/* Icon Capsule */}
      <div
        className={`w-6 h-6 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0 ${
          isDark
            ? 'bg-[#343536] text-[#D4AF37]'
            : 'bg-[#D4AF37]/20 text-[#8A6700]'
        }`}
      >
        <span
          className="material-symbols-outlined text-[15px] sm:text-base transition-transform duration-300 transform group-hover:rotate-12"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>

      {/* Label with mode indicator - hidden on mobile to prevent navbar overflow */}
      <div className="hidden md:flex items-center gap-1.5">
        <span className="text-xs font-bold tracking-wide uppercase font-inter text-[var(--text)]">
          {isDark ? 'Dark' : 'Light'}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isDark ? 'bg-[#D4AF37] animate-pulse' : 'bg-[#D4AF37]'
          }`}
        />
      </div>
    </button>
  );
};
