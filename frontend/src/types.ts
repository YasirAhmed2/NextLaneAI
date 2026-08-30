export interface CompanyLegitimacy {
  status: string;
  trustScore: number;
  rating?: string;
  verificationBadges: string[];
  verificationDetails: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  stage: 'SCRAPING' | 'VERIFYING' | 'MATCHING' | 'SCHEDULER' | 'ALERT';
  source?: string;
  message: string;
  status: 'info' | 'success' | 'warning' | 'active';
}

export type OpportunityType = 'Hackathon' | 'Internship' | 'Scholarship' | 'Fellowship' | 'Job' | string;

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: OpportunityType;
  matchScore: number;
  priorityLevel?: string;
  deadline: string;
  deadlineDate?: string;
  deadlinePassed?: boolean;
  source?: string;
  tags: string[];
  aiMatchReason: string;
  description: string;
  requirements: string[];
  compensationOrGrant?: string;
  url?: string;
  isSaved?: boolean;
  savedStatus?: 'To Review' | 'Planning' | 'Applied' | 'Closed';
  isVerifiedListing?: boolean;
  lastVerifiedDate?: string;
  companyReputationScore?: string;
  isVerifiedCompany?: boolean;
  companyLegitimacy?: CompanyLegitimacy;
  scrapedAt?: string;
  intakeSeason?: string;
  historicalReason?: string;
  estimatedNextCycle?: string;
  urgent24h?: boolean;
  remainingHours?: number;
  cgpaRequirement?: string;
  ieltsRequirement?: string;
  experienceRequired?: string;
  eligibilityBreakdown?: {
    skillMatch: number;
    academicAlignment: number;
    timelineFit: number;
    insights: string[];
  };
}

export interface UserProfile {
  fullName: string;
  educationLevel: string;
  skills: string[];
  targetObjectives: string[]; // 'internships' | 'scholarships' | 'hackathons'
  linkedInUrl?: string;
  githubUrl?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  resumeUploadedAt?: string;
  avatarUrl?: string;
  tier: string;
  email?: string;
  institution?: string;
  gpa?: string;
  isProfileComplete?: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  profileComplete: boolean;
  profile?: Partial<UserProfile>;
  token?: string;
}

export interface PathwayMilestone {
  id: string;
  stage: string;
  title: string;
  timeframe: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'locked';
  keyActions: string[];
  prerequisites: string[];
  recommendedOpportunities: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'deadline' | 'match' | 'system';
  linkTab?: ActiveTab;
}

export type ActiveTab = 'landing' | 'auth' | 'profile_init' | 'opportunities' | 'saved' | 'history' | 'pathways' | 'settings';

