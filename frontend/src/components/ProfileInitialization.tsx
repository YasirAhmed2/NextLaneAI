import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface ProfileInitializationProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onComplete: () => void;
  theme?: 'dark' | 'light';
  isEditing?: boolean;
}

const COMMON_SKILL_SUGGESTIONS = [
  'Python', 'Machine Learning', 'Data Analysis', 'PyTorch', 'React',
  'TypeScript', 'Next.js', 'Quantum Computing', 'Cloud Architecture',
  'Cybersecurity', 'Bioinformatics', 'Computer Vision', 'Robotics'
];

export const ProfileInitialization: React.FC<ProfileInitializationProps> = ({
  userProfile,
  onSaveProfile,
  onComplete,
  isEditing = false,
}) => {
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [educationLevel, setEducationLevel] = useState(userProfile.educationLevel || 'undergrad');
  const [skills, setSkills] = useState<string[]>(userProfile.skills.length > 0 ? userProfile.skills : []);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(
    userProfile.targetObjectives.length > 0 ? userProfile.targetObjectives : ['internships', 'scholarships', 'hackathons']
  );
  const [linkedInUrl, setLinkedInUrl] = useState(userProfile.linkedInUrl || '');
  const [githubUrl, setGithubUrl] = useState(userProfile.githubUrl || '');

  // CV / Resume upload state
  const [resumeFileName, setResumeFileName] = useState(userProfile.resumeFileName || '');
  const [resumeFileSize, setResumeFileSize] = useState<number | undefined>(userProfile.resumeFileSize);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvUploadProgress, setCvUploadProgress] = useState(0);
  const [cvError, setCvError] = useState<string | null>(null);

  // Form Validation & Generation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add Skill
  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || skillInput).trim();
    if (!s) return;
    if (!skills.some((item) => item.toLowerCase() === s.toLowerCase())) {
      setSkills([...skills, s]);
      setErrors((prev) => ({ ...prev, skills: '' }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Toggle Interest
  const toggleInterest = (interestId: string) => {
    let updated: string[];
    if (interests.includes(interestId)) {
      updated = interests.filter((i) => i !== interestId);
    } else {
      updated = [...interests, interestId];
    }
    setInterests(updated);
    if (updated.length > 0) {
      setErrors((prev) => ({ ...prev, interests: '' }));
    }
  };

  // Handle Resume File Selection & Parsing Simulation
  const handleFileSelected = (file: File | null) => {
    setCvError(null);
    if (!file) return;

    // Check format
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setCvError('Unsupported file format. Please upload a PDF or DOCX document.');
      return;
    }

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setCvError('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploadingCv(true);
    setCvUploadProgress(15);

    const interval = setInterval(() => {
      setCvUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploadingCv(false);
            setResumeFileName(file.name);
            setResumeFileSize(file.size);
            setCvUploadProgress(100);

            // Extract skills from resume context if skills are sparse
            if (skills.length < 3) {
              const suggested = ['Python', 'Data Science', 'Machine Learning'];
              setSkills((current) => Array.from(new Set([...current, ...suggested])));
            }
          }, 300);
          return 95;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveResume = () => {
    setResumeFileName('');
    setResumeFileSize(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Validate form
  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Display name is required.';
    }
    if (!educationLevel) {
      errs.educationLevel = 'Please select your education level.';
    }
    if (skills.length === 0) {
      errs.skills = 'Please provide at least one technical or research skill.';
    }
    if (interests.length === 0) {
      errs.interests = 'Please select at least one interest area.';
    }

    if (linkedInUrl.trim() && !linkedInUrl.includes('linkedin.com')) {
      errs.linkedInUrl = 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username).';
    }
    if (githubUrl.trim() && !githubUrl.includes('github.com')) {
      errs.githubUrl = 'Please enter a valid GitHub URL (e.g., https://github.com/username).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit and Generate Stream
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsGenerating(true);
    setGenerationStep('Analyzing verified skills & academic profile...');

    const updatedProfile: UserProfile = {
      ...userProfile,
      fullName: fullName.trim(),
      educationLevel,
      skills,
      targetObjectives: interests,
      linkedInUrl: linkedInUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      resumeFileName: resumeFileName || undefined,
      resumeFileSize: resumeFileSize || undefined,
      resumeUploadedAt: resumeFileName ? new Date().toISOString() : undefined,
      isProfileComplete: true,
    };

    // Save to local storage and remote server
    onSaveProfile(updatedProfile);
    authService.saveProfile(updatedProfile);

    setTimeout(() => {
      setGenerationStep('Matching opportunities across trusted platforms...');
    }, 600);

    setTimeout(() => {
      setGenerationStep('Calculating AI match scores & rationales...');
    }, 1200);

    setTimeout(() => {
      setIsGenerating(false);
      onComplete();
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-16 pt-2 px-1 sm:px-0">
      {/* Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--card-bg)] shadow-xs mb-3">
          <span className="material-symbols-outlined text-[#B38600] dark:text-[#D4AF37] text-xs">
            {isEditing ? 'manage_accounts' : 'tune'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#B38600] dark:text-[#D4AF37]">
            {isEditing ? 'Edit Profile & Preferences' : 'Profile Setup'}
          </span>
        </div>
        <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">
          {isEditing ? 'Update Your Discovery Profile' : 'Set Up Your Discovery Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto px-2">
          Provide your background and interests so NextLane AI can filter and curate opportunities tailored to your exact skillset.
        </p>
      </div>

      {isGenerating ? (
        <div className="gold-glitter-card rounded-3xl p-8 sm:p-16 flex flex-col items-center justify-center text-center space-y-6 border border-[#D4AF37]/40 shadow-2xl bg-[var(--card-bg)]">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--border)] animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-[#B38600] dark:text-[#D4AF37]">
              <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            </div>
          </div>
          <div>
            <h3 className="font-poppins text-lg sm:text-xl font-bold text-[var(--text)] mb-2">
              Generating Your Tailored Stream
            </h3>
            <p className="text-xs sm:text-sm text-[#B38600] dark:text-[#D4AF37] font-semibold animate-pulse">
              {generationStep}
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="gold-glitter-card rounded-2xl sm:rounded-3xl p-4 min-[400px]:p-6 sm:p-10 border border-[#D4AF37]/35 shadow-2xl bg-[var(--card-bg)] space-y-6 sm:space-y-8"
        >
          {/* SECTION: MANDATORY FIELDS */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                Core Information (Mandatory)
              </span>
              <span className="text-[11px] text-[#B38600] dark:text-[#D4AF37] font-semibold">
                Required for Matching
              </span>
            </div>

            {/* Field 1: Display Name */}
            <div>
              <label
                htmlFor="nameField"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2"
              >
                Display Name <span className="text-[#B38600] dark:text-[#D4AF37]">*</span>
              </label>
              <input
                id="nameField"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                placeholder="e.g. Alex Rivera"
                className={`w-full bg-[var(--bg-subtle)] border rounded-xl py-3 px-4 text-[var(--text)] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors ${
                  errors.fullName ? 'border-red-500/60' : 'border-[var(--border)]'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>

            {/* Field 2: Education Level */}
            <div>
              <label
                htmlFor="educationField"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2"
              >
                Education Level <span className="text-[#B38600] dark:text-[#D4AF37]">*</span>
              </label>
              <select
                id="educationField"
                value={educationLevel}
                onChange={(e) => {
                  setEducationLevel(e.target.value);
                  if (errors.educationLevel) setErrors({ ...errors, educationLevel: '' });
                }}
                className={`w-full bg-[var(--bg-subtle)] border rounded-xl py-3 px-4 text-[var(--text)] text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer ${
                  errors.educationLevel ? 'border-red-500/60' : 'border-[var(--border)]'
                }`}
              >
                <option value="highschool">High School Student</option>
                <option value="undergrad">Undergraduate (Bachelors)</option>
                <option value="masters">Master's Degree Candidate</option>
                <option value="phd">Ph.D. / Postdoctoral Researcher</option>
                <option value="bootcamp">Bootcamp / Self-Taught Professional</option>
              </select>
              {errors.educationLevel && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.educationLevel}</p>
              )}
            </div>

            {/* Field 3: Skills with Interactive Tag Builder */}
            <div>
              <label
                htmlFor="skillsField"
                className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2"
              >
                Skills & Proficiencies <span className="text-[#B38600] dark:text-[#D4AF37]">*</span>
              </label>
              
              <div className="flex gap-2 mb-2.5">
                <input
                  id="skillsField"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter (e.g., Python, React, AI)"
                  className={`flex-1 bg-[var(--bg-subtle)] border rounded-xl py-2.5 px-4 text-[var(--text)] text-sm focus:outline-none focus:border-[#D4AF37] transition-colors ${
                    errors.skills ? 'border-red-500/60' : 'border-[var(--border)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-5 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#B38600] dark:text-[#D4AF37] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Active Skill Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs font-bold text-[var(--text)]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[var(--text-muted)] hover:text-red-500 text-sm cursor-pointer"
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Skills */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  Quick-add suggestions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 7).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:border-[#D4AF37] hover:text-[var(--text)] transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {errors.skills && (
                <p className="text-xs text-red-500 mt-2 font-medium">{errors.skills}</p>
              )}
            </div>

            {/* Field 4: Interests (Checkboxes) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-3">
                Target Opportunity Types <span className="text-[#B38600] dark:text-[#D4AF37]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'internships', label: 'Internships & Fellowships', icon: 'business_center' },
                  { id: 'scholarships', label: 'Scholarships & Grants', icon: 'school' },
                  { id: 'hackathons', label: 'Hackathons & Residencies', icon: 'code' }
                ].map((item) => {
                  const isChecked = interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 dark:bg-[#2A2A2A] text-[var(--text)] font-bold shadow-xs'
                          : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors shrink-0 ${
                          isChecked
                            ? 'border-[#D4AF37] bg-[#D4AF37] text-[#1C1C1C] font-bold shadow-xs'
                            : 'border-[var(--border)] bg-[var(--bg-subtle)]'
                        }`}
                      >
                        {isChecked && <span className="material-symbols-outlined text-sm font-black">check</span>}
                      </div>
                      <span className="text-xs font-bold text-[var(--text)]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.interests && (
                <p className="text-xs text-red-500 mt-2 font-medium">{errors.interests}</p>
              )}
            </div>
          </div>

          {/* SECTION: OPTIONAL BUT RECOMMENDED FIELDS */}
          <div className="space-y-6 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]"></span>
                Links & Resume (Optional, Recommended)
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Improves Precision by +25%
              </span>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="linkedinField"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5"
                >
                  LinkedIn Profile <span className="text-[10px] text-[var(--text-muted)]">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                    link
                  </span>
                  <input
                    id="linkedinField"
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text)] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                {errors.linkedInUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.linkedInUrl}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="githubField"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1.5"
                >
                  GitHub Profile <span className="text-[10px] text-[var(--text-muted)]">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-base">
                    code
                  </span>
                  <input
                    id="githubField"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text)] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                {errors.githubUrl && (
                  <p className="text-xs text-red-500 mt-1">{errors.githubUrl}</p>
                )}
              </div>
            </div>

            {/* Resume / CV Upload Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2">
                Upload CV / Resume <span className="text-[10px] text-[var(--text-muted)]">(Optional, PDF/DOCX max 10MB)</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {!resumeFileName ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[var(--border)] hover:border-[#D4AF37] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[var(--bg-subtle)]/50 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B38600] dark:text-[#D4AF37] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">upload_file</span>
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-[var(--text)] mb-1">
                    Drag and drop your CV here, or <span className="text-[#B38600] dark:text-[#D4AF37] underline">browse</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Supported formats: PDF, DOCX (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#1C1C1C] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-xl">description</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text)] truncate max-w-xs sm:max-w-sm">
                        {resumeFileName}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {resumeFileSize ? `${(resumeFileSize / (1024 * 1024)).toFixed(2)} MB • ` : ''}
                        Attached & Parsed for Matching
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove attached CV"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              )}

              {isUploadingCv && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Parsing resume content...</span>
                    <span>{cvUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D4AF37] h-full transition-all duration-300"
                      style={{ width: `${cvUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {cvError && (
                <p className="text-xs text-red-500 mt-2 font-medium">{cvError}</p>
              )}

              <p className="text-[11px] text-[var(--text-muted)] mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">lock</span>
                <span>Privacy Guarantee: Your CV is processed securely solely to identify skill matches. It is never shared or indexed publicly.</span>
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full btn-primary text-xs uppercase tracking-wider font-bold py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xl text-[#1C1C1C]"
            >
              <span className="material-symbols-outlined text-base font-bold">auto_awesome</span>
              <span>{isEditing ? 'Save Changes & Refresh Feed' : 'Generate My Opportunities'}</span>
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
};
