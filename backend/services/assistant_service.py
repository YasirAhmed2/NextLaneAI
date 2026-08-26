"""
services/assistant_service.py — NextLane AI
AI Career & Scholarship Assistant Service powered by Gemini 2.5/3.6 Flash.

Features:
  1. tailor_cv() — Optimizes user CV bullet points, skills, and summary for a target job/scholarship.
  2. generate_motivation_letter() — Generates a customized Statement of Purpose / Motivation Letter.
  3. generate_recommendation_letter() — Generates a customized Academic / Professional Recommendation Letter.
"""
import logging
from typing import Dict, Any, List
from services.gemini_service import gemini_service

logger = logging.getLogger("nextlane_ai")


class AssistantService:
    def tailor_cv(
        self,
        cv_text: str,
        opportunity_title: str,
        organization: str,
        opportunity_description: str,
        requirements: List[str],
        user_skills: List[str],
    ) -> Dict[str, Any]:
        """
        Uses Gemini to tailor a user's CV specifically for a target opportunity.
        Returns optimized summary, aligned key skills, and customized bullet points.
        """
        prompt = f"""
You are an expert AI Career Coach and Resume Optimizer.
Tailor the user's CV specifically for the following target opportunity:

Target Opportunity: {opportunity_title} at {organization}
Description: {opportunity_description[:800]}
Key Requirements: {', '.join(requirements[:5]) if requirements else 'Standard STEM / CS Requirements'}
User Skills: {', '.join(user_skills[:10]) if user_skills else 'General Technical Skills'}

User Original CV Content:
{cv_text[:2500] if cv_text else 'No CV uploaded. Provide a high-impact template based on user skills.'}

Produce a JSON response with:
- "tailoredSummary": A 3-sentence powerful professional summary customized for this role.
- "highlightedSkills": Top 8 ATS-optimized keywords & skills to feature prominently.
- "tailoredExperienceBullets": 4-5 high-impact bullet points demonstrating achievement aligned with the role.
- "matchScoreEstimate": Estimated percentage match (0-100).
- "atsAdvice": 2-3 specific recommendations to pass ATS scanners for {organization}.
"""
        try:
            response = gemini_service.client.models.generate_content(
                model=gemini_service.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.3,
                }
            )
            import json
            data = json.loads(response.text)
            return {
                "success": True,
                "target": f"{opportunity_title} at {organization}",
                "tailoredSummary": data.get("tailoredSummary", ""),
                "highlightedSkills": data.get("highlightedSkills", []),
                "tailoredExperienceBullets": data.get("tailoredExperienceBullets", []),
                "matchScoreEstimate": data.get("matchScoreEstimate", 88),
                "atsAdvice": data.get("atsAdvice", []),
            }
        except Exception as e:
            logger.error(f"[ASSISTANT] CV tailoring failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "tailoredSummary": f"Tailored resume overview for {opportunity_title} at {organization}. Highlight your key expertise in {', '.join(user_skills[:3]) if user_skills else 'software engineering'}.",
                "highlightedSkills": user_skills[:6] if user_skills else ["Problem Solving", "Team Collaboration"],
                "tailoredExperienceBullets": [
                    f"Engineered scalable solutions aligned with {organization} technical standards.",
                    f"Collaborated with cross-functional teams to deliver high-quality software artifacts.",
                ],
                "matchScoreEstimate": 85,
                "atsAdvice": ["Quantify key achievements with percentages and metrics.", "Mirror exact keyword phrasing from job requirements."],
            }

    def generate_letter(
        self,
        letter_type: str,
        scholarship_title: str,
        organization: str,
        scholarship_description: str,
        user_profile: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Uses Gemini to generate a tailored Motivation Letter or Recommendation Letter for a scholarship.
        """
        username = user_profile.get("name") or user_profile.get("fullName") or "Applicant"
        skills = user_profile.get("skills", [])
        education = user_profile.get("education") or user_profile.get("educationLevel") or "Undergraduate Student"

        if letter_type == "recommendation_letter":
            prompt = f"""
Draft a formal Academic / Professional Recommendation Letter on behalf of a Professor or Senior Engineering Manager for the following applicant:

Applicant Name: {username}
Education Level: {education}
Technical Competencies: {', '.join(skills[:8]) if skills else 'Computer Science & Software Development'}
Target Scholarship / Program: {scholarship_title} by {organization}
Program Overview: {scholarship_description[:600]}

The recommendation letter must:
- Be formal, professional, and convincing
- Highlight academic diligence, leadership, technical proficiency, and impact
- Be structured in 4 paragraphs (Introduction, Technical/Academic Assessment, Soft Skills/Leadership, Strong Endorsement)
- Use placeholders like [Professor Name], [Department], [University] where appropriate.
"""
        else:  # motivation_letter / statement of purpose
            prompt = f"""
Draft a compelling, authentic Motivation Letter (Statement of Purpose) for the following scholarship applicant:

Applicant Name: {username}
Current Qualification: {education}
Key Skills & Passions: {', '.join(skills[:8]) if skills else 'AI, Software Engineering, Global Impact'}
Target Scholarship: {scholarship_title} hosted by {organization}
Scholarship Details: {scholarship_description[:600]}

The motivation letter must:
- Convey strong motivation, academic aspiration, and commitment to global impact
- Explain WHY this specific scholarship at {organization} is pivotal for the applicant's career
- Be structured in 4 clear paragraphs (Hook & Aspirations, Academic/Technical Background, Alignment with {organization}, Future Vision & Gratitude)
"""
        try:
            response = gemini_service.client.models.generate_content(
                model=gemini_service.model_name,
                contents=prompt,
                config={"temperature": 0.4}
            )
            letter_text = response.text.strip()
            return {
                "success": True,
                "letterType": letter_type,
                "scholarshipTitle": scholarship_title,
                "organization": organization,
                "applicantName": username,
                "letterContent": letter_text,
            }
        except Exception as e:
            logger.error(f"[ASSISTANT] Letter generation failed: {e}")
            fallback_title = "Recommendation Letter" if letter_type == "recommendation_letter" else "Motivation Letter"
            return {
                "success": False,
                "letterType": letter_type,
                "scholarshipTitle": scholarship_title,
                "organization": organization,
                "applicantName": username,
                "letterContent": f"To the Selection Committee,\n\nI am writing to express my strong endorsement for {username} regarding the {scholarship_title} at {organization}. {username} has consistently demonstrated exceptional technical proficiency in {', '.join(skills[:3]) if skills else 'computer science'} and outstanding academic commitment.\n\nSincerely,\nAcademic Advisory Board",
            }


assistant_service = AssistantService()
