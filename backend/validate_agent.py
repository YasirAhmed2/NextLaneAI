# Quick validation test -- run from: d:/NextLane AI/backend
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(__file__))
# Force model before any imports (override any previously cached env var)
os.environ['GEMINI_MODEL'] = 'gemini-3.6-flash'

from dotenv import load_dotenv
load_dotenv()
from services.gemini_service import gemini_service

print(f"Model: {gemini_service.model_name}")
print(f"Initialized: {gemini_service.initialized}")

# Test goal-driven planner
from services.agent_planner import agent_planner
from services.priority_engine import priority_engine
from services.missed_analysis import missed_analysis_engine
from services.feedback_service import feedback_service

goal_plan = agent_planner.generate_goal_driven_plan(
    {"name": "Ali", "skills": ["Python", "Machine Learning"], "location": "Pakistan"},
    "Find fully funded master's scholarships in Europe for AI research"
)
print("\n=== GOAL-DRIVEN AGENT PLAN ===")
print("Goal:", goal_plan["goal"])
print("Sources:", goal_plan["sources"])
print("Priority:", goal_plan["priority"])
print("Reasoning:", goal_plan["reasoning"][:120])

# Test Priority Engine
opp = {
    "title": "DAAD Helmut-Schmidt Scholarship", "organization": "DAAD", "type": "Scholarship",
    "matchScore": 85, "companyReputationScore": "4.9 / 5.0", "isVerifiedCompany": True,
    "deadlineDate": "2026-08-27"
}
prioritized = priority_engine.calculate_priority_score(
    opp, {"name": "Ali", "location": "Pakistan"}, "Find fully funded master's scholarships"
)
print("\n=== PRIORITY ENGINE ===")
print("Match Score:", opp["matchScore"])
print("Priority Score:", prioritized["priority_score"])
print("Priority Level:", prioritized["priority_level"])

# Test Feedback Service
fb_res = feedback_service.record_feedback("usr_test123", "opp-123", "save", "Scholarship", "Great opportunity")
print("\n=== FEEDBACK SERVICE ===")
print("Recorded feedback:", fb_res)

# Test Missed Analysis
missed_res = missed_analysis_engine.analyze_missed_opportunities(
    {"name": "Ali", "skills": ["Python"], "education": "Undergraduate"},
    [{"title": "CERN Summer Student Programme 2026", "organization": "CERN", "type": "Scholarship", "deadline": "Passed"}]
)
print("\n=== MISSED ANALYSIS ===")
print("Missed Count:", missed_res["missedCount"])
print("Overall Diagnosis:", missed_res["overallDiagnosis"][:120])

print("\nALL TESTS PASSED")
