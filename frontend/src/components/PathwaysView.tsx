import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PathwayMilestone, Opportunity } from '../types';
import { Pathways3DVisualizer } from './Pathways3DVisualizer';
import { VisualScoreArc } from './VisualScoreArc';

interface PathwaysViewProps {
  milestones: PathwayMilestone[];
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  theme?: 'dark' | 'light';
}

export const PathwaysView: React.FC<PathwaysViewProps> = ({
  milestones,
  opportunities,
  onSelectOpportunity,
  theme = 'dark'
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    milestones[1]?.id || 'm-2'
  );
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({
    '0-0': true,
    '0-1': true,
    '1-0': true
  });

  const activeMilestone =
    milestones.find((m) => m.id === selectedMilestoneId) || milestones[0];

  const toggleAction = (key: string) => {
    setCompletedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-2">
            <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xs">
              alt_route
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
              Predictive Trajectory
            </span>
          </div>
          <h1 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] tracking-tight">
            Strategic Pathways
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            A mathematically optimized progression of fellowships, research labs, and residencies designed to compound your career impact.
          </p>
        </div>

        {/* Global Progress Gauge */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] flex items-center gap-3.5 shadow-xs w-full sm:w-auto justify-between sm:justify-start">
          <VisualScoreArc score={68} size={44} strokeWidth={4} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Trajectory Velocity
            </div>
            <div className="text-xs sm:text-sm font-bold text-[var(--text)]">
              Stage 2 of 4 Active
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 3D Trajectory Visualizer */}
      <Pathways3DVisualizer
        milestones={milestones}
        selectedMilestoneId={selectedMilestoneId}
        onSelectMilestone={setSelectedMilestoneId}
        theme={theme}
      />

      {/* 4-Stage Horizontal Pathway Timeline Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
        {milestones.map((m, index) => {
          const isSelected = m.id === selectedMilestoneId;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMilestoneId(m.id)}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[120px] cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 dark:bg-[#2A2A2A] shadow-sm ring-1 ring-[#D4AF37]/30'
                  : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[#D4AF37]/50'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37]">
                    {m.stage}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      m.status === 'completed'
                        ? 'bg-[#D4AF37]/15 text-[#8A6700] dark:text-[#D4AF37]'
                        : m.status === 'in_progress'
                        ? 'bg-[#D4AF37] text-[#1C1C1C] font-black'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {m.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-poppins text-sm font-bold text-[var(--text)] line-clamp-1">
                  {m.title}
                </h4>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2.5 border-t border-[var(--border)] mt-2.5">
                <span className="font-medium">{m.timeframe}</span>
                <span className="material-symbols-outlined text-sm text-[#B38600] dark:text-[#D4AF37]">
                  {index < 3 ? 'arrow_forward' : 'flag'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Deep Dive Bento Grid */}
      {activeMilestone && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          {/* Left Column (7 cols): Stage Objectives & Key Actions Checklist */}
          <div className="lg:col-span-7 rounded-2xl p-5 sm:p-6 bg-[var(--card-bg)] border border-[var(--border)] shadow-xs flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
                    {activeMilestone.stage} • {activeMilestone.timeframe}
                  </span>
                </div>
                <h2 className="font-poppins text-xl sm:text-2xl font-bold text-[var(--text)] mb-1.5">
                  {activeMilestone.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {activeMilestone.description}
                </p>
              </div>

              {/* Interactive High-Leverage Actions Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] mb-2.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">checklist</span>
                  <span>Strategic High-Leverage Milestones</span>
                </h3>
                <div className="space-y-2">
                  {activeMilestone.keyActions.map((action, i) => {
                    const actionKey = `${activeMilestone.id}-${i}`;
                    const isDone = completedActions[actionKey] || false;
                    return (
                      <div
                        key={i}
                        onClick={() => toggleAction(actionKey)}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm cursor-pointer transition-all ${
                          isDone
                            ? 'bg-[#D4AF37]/15 dark:bg-[#2A2A2A] border-[#D4AF37]/40 text-[var(--text)]'
                            : 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[#D4AF37]/40'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-base mt-0.5 shrink-0 transition-colors ${
                            isDone ? 'text-[#B38600] dark:text-[#D4AF37]' : 'text-[var(--text-muted)]'
                          }`}
                          style={{ fontVariationSettings: isDone ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {isDone ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className={`leading-relaxed ${isDone ? 'font-medium' : ''}`}>
                          {action}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prerequisites & Required Competency Vectors */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Prerequisite Skill Embeddings
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeMilestone.prerequisites.map((p, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                      <span>{p}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Aligned Live Opportunities Matching This Stage */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#B38600] dark:text-[#D4AF37] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                    <span>Synchronized Opportunities</span>
                  </h3>
                  <span className="text-[11px] text-[var(--text-muted)] font-bold">
                    {opportunities.slice(0, 3).length} Aligned
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-3">
                  Verified applications that directly satisfy this stage's trajectory milestones.
                </p>

                <div className="space-y-2.5">
                  {opportunities.slice(0, 3).map((opp) => (
                    <motion.div
                      key={opp.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onSelectOpportunity(opp)}
                      className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[#D4AF37] shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                          {opp.title}
                        </span>
                        <span className="text-xs text-[#B38600] dark:text-[#D4AF37] font-bold">
                          {opp.matchScore}%
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex justify-between items-center">
                        <span>{opp.organization}</span>
                        <span className="flex items-center gap-0.5 text-[#B38600] dark:text-[#D4AF37] font-semibold text-[11px]">
                          Inspect <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trajectory Acceleration Metric */}
              <div className="mt-5 p-3.5 rounded-xl bg-[#D4AF37]/15 dark:bg-[#2A2A2A] border border-[#D4AF37]/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-2xl">
                    speed
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">
                      +34% Accelerated Trajectory
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      Completing this stage unlocks 14 tier-1 labs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
