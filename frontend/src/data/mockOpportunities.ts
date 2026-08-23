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
    id: 'opp-1',
    title: 'AI Research Internship',
    organization: 'DeepMind',
    location: 'London, UK (Hybrid)',
    type: 'Internship',
    source: 'Google Careers',
    matchScore: 92,
    deadline: 'Oct 15',
    deadlineDate: '2026-10-15',
    deadlinePassed: false,
    tags: ['Stipend', 'Hybrid', 'Deep Learning', 'PyTorch'],
    aiMatchReason: 'You match because your skills include Python and AI model optimization. Your coursework in PyTorch aligns directly with their core requirements.',
    description: 'Join the Frontier Intelligence team at Google DeepMind working on state-of-the-art transformer architectures, memory mechanisms, and sparse reasoning graphs.',
    requirements: [
      'Strong foundational proficiency in Python and PyTorch',
      'Demonstrated research curiosity in deep generative models or RL',
      'Undergraduate or graduate standing in CS, Math, or Physics',
      'Prior participation in hackathons or open-source AI projects'
    ],
    compensationOrGrant: '£6,200/mo + Housing Allowance',
    url: 'https://deepmind.google/careers',
    isSaved: true,
    eligibilityBreakdown: {
      skillMatch: 95,
      academicAlignment: 90,
      timelineFit: 91,
      insights: [
        'Python and PyTorch competencies exceed baseline qualification',
        'Academic trajectory in Computer Science is a direct match',
        'Application deadline coincides well with your target Spring term'
      ]
    }
  },
  {
    id: 'opp-2',
    title: 'Women in Tech Grant',
    organization: 'Google Foundation',
    location: 'Global',
    type: 'Scholarship',
    source: 'Unstop',
    matchScore: 85,
    deadline: 'Nov 01',
    deadlineDate: '2026-11-01',
    deadlinePassed: false,
    tags: ['$10,000 Award', 'Mentorship', 'Global Access'],
    aiMatchReason: "You match because your academic standing, leadership record, and technical writing skills fulfill the foundation's high-merit criteria.",
    description: 'A prestigious global initiative recognizing innovative technologists who demonstrate exceptional academic achievement, community leadership, and passion for breaking systemic barriers in computational sciences.',
    requirements: [
      'Enrolled as a full-time undergraduate or graduate student',
      'Demonstrated track record of community involvement or mentorship',
      '3.5+ GPA or equivalent academic distinction',
      '500-word statement on ethical AI and societal impact'
    ],
    compensationOrGrant: '$10,000 Direct Grant + Executive Mentorship',
    url: 'https://buildyourfuture.withgoogle.com',
    isSaved: true,
    eligibilityBreakdown: {
      skillMatch: 84,
      academicAlignment: 88,
      timelineFit: 83,
      insights: [
        'High GPA and leadership portfolio meet upper quartile standards',
        'Essay requirement leverages your Technical Writing skill matrix'
      ]
    }
  },
  {
    id: 'opp-3',
    title: 'Quantum Computing Research Associate',
    organization: 'CERN',
    location: 'Geneva, Switzerland (Hybrid)',
    type: 'Internship',
    source: 'CERN Portal',
    matchScore: 94,
    deadline: 'Nov 20',
    deadlineDate: '2026-11-20',
    deadlinePassed: false,
    tags: ['Stipend', 'Summer 2026', 'Quantum Simulators'],
    aiMatchReason: 'You match because your background in Python numerical computation and linear algebra puts you in the top tier of candidates for quantum simulation.',
    description: 'Contribute to the CERN Quantum Technology Initiative exploring hybrid classical-quantum algorithms for high energy particle collision anomaly detection.',
    requirements: [
      'Experience with Python, Qiskit or Cirq simulation workflows',
      'Solid mathematical grounding in linear algebra and tensor calculus',
      'Curiosity for particle physics data pipelines'
    ],
    compensationOrGrant: 'CHF 4,800/mo + Geneva Travel Grant',
    url: 'https://home.cern/careers',
    isSaved: true,
    eligibilityBreakdown: {
      skillMatch: 96,
      academicAlignment: 92,
      timelineFit: 94,
      insights: [
        'Data analysis matrix matches CERN open telemetry pipelines',
        'Remote and on-campus hybrid accommodation covered'
      ]
    }
  },
  {
    id: 'opp-4',
    title: 'Global AI Ethics Fellowship',
    organization: 'Stanford University HAI',
    location: 'Stanford, CA (Hybrid)',
    type: 'Scholarship',
    source: 'Stanford Portal',
    matchScore: 89,
    deadline: 'Dec 05',
    deadlineDate: '2026-12-05',
    deadlinePassed: false,
    tags: ['$50k Grant', 'Requires Proposal', 'HAI Residency'],
    aiMatchReason: 'You match because your technical writing capability and ML foundation match HAI focus on transparency and ethical model alignment.',
    description: 'A dedicated 9-month fellowship funding interdisciplinary scholars investigating fairness, mechanistic interpretability, and robust governance frameworks.',
    requirements: [
      'Submissions of a 2-page research prospectus on AI alignment',
      'Demonstrated proficiency in empirical data analysis',
      'Two faculty letters of recommendation'
    ],
    compensationOrGrant: '$50,000 Research Grant + Faculty Advisory',
    url: 'https://hai.stanford.edu',
    isSaved: true,
    eligibilityBreakdown: {
      skillMatch: 90,
      academicAlignment: 94,
      timelineFit: 83,
      insights: [
        'HAI values cross-disciplinary technical writing paired with ML chops',
        'Proposal submission date fits your current research timeline'
      ]
    }
  },
  {
    id: 'opp-5',
    title: 'Build The Future: Clean Tech Hackathon',
    organization: 'MIT Media Lab',
    location: 'Cambridge, MA (Hybrid)',
    type: 'Hackathon',
    source: 'Devpost',
    matchScore: 88,
    deadline: 'Oct 15-17',
    deadlineDate: '2026-10-17',
    deadlinePassed: false,
    tags: ['Team Event', 'Oct 15-17', '$75k Prize Pool'],
    aiMatchReason: 'You match because your data analysis skills and rapid prototyping ability align with the climate intelligence track.',
    description: 'A high-velocity 48-hour global hackathon co-hosted by MIT Energy Initiative & Media Lab focusing on AI for grid optimization, carbon capture sensing, and renewable modeling.',
    requirements: [
      'Teams of 2 to 4 student creators or researchers',
      'Working open-source prototype submitted before final judging',
      'Integration of climate or geospatial data pipelines'
    ],
    compensationOrGrant: '$75,000 Prize Pool + YC Interview Fast-track',
    url: 'https://media.mit.edu',
    isSaved: true,
    eligibilityBreakdown: {
      skillMatch: 91,
      academicAlignment: 86,
      timelineFit: 87,
      insights: [
        'Team matching engine will pair your ML skills with hardware engineers'
      ]
    }
  },
  {
    id: 'opp-6',
    title: 'Frontier AI Global Hackathon',
    organization: 'Major League Hacking',
    location: 'Virtual / Global',
    type: 'Hackathon',
    source: 'MLH',
    matchScore: 96,
    deadline: 'Nov 12-14',
    deadlineDate: '2026-11-14',
    deadlinePassed: false,
    tags: ['Global', '$50,000 Pool', 'Virtual'],
    aiMatchReason: 'You match because your Python and Machine Learning background fits the autonomous agents track directly.',
    description: 'Join over 2,000 builders in an intensive 48-hour sprint building autonomous agents, multimodal interfaces, and safety evaluations.',
    requirements: [
      'Open to all enrolled students worldwide',
      'Build using provided AI model APIs and open source frameworks',
      '3-minute demo video submission'
    ],
    compensationOrGrant: '$50,000 Prize Pool + Cloud Credits',
    url: 'https://mlh.io',
    isSaved: false,
    eligibilityBreakdown: {
      skillMatch: 98,
      academicAlignment: 95,
      timelineFit: 95,
      insights: [
        'Top 1% alignment with current team competition priorities'
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
