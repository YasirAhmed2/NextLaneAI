"""
models/schemas.py — NextLane AI
Pydantic schemas for request/response validation.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


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
    email: Optional[str] = ""           # Used for proactive deadline email alerts
    education: Optional[str] = ""
    educationLevel: Optional[str] = ""
    skills: List[str] = Field(default_factory=list)
    interests: Optional[List[str]] = Field(default_factory=list)
    targetObjectives: Optional[List[str]] = Field(default_factory=list)
    linkedInUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    resumeFileName: Optional[str] = None

    @field_validator("name", "fullName", "education", "educationLevel", mode="before")
    @classmethod
    def sanitize_string(cls, v):
        """Strip and limit string fields to prevent injection."""
        if v is None:
            return ""
        s = str(v).strip()
        # Remove prompt-injection sequences
        for seq in ["```", "###", "SYSTEM:", "IGNORE PREVIOUS", "<script"]:
            s = s.replace(seq, "")
        return s[:500]

    @field_validator("skills", "interests", "targetObjectives", mode="before")
    @classmethod
    def sanitize_list(cls, v):
        """Sanitize and cap list inputs."""
        if not isinstance(v, list):
            return []
        cleaned = []
        for item in v:
            if item and isinstance(item, str):
                s = item.strip()[:100]
                cleaned.append(s)
        return cleaned[:20]

    def get_effective_name(self) -> str:
        return (self.fullName or self.name or "Student").strip()

    def get_effective_education(self) -> str:
        return (self.educationLevel or self.education or "Undergraduate").strip()

    def get_effective_skills(self) -> List[str]:
        sanitized = [s.strip() for s in self.skills if s and isinstance(s, str)]
        return sanitized[:15]

    def get_effective_interests(self) -> List[str]:
        raw = self.targetObjectives or self.interests or []
        return [i.strip() for i in raw if i and isinstance(i, str)]


# ── Agent Response Schemas ────────────────────────────────────────────────────

class AgentPlanResponse(BaseModel):
    """Schema for the Gemini-generated agent plan."""
    sources: List[str] = Field(default_factory=list)
    priority: str = "all"
    reasoning: str = ""
    goal: str = ""


class AgentExecutionResponse(BaseModel):
    """Schema for the full agent execution result."""
    status: str
    plan: Optional[AgentPlanResponse] = None
    steps_log: List[str] = Field(default_factory=list)
    sources_used: List[str] = Field(default_factory=list)
    opportunities_scraped: int = 0
    matched_count: int = 0
    duration_ms: int = 0
    timestamp: str = ""

    # NOTE: matched_results is intentionally excluded from this schema
    # to avoid huge response payloads in status checks.
    # Use the /match-all endpoint for full results.


class AgentRunResponse(BaseModel):
    """Legacy schema kept for backward compatibility."""
    status: str
    timestamp: str
    opportunitiesCount: int
    sources: List[str]
