import { Opportunity, PathwayMilestone, NotificationItem } from '../types';

export const INITIAL_USER_PROFILE = {
  fullName: 'Alex Vance',
  educationLevel: 'undergrad',
  skills: ['Python', 'Machine Learning', 'Data Analysis', 'Technical Writing', 'PyTorch'],
  targetObjectives: ['internships', 'scholarships', 'hackathons'],
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBudR24x0h_d6LUWOhPS8PFW6beIdooY5OpVbVVB-qvHMLbMLRRA40R4KyEqNnyAdbGDHmWmQj6v5h2ZDcs5DOzbgUbrCrilEl9ntR42hwbtIa-fqS1rJYQHuZtsePZasUKgm-LXtyM7jM6Y8b2nqIddOq7v4jR2rk3WELmLSlKnjPheVB8F5h8dUPBEFVzGTYNSD4GOfva1kkSNhitLze1GGO31fmhgy3Uu9XHDASxnmzurz6ZK0YDKQ',
  tier: 'Elite Tier',
  email: 'alex.vance@stanford.edu',
  institution: 'Stanford University',
  gpa: '3.92'
};

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-devpost-1',
    title: 'AI Agents & Autonomous Workflows Hackathon 2026',
    organization: 'Devpost & Anthropic',
    location: 'Virtual / Worldwide',
    type: 'Hackathon',
    matchScore: 97,
    priorityLevel: 'High Priority — Top Match',
    deadline: 'Registration Open',
    deadlineDate: '2026-09-30',
    source: 'Devpost',
    tags: ['Devpost API', 'AI Agents', '$50k Prize Pool', 'Hackathon'],
    aiMatchReason: 'Matches your verified skill competencies in AI engineering, Python, and automated pipeline design.',
    description: 'Build state-of-the-art multi-agent workflows, autonomous scrapers, and task orchestrators using Gemini and Claude APIs.',
    requirements: ['Open registration for global developers', 'Submit working codebase and demo video before deadline'],
    compensationOrGrant: '$50,000 Total Cash & Cloud Credits',
    url: 'https://devpost.com/hackathons',
    isSaved: false,
    isVerifiedListing: true,
    lastVerifiedDate: '2026-08-27',
    companyReputationScore: '4.9 / 5.0 (Devpost Official)',
    isVerifiedCompany: true,
    companyLegitimacy: {
      status: 'Official Host Entity',
      trustScore: 99,
      rating: '4.9 / 5.0 (Devpost Verified)',
      verificationBadges: ['Verified Enterprise', 'SSL Domain Cleared', 'Anti-Scam Sentry Verified', 'Active Global Host'],
      verificationDetails: 'Official verified Hackathon organizer on Devpost platform with escrowed prize pool.'
    },
    eligibilityBreakdown: {
      skillMatch: 98,
      academicAlignment: 95,
      timelineFit: 96,
      insights: [
        'Direct live listing from official Devpost platform API.',
        'High match score based on AI & Web Development skills.'
      ]
    }
  },
  {
    id: 'opp-linkedin-1',
    title: 'Senior Software Engineer — AI Systems',
    organization: 'Databricks',
    location: 'San Francisco, CA / Remote',
    type: 'Internship',
    matchScore: 94,
    priorityLevel: 'High Priority — Top Match',
    deadline: 'Rolling Applications',
    deadlineDate: '2026-10-15',
    source: 'LinkedIn Jobs',
    tags: ['LinkedIn Verified', 'AI Systems', 'Python', 'Distributed Systems'],
    aiMatchReason: 'Excellent match for your python expertise and interest in large-scale data and model serving infrastructure.',
    description: 'Design high-throughput feature stores, model governance frameworks, and real-time distributed inference pipelines.',
    requirements: ['B.S. / M.S. in Computer Science or related STEM field', 'Proficiency in Python, C++, or Go', 'Distributed computing interest'],
    compensationOrGrant: '$140,000 - $185,000 USD / Year + Equity',
    url: 'https://www.linkedin.com/jobs',
    isSaved: false,
    isVerifiedListing: true,
    lastVerifiedDate: '2026-08-27',
    companyReputationScore: '4.9 / 5.0 (LinkedIn Verified Employer)',
    isVerifiedCompany: true,
    companyLegitimacy: {
      status: 'Verified Corporate Hiring Entity',
      trustScore: 98,
      rating: '4.9 / 5.0 (Databricks Corporate)',
      verificationBadges: ['Registered Enterprise', 'LinkedIn Verified', 'Direct Career Portal', 'Zero Scam Risk'],
      verificationDetails: 'Databricks is a verified enterprise employer with authenticated domain and direct application integration.'
    },
    eligibilityBreakdown: {
      skillMatch: 95,
      academicAlignment: 92,
      timelineFit: 94,
      insights: [
        'Verified corporate listing from LinkedIn Jobs API.',
        'Matched to user profile competencies in Python & AI pipelines.'
      ]
    }
  },
  {
    id: 'opp-indeed-1',
    title: 'Full Stack Engineer (React & FastApi)',
    organization: 'Scale AI',
    location: 'Remote / US & Worldwide',
    type: 'Internship',
    matchScore: 92,
    priorityLevel: 'High Priority — Top Match',
    deadline: 'Open Intake',
    deadlineDate: '2026-09-20',
    source: 'Indeed Jobs',
    tags: ['Indeed Verified', 'React', 'FastAPI', 'Full Stack'],
    aiMatchReason: 'Matches your verified web stack competencies in TypeScript, React, Python, and microservice architecture.',
    description: 'Build user-facing telemetry, agent monitoring dashboards, and real-time data labeling interfaces for foundation models.',
    requirements: ['Experience with React, TypeScript, and FastAPI/Python', 'Understanding of REST APIs and web performance'],
    compensationOrGrant: '$120,000 - $160,000 USD / Year',
    url: 'https://www.indeed.com/jobs',
    isSaved: false,
    isVerifiedListing: true,
    lastVerifiedDate: '2026-08-27',
    companyReputationScore: '4.8 / 5.0 (Indeed Verified Employer)',
    isVerifiedCompany: true,
    companyLegitimacy: {
      status: 'Verified Hiring Entity',
      trustScore: 97,
      rating: '4.8 / 5.0 (Scale AI)',
      verificationBadges: ['Registered Tech Enterprise', 'Indeed Verified Employer', 'SSL Verified Domain'],
      verificationDetails: 'Verified hiring entity on Indeed platform with active tech engineering headcount.'
    },
    eligibilityBreakdown: {
      skillMatch: 93,
      academicAlignment: 91,
      timelineFit: 92,
      insights: [
        'Direct web crawl listing from Indeed technical jobs index.',
        'High alignment with React & FastAPI skills.'
      ]
    }
  },
  {
    id: 'opp-remotive-1',
    title: 'Backend Systems Engineer (Python / Distributed Systems)',
    organization: 'Linear',
    location: '100% Remote / Worldwide',
    type: 'Internship',
    matchScore: 90,
    priorityLevel: 'High Priority',
    deadline: 'Rolling Intake',
    deadlineDate: '2026-10-01',
    source: 'Remotive',
    tags: ['Remotive API', 'Backend', 'Python', 'Remote Tech'],
    aiMatchReason: 'Strong alignment with your backend engineering preferences and async service architecture skills.',
    description: 'Engineers high-concurrency event loops, offline-first sync engines, and database indexing for high-velocity teams.',
    requirements: ['Strong command of modern backend languages', 'Experience with PostgreSQL, Redis, and WebSockets'],
    compensationOrGrant: '$130,000 - $170,000 USD / Year',
    url: 'https://remotive.com',
    isSaved: false,
    isVerifiedListing: true,
    lastVerifiedDate: '2026-08-27',
    companyReputationScore: '4.9 / 5.0 (Remotive Verified)',
    isVerifiedCompany: true,
    companyLegitimacy: {
      status: 'Verified Remote Tech Organization',
      trustScore: 98,
      rating: '4.9 / 5.0 (Linear Official)',
      verificationBadges: ['Remotive Partner', 'Registered Entity', 'Anti-Scam Sentry Passed'],
      verificationDetails: 'Verified remote organization on Remotive API with established corporate registration.'
    },
    eligibilityBreakdown: {
      skillMatch: 92,
      academicAlignment: 89,
      timelineFit: 90,
      insights: [
        'Live listing from Remotive Remote Tech API.',
        'Matches backend software stack competencies.'
      ]
    }
  },
  {
    id: 'opp-unstop-1',
    title: 'Global Autonomous Robotics & Code Challenge 2026',
    organization: 'Unstop & Siemens',
    location: 'Online / Global',
    type: 'Hackathon',
    matchScore: 88,
    priorityLevel: 'Medium Priority',
    deadline: 'Submissions Open',
    deadlineDate: '2026-10-10',
    source: 'Unstop',
    tags: ['Unstop API', 'Hackathon', 'Robotics', 'Global Challenge'],
    aiMatchReason: 'Matches your interest in hackathons and competitive problem solving in software and algorithms.',
    description: 'Solve real-world industrial automation and intelligent agent routing challenges in virtual simulation environments.',
    requirements: ['Open to students and software developers', 'Submit code repository and benchmark score'],
    compensationOrGrant: '$30,000 Cash Prizes + Industrial Internships',
    url: 'https://unstop.com/hackathons',
    isSaved: false,
    isVerifiedListing: true,
    lastVerifiedDate: '2026-08-27',
    companyReputationScore: '4.8 / 5.0 (Unstop Verified)',
    isVerifiedCompany: true,
    companyLegitimacy: {
      status: 'Verified Competition Host',
      trustScore: 96,
      rating: '4.8 / 5.0 (Unstop Official)',
      verificationBadges: ['Verified Educational Entity', 'Unstop Host Badge', 'Zero Scam Signal'],
      verificationDetails: 'Official verified challenge host on Unstop platform with guaranteed prize distribution.'
    },
    eligibilityBreakdown: {
      skillMatch: 89,
      academicAlignment: 88,
      timelineFit: 88,
      insights: [
        'Live listing from Unstop Competition API.',
        'Verified corporate challenge sponsor.'
      ]
    }
  }
];

export const MISSED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'missed-1',
    title: 'Google APM Summer Internship',
    organization: 'Google',
    location: 'Mountain View, CA',
    type: 'Internship',
    source: 'Google Careers',
    matchScore: 92,
    deadline: 'Oct 15, 2023',
    deadlineDate: '2023-10-15',
    deadlinePassed: true,
    tags: ['Internship', 'Product Strategy', 'Bay Area'],
    aiMatchReason: "You were eligible because your profile matches required skills in Python, algorithms coursework, and demonstrated student leadership.",
    description: 'The Associate Product Manager internship at Google is the world leading product incubator for technical student leaders.',
    requirements: ['Technical CS background', 'Demonstrated user-focused product vision', 'Leadership in university organizations'],
    compensationOrGrant: '$9,500/mo + Corporate Housing',
    url: 'https://careers.google.com'
  },
  {
    id: 'missed-2',
    title: 'Palantir Women in Tech Scholarship',
    organization: 'Palantir Foundation',
    location: 'Palo Alto, CA / Global',
    type: 'Scholarship',
    source: 'Unstop',
    matchScore: 89,
    deadline: 'Nov 01, 2023',
    deadlineDate: '2023-11-01',
    deadlinePassed: true,
    tags: ['Scholarship', '$10,000', 'Mentorship'],
    aiMatchReason: 'You were eligible because you met the 3.5+ GPA requirement and your data analysis skills matched their recipient profile.',
    description: 'A prestigious national scholarship supporting exceptional women in computer science and data systems.',
    requirements: ['3.5+ GPA', 'Undergraduate standing', 'Demonstrated interest in large-scale data infrastructure'],
    compensationOrGrant: '$10,000 Direct Grant + Palantir Summit Invitation',
    url: 'https://palantir.com/scholarships'
  },
  {
    id: 'missed-3',
    title: 'Fall AI Hackathon 2023',
    organization: 'Major League Hacking',
    location: 'Virtual',
    type: 'Hackathon',
    source: 'MLH',
    matchScore: 95,
    deadline: 'Dec 12, 2023',
    deadlineDate: '2023-12-12',
    deadlinePassed: true,
    tags: ['Hackathon', 'AI Agents', '$40k Pool'],
    aiMatchReason: "You were eligible because your profile matches required skills in Python and beginner AI, with prior project experience.",
    description: 'Work directly on algorithmic accountability and fair ranking systems with open source datasets.',
    requirements: ['Statistical modeling', 'Python proficiency', 'Interest in algorithmic transparency'],
    compensationOrGrant: '$40,000 Prize Pool',
    url: 'https://mlh.io'
  }
];

export const PATHWAY_MILESTONES: PathwayMilestone[] = [
  {
    id: 'm-1',
    stage: 'Stage 01',
    title: 'Neural Foundation & Core Vector Tuning',
    timeframe: 'Months 1 - 3',
    description: 'Solidify advanced deep learning mathematical foundations, implement transformer layers from scratch, and publish reproducible GitHub benchmarks.',
    status: 'completed',
    keyActions: [
      'Implement attention mechanisms in raw PyTorch',
      'Complete high-throughput data curation pipeline',
      'Optimize model inference with quantization benchmarks'
    ],
    prerequisites: ['Python Proficiency', 'Linear Algebra Foundations'],
    recommendedOpportunities: ['Build The Future Hackathon', 'Kaggle Grandmaster Track']
  },
  {
    id: 'm-2',
    stage: 'Stage 02',
    title: 'Elite Research Associate & Lab Collaboration',
    timeframe: 'Months 4 - 8',
    description: 'Land a tier-1 research fellowship (DeepMind, CERN, or Stanford HAI) and author a first-author or co-authored preprint for NeurIPS/ICML.',
    status: 'in_progress',
    keyActions: [
      'Submit research prospectus to CERN Quantum Initiative',
      'Apply for Stanford HAI AI Ethics Fellowship ($50k)',
      'Prepare statement of intent for DeepMind Frontier Lab'
    ],
    prerequisites: ['PyTorch Mastery', 'Technical Writing Prospectus'],
    recommendedOpportunities: ['AI Research Internship', 'Quantum Computing CERN']
  },
  {
    id: 'm-3',
    stage: 'Stage 03',
    title: 'Frontier AI Safety Residency & Industry Leadership',
    timeframe: 'Months 9 - 14',
    description: 'Transition into a selective Frontier Lab Residency (Anthropic/OpenAI) leading mechanistic interpretability and high-impact deployment.',
    status: 'upcoming',
    keyActions: [
      'Complete interpretability research paper review',
      'Present findings at top-tier AI workshop',
      'Secure executive technical mentorship'
    ],
    prerequisites: ['Published Research', 'Recommendation Letters'],
    recommendedOpportunities: ['Anthropic Alignment Residency', 'OpenAI Scholars']
  },
  {
    id: 'm-4',
    stage: 'Stage 04',
    title: 'Venture & Principal Research Architect',
    timeframe: 'Months 15+',
    description: 'Deploy groundbreaking autonomous foundation systems or launch venture-backed deep tech enterprise.',
    status: 'locked',
    keyActions: [
      'Scale enterprise-grade autonomous reasoning systems',
      'Establish university fellowship fund for next-generation students'
    ],
    prerequisites: ['Stage 03 Completion'],
    recommendedOpportunities: ['Thiel Fellowship', 'YC AI Batch']
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'DeepMind AI Research Deadline Closing',
    description: 'The application window for DeepMind London closes in 4 days. Match score: 92%.',
    time: '2 hours ago',
    read: false,
    type: 'deadline'
  },
  {
    id: 'notif-2',
    title: 'New High-Value Match Discovered',
    description: 'Anthropic Frontier AI Alignment Residency matches 96% of your neural skill matrix.',
    time: '5 hours ago',
    read: false,
    type: 'match'
  },
  {
    id: 'notif-3',
    title: 'Profile Optimization Applied',
    description: 'Target objectives updated to prioritize Scholarships & Internships.',
    time: '1 day ago',
    read: true,
    type: 'system'
  }
];
