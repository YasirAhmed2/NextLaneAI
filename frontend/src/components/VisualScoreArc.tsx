import React from 'react';

interface VisualScoreArcProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export const VisualScoreArc: React.FC<VisualScoreArcProps> = ({
  score,
  size = 56,
  strokeWidth = 4.5,
  showLabel = true,
  className = ''
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;

  // Consistent gold color tone logic based on score
  const getGradientId = () => {
    if (score >= 90) return 'score-gradient-high';
    if (score >= 80) return 'score-gradient-mid';
    return 'score-gradient-base';
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="score-gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#E5C158" />
          </linearGradient>
          <linearGradient id="score-gradient-mid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B38600" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="score-gradient-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A6700" />
            <stop offset="100%" stopColor="#B38600" />
          </linearGradient>
        </defs>

        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--border)]"
          fill="none"
        />

        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${getGradientId()})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="font-poppins text-xs font-bold text-[var(--text)] leading-none">
            {score}%
          </span>
          <span className="text-[8px] uppercase tracking-tighter text-[var(--text-muted)] font-semibold mt-0.5 leading-none">
            Match
          </span>
        </div>
      )}
    </div>
  );
};
