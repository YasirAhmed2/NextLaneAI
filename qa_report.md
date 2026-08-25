# NextLane AI — Complete QA & Evaluation Report

**Date:** August 25, 2026 | **Evaluator:** Senior QA Engineer / AI Systems Evaluator  
**System:** NextLane AI (Opportunity Gap Agent) v2.0.0  
**Stack:** FastAPI (Python) + Vite/React (TypeScript) + Gemini 2.5 Flash

---

## EXECUTIVE SUMMARY

NextLane AI is a well-architected autonomous opportunity-matching agent with a **premium, polished frontend** and a **sound backend design**. However, it currently suffers from a **critical production-blocking bug** that causes `/match-all` to return empty results when called via the live API — the primary feature of the system. The AI key is also invalid, forcing a deterministic fallback. The system is **not fully demo-ready in its current state** but requires only targeted fixes to become so.

---

## SYSTEM ARCHITECTURE OVERVIEW

```
User → Frontend (Vite/React, port 5000)
           ↓ Express proxy (/api/match-all)
       Backend (FastAPI, port 8000)
           ↓ 
       ┌──────────────────────────────┐
       │  Agent Orchestrator           │
       │  ├── Gemini Planning         │
       │  ├── Scraping (4 sources)    │
       │  ├── Async Match Engine      │
       │  └── Firestore / Local Store │
       └──────────────────────────────┘
```

---

## TEST RESULTS

---

### A. PERSONALIZATION TEST — ❌ CRITICAL BUG (API Layer)

**Setup:** 3 distinct user profiles tested via `POST /match-all`

| Profile | Skills | Interest | API Status | Results |
|---------|--------|----------|------------|---------|
| Profile 1 (Alex Chen) | Python, AI, ML | Hackathons | HTTP 200 | **0 results** |
| Profile 2 (Sarah Malik) | React, JS, Node | Internships | HTTP 200 | **0 results** |
| Profile 3 (Omar Farooq) | Research, Writing | Scholarships | HTTP 200 | **0 results** |

**Root Cause Identified:**
```
ERROR [MATCHING_SYNC_WRAPPER]: There is no current event loop 
in thread 'AnyIO worker thread'.
RuntimeError: RuntimeError
```

The `match_all()` sync wrapper in [matching_service.py](file:///d:/NextLane%20AI/backend/services/matching_service.py#L108-L125) calls `asyncio.get_event_loop()` inside a FastAPI/AnyIO worker thread. FastAPI uses AnyIO which does not provide a current event loop in sync route handlers. The exception is silently swallowed, returning `[]`.

**Direct module test (bypassing API):** PASSES — returns 12 ranked results with correct personalization.

**Personalization quality (via direct test):**

| Profile | Test Opportunity | Score | Reason Quality |
|---------|-----------------|-------|----------------|
| AI/Hackathon | Global Generation AI Hackathon | **98** | "You match because your expertise in Python, AI, Machine learning aligns directly with MLH's..." GOOD |
| Web Dev | Same hackathon | **78** | "Your academic standing qualifies you for..." GENERIC (no skill match) |
| Scholar | Same hackathon | **78** | "Your academic standing qualifies you for..." GENERIC (no skill match) |

**Verdict:** Personalization logic is sound at the code level, but broken at the API level.

---

### B. SCRAPING VALIDATION — PARTIAL

**Opportunities in store:** 12  

**Source breakdown:**

| Source | Count | Type |
|--------|-------|------|
| Google Careers | 1 | Seed — Static |
| MLH | 1 | Seed — Static |
| Scholarships360 | 1 | Seed — Static |
| Devpost | 2 | Seed — Static |
| Unstop | 1 | Seed — Static |
| Tech Job Shortlist | 3 | Seed — Static |
| CERN Careers | 1 | Seed — Static |
| Stanford Portal | 1 | Seed — Static |
| WeMakeScholars | 1 | Seed — Static |

> [!WARNING]
> **All 12 opportunities are from `seed_opportunities.json`** — hardcoded static data, not live-scraped. The scrapers exist in code and have valid selector logic, but **live scraping did NOT produce any new data**. The agent's cache-hit logic short-circuits scraping when `len(existing) >= 5`, so once the seed is loaded, live scraping never runs again.

**Scraper Code Quality:**
- `scrape_devpost()` — Code quality good, uses `.hackathon-tile` selector with fallbacks
- `scrape_unstop()` — Hits public JSON API endpoint with HTML fallback
- `scrape_mlh()` — Uses `https://mlh.io/seasons/2026/events` with article fallback
- `scrape_scholarships()` — Hits `scholarships360.org` with real selector logic

---

### C. APPLY BUTTON / REDIRECTION TEST — MOSTLY PASSING

**URL Validation Results (8 tested):**

| Opportunity | URL | HTTP Status | Result |
|-------------|-----|-------------|--------|
| Frontier AI Research Residency | deepmind.google/careers | 200 | PASS |
| Global Generation AI Hackathon | mlh.io | 200 | PASS |
| Women & Minorities in Tech Grant | buildyourfuture.withgoogle.com | 200 | PASS |
| Tesla Internship | www.tesla.com/careers | 403 | PASS (site up, HEAD blocked) |
| Quantum Computing Residency | home.cern/careers | **404** | FAIL |
| Clean Energy Hackathon | devpost.com | 200 | PASS |
| Palantir Scholarship | palantir.com/students | 200 | PASS |
| Microsoft Cloud Fellow | careers.microsoft.com | 200 | PASS |

**Score: 7/8 URLs functional (87.5%)**

Pre-fill not implemented — Apply buttons redirect to external sites only (acceptable for this stage).

---

### D. SAVE FUNCTIONALITY TEST — CLIENT-SIDE ONLY

- **Save mechanism:** Client-side only via `localStorage` key `nextlane_opportunities`
- **Persistence:** Persists across page refreshes via localStorage
- **No backend save endpoint** exists — saved state is not synced to server
- **Remove button:** Exists in `SavedOpportunities.tsx`, calls `onToggleSave(id)`

> [!IMPORTANT]
> **Limitation:** If a user clears localStorage or switches devices, all saved data is lost permanently. No backend persistence for saved state exists.

---

### E. DEADLINE ALERT SYSTEM — NOT IMPLEMENTED

**Deadline distribution of 12 seed opportunities:**

| Category | Count |
|----------|-------|
| URGENT (< 24 hours) | 0 |
| Upcoming (7 days) | 0 |
| Future (>7 days) | **12** |
| Marked deadlinePassed=True | 0 |

**System capabilities found:**
- `deadlineDate` field exists in schema
- `deadlinePassed` boolean field exists
- **No backend alert trigger logic** — ABSENT
- **No email notification for deadline urgency** — ABSENT
- **No UI visual highlighting** for urgent deadlines — ABSENT

> [!CAUTION]
> The deadline alert system is entirely absent. Fields exist in the schema but the alert logic (UI highlight, email trigger, urgency detection) is never activated. The email system exists for auth OTP but is not connected to deadline alerts.

---

### F. AGENT BEHAVIOR TEST — PASSES (with caveats)

**POST /run-agent:**
- Response time: **2,039ms** — Fast
- HTTP Status: **200**
- Returns immediately — Background task correctly used
- Response: `{"status": "Agent running", "message": "Autonomous agent pipeline started in background."}`

**Agent status (3 seconds after trigger):**
```json
{
  "status": "running",
  "indexedOpportunities": 12,
  "lastRun": "2026-08-25T09:07:45Z",
  "runsCompleted": 0
}
```

**Agent 6-step architecture — all present:**
1. Step 1: Gemini Planning (or heuristic fallback)
2. Step 2: Tool selection based on plan
3. Step 3: Async scraper execution via `asyncio.gather()`
4. Step 4: Store results
5. Step 5: Async batch matching
6. Step 6: Structured result return with `[AGENT]` prefix logging

**Caveat:** Cache-hit behavior means the agent will NOT rescrape if data already exists. First-time demo works; repeat invocations will not scrape live.

---

### G. AI REASONING QUALITY — MIXED

**Critical Issue: Gemini API key is INVALID**  
Key format `AQ.Ab8RN6I02FnW5J7...` is not a valid Google AI key (should start with `AIzaSy...`). The system falls back to a **deterministic heuristic engine**.

**Heuristic Reasoning Quality:**

| Scenario | Score | Reason Type |
|----------|-------|-------------|
| Strong skill match (Python user → Python opp) | 98 | GOOD — "You match because your expertise in Python, AI, Machine Learning aligns directly with..." |
| Weak skill match (React dev → AI hackathon) | 78 | GENERIC — "Your academic standing and foundational background qualifies you..." |
| No skill match (Writing → AI hackathon) | 78 | GENERIC — Identical fallback reason text as above |

**Score range:** 72–98 (skill-count driven, not random)  
**Scores differ across profiles:** Yes  
**Reason references user skills when matched:** Yes  
**Reason is generic when no skill overlap:** Both non-matching profiles get identical generic reasons

---

### H. PERFORMANCE TEST — EXCELLENT

| Test | Time | Rating |
|------|------|--------|
| `POST /match-all` via API (broken) | 2,051–2,182ms | FAIL (returns empty) |
| `match_all_async()` direct call (12 opps, heuristic) | **2ms** | EXCEPTIONAL |
| `/run-agent` trigger | 2,039ms | Fast (background) |
| `/opportunities` fetch | ~500ms | Fast |

The heuristic engine is near-instantaneous. If Gemini API were working, expect 5–15s for 12 concurrent calls.

---

### I. ERROR HANDLING — SILENT FAILURES

| Test Case | Expected | Actual | Result |
|-----------|----------|--------|--------|
| Empty `{}` profile | Error or empty results | HTTP 200, `[]` | Silent empty |
| Invalid `skills` (string, not list) | 422 Validation Error | HTTP 200, `[]` | Should be 422 |
| Name-only profile | Results or error | HTTP 200, `[]` | Silent empty |
| Backend down | Fallback UI | Falls back to mock data | Graceful |

> [!WARNING]
> **The system silently returns HTTP 200 with `[]` for all invalid inputs.** The matching sync wrapper catches all exceptions and returns `[]`. A client receives no feedback about what went wrong. Pydantic validators sanitize inputs correctly but the errors are never surfaced.

---

### J. EDGE CASES — HANDLES WELL

| Edge Case | Result |
|-----------|--------|
| No skills user | 12 results, top score: **78** (baseline minimum) |
| 15 skills user | 12 results, top score: **98** (correctly boosted) |
| No opportunities available | Would trigger re-scrape (safety net in code) |
| Prompt injection via skills | Sanitized by Pydantic validators |

---

## UX VALIDATION

**Frontend Component Inventory:** 17 components including premium pieces:
- `HeroLanding.tsx` — Landing page  
- `AuthView.tsx` — Full auth flow (register, OTP, login, forgot password)  
- `OpportunitiesFeed.tsx` — Main dashboard with filter/search  
- `OpportunityDetailModal.tsx` — Detail modal with apply button  
- `SavedOpportunities.tsx` — Saved items collection  
- `PathwaysView.tsx` + `Pathways3DVisualizer.tsx` — 3D career path visualization  
- `OpportunityVisualTelemetry.tsx` — Match score visualization  

**UX Strengths:**
- Premium dark-mode aesthetic with gold (#D4AF37) accent color system
- Match scores prominently displayed (`Match: 92%`)
- AI reasoning displayed inline on each card
- Category filter (Hackathon / Scholarship / Internship)
- Search functionality across titles, organizations, tags, and reasons
- Smooth Framer Motion animations with hover effects
- Email OTP verification system for auth with professional branded HTML email
- 3D career pathway visualizer (unique differentiator)
- Resilient offline fallback with mock data

**UX Weaknesses:**
- No visual urgency indicator for upcoming deadlines
- Save state lost if user clears localStorage or switches devices
- Frontend falls back to static mock data silently — user cannot tell if live data failed
- "Agent refreshing" UI spinner exists but agent never surfaces new data in normal use

---

## FINAL EVALUATION SCORES

| Category | Score | Notes |
|----------|-------|-------|
| **Personalization** | **5 / 10** | Logic is correct but broken at API level; heuristic works well for strong matches, generic for weak |
| **Agent Behavior** | **6 / 10** | Well-architected 6-step loop, background tasks, logging — but cache-hit prevents live scraping |
| **Data Authenticity** | **3 / 10** | All 12 opportunities are hardcoded seed; scrapers exist but never run in normal flow |
| **UX & Functionality** | **8 / 10** | Premium design, 17 components, smooth animations, proper auth — dragged down by broken match API |
| **Performance** | **9 / 10** | Heuristic engine is 2ms; agent triggers fast; async batch design is production-grade |
| **Overall Current** | **6.2 / 10** | |

---

## CRITICAL ISSUES (Judge-Level)

### BLOCKER — Will Fail Live Demo

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **`/match-all` returns `[]`** — AnyIO event loop error in sync wrapper | [matching_service.py L114](file:///d:/NextLane%20AI/backend/services/matching_service.py#L113-L125) | BLOCKER |
| 2 | **Invalid Gemini API key** — `AQ.Ab8RN6...` is not a valid key format | [.env L7](file:///d:/NextLane%20AI/backend/.env#L7) | BLOCKER |
| 3 | **All data is hardcoded seed** — Scrapers never run in normal agent flow | [agent_orchestrator.py L119](file:///d:/NextLane%20AI/backend/services/agent_orchestrator.py#L119-L124) | HIGH |

### HIGH — Hurts Demo Score

| # | Issue | Severity |
|---|-------|----------|
| 4 | Silent HTTP 200 + `[]` for all error cases — no proper validation error reporting | HIGH |
| 5 | No deadline alert system — schema exists but no detection, highlight, or trigger logic | HIGH |
| 6 | Save state is localStorage-only — no backend persistence | MEDIUM |

### MEDIUM — Polish Issues

| # | Issue | Severity |
|---|-------|----------|
| 7 | Generic reasoning for non-matching profiles ("academic standing...") | MEDIUM |
| 8 | CERN careers URL returns 404 | LOW |
| 9 | Model name `gemini-3.6-flash` doesn't exist (should be `gemini-2.5-flash`) | MEDIUM |

---

## IMPROVEMENT RECOMMENDATIONS (Prioritized)

### P1 — Fix the Core Bug (30 min)

**Problem:** `match_all()` sync wrapper fails in FastAPI/AnyIO context.  
**Fix:** Convert the route to `async def` and call `match_all_async()` directly:

```python
# routes/match.py
@router.post("/match-all", response_model=List[Dict[str, Any]])
async def match_all_opportunities(profile: UserProfileRequest):
    user_dict = {
        "name": profile.get_effective_name(),
        "skills": profile.get_effective_skills(),
        "education": profile.get_effective_education(),
        "interests": profile.get_effective_interests(),
    }
    firestore_service.save_user(user_dict)
    results = await matching_service.match_all_async(user_dict)
    return results
```

### P2 — Fix Gemini API Key (5 min)

Get a valid key from [aistudio.google.com](https://aistudio.google.com/app/apikey) and fix the model name:
- Key: Must start with `AIzaSy...`
- Model: `gemini-3.6-flash` → `gemini-2.5-flash`

### P3 — Enable Live Scraping for Demo (15 min)

Pass `force_rescrape=True` from the `/run-agent` endpoint so judges can trigger fresh data.

### P4 — Add Deadline Urgency Highlighting (1 hour)

In `OpportunitiesFeed.tsx`, add a red/orange urgency badge for deadlines within 7 days using `deadlineDate` field.

### P5 — Improve Reasoning for Non-Matching Profiles (30 min)

When no skills match, the heuristic reason should mention the interest/type alignment instead of generic academic standing text.

### P6 — Return Proper HTTP Status Codes (30 min)

Return 422 for truly invalid inputs rather than silent HTTP 200 + `[]`.

### P7 — Backend Save Persistence (2 hours)

Add `POST /save-opportunity` and `GET /saved-opportunities` endpoints tied to user auth sessions.

---

## FINAL VERDICT

> **"Is this system a strong, demo-ready AI agent or not?"**

### NOT YET — But 1-2 Hours Away From Being Demo-Ready

**NextLane AI has exceptional bones.** The architecture is genuinely impressive for a hackathon project:
- A proper 6-step agentic loop with Gemini planning and tool selection
- Async batch matching with `asyncio.gather()` — production-grade design
- 4 real scrapers with fallback chains and deduplication
- A premium React frontend with 3D visualizations and branded email auth
- Deterministic heuristic fallback when Gemini is unavailable
- Input sanitization and prompt injection prevention

**The fatal flaw is one Python bug:** the sync/async event loop mismatch in `matching_service.py` makes the headline feature (`/match-all`) return zero results via the actual HTTP API. This would be catastrophic in a live demo without the fix.

**Fix P1 + P2 (async route + valid API key)** and this becomes a **legitimately strong, demo-ready AI agent:**

| After Fixes | Projected Score |
|-------------|----------------|
| Personalization | 8 / 10 |
| Agent Behavior | 7 / 10 |
| Data Authenticity | 5 / 10 |
| UX & Functionality | 9 / 10 |
| Performance | 9 / 10 |
| **Overall** | **7.6 / 10** |

**Current state (unfixed): 6.2/10 — Not demo-ready.**  
**After P1+P2 fix: 7.6/10 — Demo-ready with caveats.**

---

*Report generated by automated QA test suite + code analysis*  
*Test execution: 2026-08-25 14:02 to 14:08 (PKT)*
