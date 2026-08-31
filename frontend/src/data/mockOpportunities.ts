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
    "id": "devpost-1-6922",
    "title": "RevenueCat Shipaton 2026",
    "organization": "RevenueCat",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Jul 31 - Oct 01, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in RevenueCat Shipaton 2026 on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>740,000</span>",
    "url": "https://revenuecat-shipaton-2026.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: RevenueCat."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922034Z"
  },
  {
    "id": "devpost-2-8363",
    "title": "All Things Agentic Hackathon",
    "organization": "Google",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Aug 04 - 31, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in All Things Agentic Hackathon on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>180,000</span>",
    "url": "https://allthingsagentichackathon.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: Google."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922073Z"
  },
  {
    "id": "devpost-3-1704",
    "title": "Agentic Cinema: The Blockbuster Hackathon",
    "organization": "Google",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Jul 27 - Sep 09, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in Agentic Cinema: The Blockbuster Hackathon on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>75,000</span>",
    "url": "https://agentic-cinema.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: Google."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922097Z"
  },
  {
    "id": "devpost-4-8997",
    "title": "Agents for Humans Hackathon",
    "organization": "Amazon",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Aug 10 - Sep 14, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in Agents for Humans Hackathon on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>40,000</span>",
    "url": "https://agentsforhumans.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: Amazon."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922118Z"
  },
  {
    "id": "devpost-5-9030",
    "title": "CALL-E: Your Code Is Calling",
    "organization": "CALL-E",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Jul 23 - Sep 14, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in CALL-E: Your Code Is Calling on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>10,000</span>",
    "url": "https://call-e.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: CALL-E."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922138Z"
  },
  {
    "id": "devpost-6-1839",
    "title": "The WebMCP Challenge",
    "organization": "OpenAI",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Aug 25 - Sep 03, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in The WebMCP Challenge on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>35,000</span>",
    "url": "https://webmcp.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: OpenAI."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922156Z"
  },
  {
    "id": "devpost-7-2653",
    "title": "AI Builders Hackathon",
    "organization": "OSC",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Aug 21 - Sep 15, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in AI Builders Hackathon on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>33,900</span>",
    "url": "https://ai-builders-hackathon-2026.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: OSC."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922174Z"
  },
  {
    "id": "devpost-8-8141",
    "title": "VoltHacks",
    "organization": "Dialogate",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "May 22 - Sep 05, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in VoltHacks on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>35,785</span>",
    "url": "https://volthacks.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: Dialogate."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922192Z"
  },
  {
    "id": "devpost-9-8317",
    "title": "3D Websites Hackathon",
    "organization": "Tanishq Kumar",
    "location": "Virtual / Global",
    "type": "Hackathon",
    "deadline": "Jun 22 - Aug 31, 2026",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Devpost",
    "tags": [
      "Devpost API",
      "Hackathon",
      "Global Prize Pool"
    ],
    "description": "Participate in 3D Websites Hackathon on Devpost. Compete with global developers.",
    "requirements": [
      "Open registration for global developers",
      "Submit working software demo before deadline"
    ],
    "compensationOrGrant": "$<span data-currency-value>55</span>",
    "url": "https://3d-websites-hackathon.devpost.com/",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.9 / 5.0 (Devpost Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Virtual / Global",
      "insights": [
        "Direct live listing from official Devpost platform API.",
        "Verified Organization: Tanishq Kumar."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.922210Z"
  },
  {
    "id": "remotive-1-8910",
    "title": "Content Reviewer - English US",
    "organization": "TELUS Digital",
    "location": "USA",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Our global AI Community is a vibrant network of more than one million contributors from diverse backgrounds who help customers collect, enhance, train, translate, and localize content to build better AI models. Become part of our growing community and contribute to the development of innovative AI technologies used by some of the world's largest brands. We are looking for an independent, flexible,",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$14/hour",
    "url": "https://remotive.com/remote-jobs/all-others/content-reviewer-english-us-2091105",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "USA",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: TELUS Digital."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.706374Z"
  },
  {
    "id": "remotive-2-9957",
    "title": "Senior Golang Developer",
    "organization": "Lemon.io",
    "location": "Europe, USA, UK, Canada, Australia, Singapore",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Are you a talented Senior Developer looking for a remote job that lets you show your skills and get decent compensation? Look no further than Lemon.io \u2014 the marketplace that connects you with hand-picked startups in the US and Europe. We are currently seeking a Senior Software Engineer for our client \u2014 a research-driven artificial intelligence company. The client\u2019s mission is to cut the cost of mo",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/software-development/senior-golang-developer-2091098",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Europe, USA, UK, Canada, Australia, Singapore",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Lemon.io."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.723062Z"
  },
  {
    "id": "remotive-3-7458",
    "title": "Vice President, Technology & Digital Strategy",
    "organization": "Shatterproof",
    "location": "USA",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "About ShatterproofShatterproof is a national nonprofit working toward a world where addiction never defines or ends a life. Through evidence-based programs, advocacy, and public education, Shatterproof works to transform systems for tomorrow, support families today, and end stigma forever. Learn more at shatterproof.org.Who Succeeds at ShatterproofShatterproof is in a period of transformative and",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "175k - 190k",
    "url": "https://remotive.com/remote-jobs/all-others/vice-president-technology-digital-strategy-2091104",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "USA",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Shatterproof."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.761594Z"
  },
  {
    "id": "remotive-4-1455",
    "title": "Senior Data Engineer",
    "organization": "Lemon.io",
    "location": "LATAM, Europe, USA, Canada, APAC",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Are you a talented Senior Data Engineer looking for a remote job that lets you show your skills and get decent compensation? Look no further than Lemon.io \u2014 the marketplace that connects you with hand-picked startups in the US and Europe. What we offer: The rate depends on your skills and experience. We've already paid out over $11M to our engineers. No more hunting for clients or negotiating rate",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/software-development/senior-data-engineer-2091097",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "LATAM, Europe, USA, Canada, APAC",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Lemon.io."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.781122Z"
  },
  {
    "id": "remotive-5-3451",
    "title": "Senior Independent AI Engineer / Architect",
    "organization": "A.Team",
    "location": "Americas, Europe, Israel",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Senior Independent AI Engineer / Architect Remote | Americas, Europe, or Israel Most AI engineers can find work. Finding work worth doing is harder. A.Team is an invite-only network of senior AI engineers, ML engineers, and AI architects building production AI systems for startups, enterprises, and global companies. Since 2020, builders in the network have earned more than $200M working with compa",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$120 - $170 /hour",
    "url": "https://remotive.com/remote-jobs/software-development/senior-independent-ai-engineer-architect-1919266",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Americas, Europe, Israel",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: A.Team."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.788148Z"
  },
  {
    "id": "remotive-6-6486",
    "title": "Senior Independent Software Developer",
    "organization": "A.Team",
    "location": "Americas, Europe, Israel",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "You must be located in the Americas, Europe, or Israel to apply.A\u00b7Team is a VC-backed, stealth, application-only home on the internet for senior independent software builders to team up with hand-picked, high-growth companies on their next big thing. After talking with hundreds of independent engineers, designers, and product folks, we heard over and over that finding vetted, high-quality, consist",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$90 - $150 /hour",
    "url": "https://remotive.com/remote-jobs/software-development/senior-independent-software-developer-1919265",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Americas, Europe, Israel",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: A.Team."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.794945Z"
  },
  {
    "id": "remotive-7-5505",
    "title": "Head of Marketing & Communications",
    "organization": "garden3d",
    "location": "Worldwide",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "We are hiring a Head of Marketing & Communications to tell the garden3d story across the internet, from wherever in the world you happen to be. More details if you check our original job posting link About garden3d We are worker owned creative collective, innovating on everything from brands and IRL communities to IoT devices and cross platform apps. We share profit, open source everything, spin o",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$150k - $230k",
    "url": "https://remotive.com/remote-jobs/marketing/head-of-marketing-communications-2091068",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Worldwide",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: garden3d."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.811817Z"
  },
  {
    "id": "remotive-8-7581",
    "title": "Tech Lead Full-Stack Rails Engineer",
    "organization": "Mitre Media",
    "location": "USA, Canada, USA timezones",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "About Mitre Media Mitre Media is redefining FinTech with AI-driven tools that empower millions of investors. Our portfolio, including Dividend.com and MutualFunds.com, leverages LLMs to deliver novel data insights and visually rich user experiences. For over a decade, we\u2019ve served individual investors, financial advisors, and top asset managers like BlackRock and Vanguard through our premium data,",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$170k - $200k",
    "url": "https://remotive.com/remote-jobs/software-development/tech-lead-full-stack-rails-engineer-2069746",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "USA, Canada, USA timezones",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Mitre Media."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.824541Z"
  },
  {
    "id": "remotive-9-7449",
    "title": "Face Deduplication Collection",
    "organization": "TELUS Digital",
    "location": "USA",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "The project compensation rate is $0.55 USD per accepted image. The objective of this project is to collect a large and diverse dataset of current neutral selfies, head-pose captures, and historical facial images to support machine-learning research and facial recognition model training at TELUS. The focus is on capturing real-world variation across lighting, poses, expressions, accessories, enviro",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Pay per task",
    "url": "https://remotive.com/remote-jobs/all-others/face-deduplication-collection-2091093",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "USA",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: TELUS Digital."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.826786Z"
  },
  {
    "id": "remotive-10-9876",
    "title": "Remote Office Assistant",
    "organization": "Coalition Technologies",
    "location": "Worldwide",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Coalition Technologies is seeking a reliable, detail-oriented, and highly organized Remote Office Assistant to support administrative, bookkeeping, billing, reporting, data entry, and internal operations tasks. This role is ideal for someone with strong communication skills, discretion, attention to detail, and a willingness to learn and grow within a fast-paced remote work environment. As an Offi",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$31,2k- $52k",
    "url": "https://remotive.com/remote-jobs/marketing/remote-office-assistant-1680495",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Worldwide",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Coalition Technologies."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.831358Z"
  },
  {
    "id": "remotive-11-5936",
    "title": "Inside Sales Contractor",
    "organization": "Credit Wellness, LLC",
    "location": "Worldwide",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "About Us We are a financial services start up focusing on helping to improve consumer credit profiles. We are currently seeking KPI driven sales representatives looking to earn up to 45K in their first year while working remotely. We offer comprehensive training and continuous sales coaching to help you meet your financial goals. During our training period we offer a guaranteed training stipend wh",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "OTE $25k - $35k",
    "url": "https://remotive.com/remote-jobs/sales/inside-sales-contractor-2086540",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Worldwide",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Credit Wellness, LLC."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.843648Z"
  },
  {
    "id": "remotive-12-7906",
    "title": "Tier III Service Desk Engineer",
    "organization": "Unio Digital",
    "location": "Worldwide",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Uni\u00f3 Digital is an Arizona-based managed service provider (MSP) delivering Managed IT Services, Low Voltage Cabling, Access Control, Video Surveillance, and Intrusion Services. We believe technology should be intuitive, not intimidating. We are looking for an experienced Tier 3 Service Desk Technician with exceptional problem-solving skills. You will serve as the escalation point within the team,",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/information-technology/tier-iii-service-desk-engineer-2091045",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Worldwide",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Unio Digital."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.851530Z"
  },
  {
    "id": "remotive-13-7746",
    "title": "Sales Jedi",
    "organization": "Creative Force",
    "location": "Europe",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Great salary | Profit share | 100% remote |Work from anywhere in Europe | SaaS Awesome opportunity for a self-motivated and energetic people person to join our remote team and help sell our world-leading SaaS products, from anywhere in Europe. We pay a great salary, based on experience and location. We don\u2019t pay commissions, because good sales are a team effort\u2014from engineering, to operations, mar",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/sales/sales-jedi-2091088",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Europe",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Creative Force."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.856399Z"
  },
  {
    "id": "remotive-14-5724",
    "title": "SaaS Product Support Jedi",
    "organization": "Creative Force",
    "location": "Europe, EMEA, UK, Germany, France, European timezones",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "We\u2019re on the hunt for a sharp, self-driven SaaS pro who\u2019s as comfortable troubleshooting API and integrations as they are navigating human conversations. Our European client base is growing fast and we need someone who can keep up. Our software isn\u2019t your average plug-and-play; it has a steep learning curve so you\u2019ll need to be technically savvy while also being the kind of person clients genuinel",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/customer-service/saas-product-support-jedi-2091087",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Europe, EMEA, UK, Germany, France, European timezones",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Creative Force."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.861325Z"
  },
  {
    "id": "remotive-15-7707",
    "title": "Freelance Writer",
    "organization": "IAPWE",
    "location": "Worldwide",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Our organization is seeking content writers to create articles and blog posts on a variety of topics. The rate of pay is $20 per 100 words (this comes out to approximately $100 per article or $50 per hour). Some topics you may be asked to write about include the following (you can always turn down a topic if you do not feel comfortable writing about it, however if you have experience or expertise",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$50-$75 /hour",
    "url": "https://remotive.com/remote-jobs/writing/freelance-writer-1185979",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Worldwide",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: IAPWE."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.864467Z"
  },
  {
    "id": "unstop-1-453",
    "title": "HackCelestial 3.0",
    "organization": "Pillai University, Navi Mumbai",
    "location": "Online / Global",
    "type": "Hackathon",
    "deadline": "Open Registration",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Unstop",
    "tags": [
      "Unstop API",
      "Hackathon",
      "Student Competition"
    ],
    "description": "HackCelestial 3.0 challenge hosted by Pillai University, Navi Mumbai on Unstop platform.",
    "requirements": [
      "Student / developer eligibility",
      "Online submission before deadline"
    ],
    "compensationOrGrant": "Cash Awards & Certificates",
    "url": "https://unstop.com/hackathons/hackcelestial-30-pillai-university-navi-mumbai-1737808",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Unstop Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Online / Global",
      "insights": [
        "Direct live listing from official Unstop platform API.",
        "Verified Organization: Pillai University, Navi Mumbai."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.876084Z"
  }
];

export const MISSED_OPPORTUNITIES: Opportunity[] = [
  {
    "id": "remotive-13-7746",
    "title": "Sales Jedi",
    "organization": "Creative Force",
    "location": "Europe",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Great salary | Profit share | 100% remote |Work from anywhere in Europe | SaaS Awesome opportunity for a self-motivated and energetic people person to join our remote team and help sell our world-leading SaaS products, from anywhere in Europe. We pay a great salary, based on experience and location. We don\u2019t pay commissions, because good sales are a team effort\u2014from engineering, to operations, mar",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/sales/sales-jedi-2091088",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Europe",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Creative Force."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.856399Z"
  },
  {
    "id": "remotive-14-5724",
    "title": "SaaS Product Support Jedi",
    "organization": "Creative Force",
    "location": "Europe, EMEA, UK, Germany, France, European timezones",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "We\u2019re on the hunt for a sharp, self-driven SaaS pro who\u2019s as comfortable troubleshooting API and integrations as they are navigating human conversations. Our European client base is growing fast and we need someone who can keep up. Our software isn\u2019t your average plug-and-play; it has a steep learning curve so you\u2019ll need to be technically savvy while also being the kind of person clients genuinel",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "Competitive USD Rate",
    "url": "https://remotive.com/remote-jobs/customer-service/saas-product-support-jedi-2091087",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Europe, EMEA, UK, Germany, France, European timezones",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: Creative Force."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.861325Z"
  },
  {
    "id": "remotive-15-7707",
    "title": "Freelance Writer",
    "organization": "IAPWE",
    "location": "Worldwide",
    "type": "Job",
    "deadline": "Rolling Intake",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Remotive",
    "tags": [
      "Remotive API",
      "Remote Tech",
      "Software Engineering"
    ],
    "description": "Our organization is seeking content writers to create articles and blog posts on a variety of topics. The rate of pay is $20 per 100 words (this comes out to approximately $100 per article or $50 per hour). Some topics you may be asked to write about include the following (you can always turn down a topic if you do not feel comfortable writing about it, however if you have experience or expertise",
    "requirements": [
      "Proficiency in modern software stack",
      "Async remote collaboration"
    ],
    "compensationOrGrant": "$50-$75 /hour",
    "url": "https://remotive.com/remote-jobs/writing/freelance-writer-1185979",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Remotive Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Worldwide",
      "insights": [
        "Direct live listing from official Remotive platform API.",
        "Verified Organization: IAPWE."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.864467Z"
  },
  {
    "id": "unstop-1-453",
    "title": "HackCelestial 3.0",
    "organization": "Pillai University, Navi Mumbai",
    "location": "Online / Global",
    "type": "Hackathon",
    "deadline": "Open Registration",
    "deadlineDate": "2026-08-26",
    "urgent24h": false,
    "source": "Unstop",
    "tags": [
      "Unstop API",
      "Hackathon",
      "Student Competition"
    ],
    "description": "HackCelestial 3.0 challenge hosted by Pillai University, Navi Mumbai on Unstop platform.",
    "requirements": [
      "Student / developer eligibility",
      "Online submission before deadline"
    ],
    "compensationOrGrant": "Cash Awards & Certificates",
    "url": "https://unstop.com/hackathons/hackcelestial-30-pillai-university-navi-mumbai-1737808",
    "isVerifiedListing": true,
    "lastVerifiedDate": "2026-08-26",
    "companyReputationScore": "4.8 / 5.0 (Unstop Verified)",
    "isVerifiedCompany": true,
    "eligibilityBreakdown": {
      "skillMatch": 88,
      "academicAlignment": 90,
      "timelineFit": 85,
      "locationRequirement": "Online / Global",
      "insights": [
        "Direct live listing from official Unstop platform API.",
        "Verified Organization: Pillai University, Navi Mumbai."
      ]
    },
    "scrapedAt": "2026-08-26T18:49:32.876084Z"
  }
];

export const PATHWAY_MILESTONES: PathwayMilestone[] = [
  {
    id: 'm1',
    category: 'hackathons',
    title: 'Prototype & Submit to Global Hackathon',
    targetDate: '2026-09-15',
    status: 'in-progress',
    steps: [
      'Assemble cross-functional development squad or register solo',
      'Architect full-stack MVP leveraging Gemini / Anthropic API agents',
      'Record 2-minute demonstration video and deploy public web artifact'
    ]
  },
  {
    id: 'm2',
    category: 'scholarships',
    title: 'International Master\'s / Fellowship Submission',
    targetDate: '2026-10-01',
    status: 'upcoming',
    steps: [
      'Finalize Statement of Purpose utilizing AI Letter Assistant',
      'Secure 2 institutional recommendation endorsements',
      'Submit credential package through portal prior to deadline cutoff'
    ]
  },
  {
    id: 'm3',
    category: 'internships',
    title: 'Top-Tier Remote Software Internship Applications',
    targetDate: '2026-10-20',
    status: 'upcoming',
    steps: [
      'Run CV Tailoring Agent against target job descriptions',
      'Optimize GitHub repository documentation and live demo links',
      'Submit applications to verified RemoteOK & Remotive roles'
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Autonomous Scraper Pipeline Synchronized',
    description: 'NextLane AI Agent indexed fresh verified opportunities across Devpost, Remotive, Unstop, and Opportunities Corner.',
    time: '5m ago',
    read: false,
    type: 'agent'
  },
  {
    id: 'n2',
    title: 'Top Compatibility Match Identified',
    description: 'High affinity opportunity matched your Python & AI competencies.',
    time: '25m ago',
    read: false,
    type: 'match'
  }
];
