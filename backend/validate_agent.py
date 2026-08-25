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

# Test planning
plan = gemini_service.generate_agent_plan({
    "name": "Ali", "skills": ["Python", "Machine Learning"], "interests": ["Hackathon"]
})
print("\n=== AGENT PLAN ===")
print("Sources:", plan["sources"])
print("Priority:", plan["priority"])
print("Goal:", plan["goal"][:100])

# Test match reasoning (async via sync wrapper)
result = gemini_service.generate_match_reasoning(
    {"name": "Ali", "skills": ["Python", "ML"], "interests": ["Hackathon"]},
    {"title": "AI Hackathon 2025", "organization": "Devpost", "type": "Hackathon",
     "description": "Build ML projects to win prizes", "requirements": ["Python skills"]}
)
print("\n=== MATCH REASONING ===")
print("Score:", result["score"])
print("Reason:", result["reason"][:120])
print("Insights:", result["insights"])
print("\nALL TESTS PASSED")
