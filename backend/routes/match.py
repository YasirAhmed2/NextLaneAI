from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from models.schemas import UserProfileRequest, OpportunitySchema
from services.matching_service import matching_service
from services.firestore_service import firestore_service
from utils.logger import log_event, log_error

router = APIRouter(tags=["Matching"])

@router.post("/match-all", response_model=List[Dict[str, Any]])
def match_all_opportunities(profile: UserProfileRequest):
    """
    Accepts user profile (skills, education, interests, name)
    and returns ranked opportunities with AI match scores and reasoning explanations.
    """
    try:
        user_dict = {
            "name": profile.get_effective_name(),
            "fullName": profile.get_effective_name(),
            "skills": profile.get_effective_skills(),
            "education": profile.get_effective_education(),
            "educationLevel": profile.get_effective_education(),
            "interests": profile.get_effective_interests(),
            "targetObjectives": profile.get_effective_interests(),
            "linkedInUrl": profile.linkedInUrl,
            "githubUrl": profile.githubUrl,
            "resumeFileName": profile.resumeFileName,
        }

        # Persist user profile interaction in memory/Firestore
        firestore_service.save_user(user_dict)

        results = matching_service.match_all(user_dict)
        return results
    except Exception as e:
        log_error("route_match_all", e)
        raise HTTPException(status_code=500, detail=f"Matching calculation failed: {str(e)}")

@router.get("/opportunities", response_model=List[Dict[str, Any]])
def get_all_indexed_opportunities():
    """Returns all opportunities currently stored in memory / Firestore."""
    try:
        return firestore_service.get_all_opportunities()
    except Exception as e:
        log_error("route_get_opps", e)
        raise HTTPException(status_code=500, detail="Failed to retrieve opportunities.")
