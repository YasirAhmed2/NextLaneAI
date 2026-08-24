from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EligibilityBreakdown(BaseModel):
    skillMatch: int = 85
    academicAlignment: int = 85
    timelineFit: int = 85
    insights: List[str] = Field(default_factory=list)

class OpportunitySchema(BaseModel):
    id: str
    title: str
    organization: str
    location: str = "Global / Remote"
    type: str = "Internship"  # 'Internship' | 'Scholarship' | 'Hackathon' | 'Research'
    matchScore: int = 80
    score: Optional[int] = None
    deadline: str = "Upcoming"
    deadlineDate: Optional[str] = None
    deadlinePassed: bool = False
    source: Optional[str] = "NextLane AI Aggregator"
    tags: List[str] = Field(default_factory=list)
    aiMatchReason: str = "Matches your current technical competencies and learning roadmap."
    reason: Optional[str] = None
    description: str = ""
    requirements: List[str] = Field(default_factory=list)
    compensationOrGrant: Optional[str] = None
    url: Optional[str] = None
    isSaved: bool = False
    eligibilityBreakdown: Optional[EligibilityBreakdown] = None

class UserProfileRequest(BaseModel):
    name: Optional[str] = ""
    fullName: Optional[str] = ""
    education: Optional[str] = ""
    educationLevel: Optional[str] = ""
    skills: List[str] = Field(default_factory=list)
    interests: Optional[List[str]] = Field(default_factory=list)
    targetObjectives: Optional[List[str]] = Field(default_factory=list)
    linkedInUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    resumeFileName: Optional[str] = None

    def get_effective_name(self) -> str:
        return (self.fullName or self.name or "Student").strip()

    def get_effective_education(self) -> str:
        return (self.educationLevel or self.education or "Undergraduate").strip()

    def get_effective_skills(self) -> List[str]:
        # Guardrail: sanitize and cap max skills to prevent prompt injection / bloating
        sanitized = [s.strip() for s in self.skills if s and isinstance(s, str)]
        return sanitized[:15]

    def get_effective_interests(self) -> List[str]:
        raw = self.targetObjectives or self.interests or []
        return [i.strip() for i in raw if i and isinstance(i, str)]

class AgentRunResponse(BaseModel):
    status: str
    timestamp: str
    opportunitiesCount: int
    sources: List[str]
