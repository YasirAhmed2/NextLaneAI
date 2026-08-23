import React from 'react';
import { motion } from 'motion/react';
import { ActiveTab } from '../types';
import { ThreeCanvas } from './ThreeCanvas';

interface HeroLandingProps {
  onGetStarted: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  theme?: 'dark' | 'light';
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onGetStarted,
  setActiveTab,
  theme = 'dark'
}) => {
  // Motion animation variants for clean staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div className="w-full flex flex-col relative overflow-x-hidden">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[85vh] lg:min-h-[800px] flex items-center justify-center px-3 min-[400px]:px-5 sm:px-10 lg:px-20 overflow-hidden">
        {/* Three.js Interactive WebGL 3D Canvas */}
        <ThreeCanvas theme={theme} className="opacity-85 dark:opacity-90" />

        {/* Ambient Gradient Overlays for depth and readability */}
        <div className="absolute inset-0 bg-radial from-transparent via-[var(--bg)]/50 to-[var(--bg)]/95 pointer-events-none z-[2]"></div>
        <div className="discovery-glow top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 dark:opacity-40"></div>

        {/* Centralized Hero Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center py-12 sm:py-16 px-2 min-[400px]:px-4"
        >
          {/* Top Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)]/90 backdrop-blur-md shadow-sm mb-4">
              <span
                className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-sm animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
                Autonomous Opportunity Agent
              </span>
            </div>
          </motion.div>

          {/* Centralized Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-poppins text-3xl min-[400px]:text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] tracking-tight leading-[1.18] sm:leading-[1.12] mb-5 sm:mb-6"
          >
            Never Miss the <br className="hidden sm:inline" />
            <span className="text-gradient">Opportunities</span> You Deserve
          </motion.h1>

          {/* Centralized Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl font-inter leading-relaxed mb-8 mx-auto"
          >
            NextLane AI finds and filters jobs, scholarships, and hackathons tailored to your profile — so you don't have to search.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col min-[480px]:flex-row items-center justify-center gap-3 sm:gap-3.5 w-full min-[480px]:w-auto mb-10 sm:mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="w-full min-[480px]:w-auto btn-primary text-xs uppercase tracking-wider font-bold px-7 sm:px-8 py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-[#1C1C1C] shadow-xl shadow-[#D4AF37]/25 cursor-pointer min-[480px]:min-w-[170px]"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('opportunities')}
              className="w-full min-[480px]:w-auto px-6 sm:px-7 py-3.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[#D4AF37] text-[var(--text)] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-[#B38600] dark:text-[#D4AF37]">
                play_circle
              </span>
              <span>View Demo</span>
            </motion.button>
          </motion.div>

          {/* Centered Telemetry Metrics */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-2xl grid grid-cols-3 gap-2 min-[400px]:gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-[var(--border)]"
          >
            <div className="flex flex-col items-center text-center">
              <div className="font-poppins text-lg min-[400px]:text-2xl sm:text-3xl font-bold text-[#B38600] dark:text-[#D4AF37]">$4.2M+</div>
              <div className="text-[9px] min-[400px]:text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mt-0.5">
                Grants & Fellowships
              </div>
            </div>
            <div className="flex flex-col items-center text-center border-x border-[var(--border)] px-1 sm:px-4">
              <div className="font-poppins text-lg min-[400px]:text-2xl sm:text-3xl font-bold text-[#B38600] dark:text-[#D4AF37]">1,280+</div>
              <div className="text-[9px] min-[400px]:text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mt-0.5">
                Curated Labs & Roles
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="font-poppins text-lg min-[400px]:text-2xl sm:text-3xl font-bold text-[#B38600] dark:text-[#D4AF37]">98.4%</div>
              <div className="text-[9px] min-[400px]:text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mt-0.5">
                Match Precision
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: PROBLEM */}
      <section className="py-14 sm:py-20 px-3 min-[400px]:px-5 sm:px-10 lg:px-20 relative bg-[var(--bg-subtle)] transition-colors border-t border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
                The Discovery Gap
              </span>
            </div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mb-4">
              Most Opportunities Are <span className="text-[#B38600] dark:text-[#D4AF37]">Missed</span>, Not Lost
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed">
              Students and professionals miss life-changing opportunities every day because information is scattered, overwhelming, and not personalized.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left">
            {/* Card 1 */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              viewport={{ once: true, margin: '-50px' }}
              className="gold-glitter-card rounded-2xl p-5 sm:p-7 flex flex-col gap-4 relative overflow-hidden group bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  visibility_off
                </span>
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">Hidden Gems</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The most valuable grants, labs, and fellowship programs are buried across niche portals and institutional boards.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              viewport={{ once: true, margin: '-50px' }}
              className="gold-glitter-card rounded-2xl p-5 sm:p-7 flex flex-col gap-4 relative overflow-hidden group bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  event_busy
                </span>
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">Missed Deadlines</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Application dates slip by silently while you manually scroll through irrelevant job boards and endless feeds.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              viewport={{ once: true, margin: '-50px' }}
              className="gold-glitter-card rounded-2xl p-5 sm:p-7 flex flex-col gap-4 relative overflow-hidden group bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person_off
                </span>
              </div>
              <h3 className="font-poppins text-lg font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">Poor Fit</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Applying blindly without knowing whether your background aligns wastes hundreds of hours on low-yield submissions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLUTION */}
      <section className="py-14 sm:py-20 px-3 min-[400px]:px-5 sm:px-10 lg:px-20 relative bg-[var(--card-bg)] transition-colors border-t border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[var(--bg-subtle)] shadow-xs mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
                The Solution
              </span>
            </div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mb-3">
              An Agent That Works for You
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Continuous intelligence that turns scattered opportunities into an active, actionable pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-7 rounded-2xl bg-[var(--bg-subtle)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="font-poppins text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                Finds opportunities from trusted platforms
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Continuously scrapes and parses high-value listings across MLH, Devpost, Unstop, institutional research boards, and corporate fellowships.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-7 rounded-2xl bg-[var(--bg-subtle)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="font-poppins text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                Matches them to your profile
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Calculates high-precision match scores by cross-referencing your verified skills, education level, and strategic career objectives.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-7 rounded-2xl bg-[var(--bg-subtle)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="font-poppins text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                Explains why you qualify
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Generates transparent, clear explanations directly on each card so you understand your specific competitive advantages before applying.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section className="py-14 sm:py-20 px-3 min-[400px]:px-5 sm:px-10 lg:px-20 relative bg-[var(--bg-subtle)] transition-colors border-t border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[var(--card-bg)] shadow-xs mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
                Core Capabilities
              </span>
            </div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mb-3">
              Intelligent Workflow Built for Action
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Everything you need to track, prioritize, and capture career-defining opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">psychology</span>
              </div>
              <h3 className="font-poppins text-sm sm:text-base font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                Personalized matching
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Smart ranking algorithm trained to match your skills with specific job and grant prerequisites.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">chat</span>
              </div>
              <h3 className="font-poppins text-sm sm:text-base font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                AI-powered explanations
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every card provides clear reasoning detailing why your coursework and experience qualify.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">event_upcoming</span>
              </div>
              <h3 className="font-poppins text-sm sm:text-base font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                Deadline tracking
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Active alerts and countdowns so you prepare applications well before submission windows close.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className="gold-glitter-card p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-xs flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">history_edu</span>
              </div>
              <h3 className="font-poppins text-sm sm:text-base font-bold text-[var(--text)] group-hover:text-[#B38600] dark:group-hover:text-[#D4AF37] transition-colors">
                Missed opportunity insights
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Retrospective diagnostics highlight high-affinity cycles that passed and prepare you for next intake.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="py-14 sm:py-20 px-3 min-[400px]:px-5 sm:px-10 lg:px-20 relative bg-[var(--card-bg)] transition-colors border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="gold-glitter-card p-6 min-[480px]:p-10 sm:p-14 rounded-3xl bg-[var(--bg-subtle)] border border-[#D4AF37]/30 shadow-lg flex flex-col items-center justify-center gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/15 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)]">
                Start discovering opportunities that match you
              </h2>
              <p className="text-xs sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">
                Set up your profile in 60 seconds with no complex forms and get a curated stream immediately.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="btn-primary text-xs uppercase tracking-wider font-bold px-8 sm:px-9 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2.5 text-[#1C1C1C] shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
            >
              <span>Create Profile</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
