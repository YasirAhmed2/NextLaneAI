You are a senior full-stack engineer. Your task is to integrate an existing frontend UI with a FastAPI backend for a project called "Opportra".

## Context
The frontend UI is already built and includes:
- Landing page
- Profile input form
- Dashboard displaying opportunities
- Saved opportunities page
- Missed opportunities page

The backend is implemented using FastAPI and exposes the following endpoints:

### 1. POST /match-all
Accepts a user profile and returns matched opportunities with AI-generated scores and explanations.

### Request format:
{
  "name": "string",
  "skills": ["string"],
  "education": "string",
  "interests": ["string"]
}

### Response format:
[
  {
    "title": "string",
    "organization": "string",
    "category": "string",
    "deadline": "string",
    "source": "string",
    "score": number,
    "reason": "string"
  }
]

---

### 2. GET /run-agent
Triggers background agent execution (scraping + updating opportunities)

Response:
{
  "status": "Agent running"
}

---

## Your Tasks

### 1. API Integration
- Connect frontend profile form submission to POST /match-all
- Send user data in correct JSON format
- Handle async API call using fetch or axios
- Parse response and store in state

---

### 2. State Management
- Store opportunities in frontend state
- Ensure data persists across:
  - Dashboard
  - Saved page
  - Missed page (if applicable)

---

### 3. Dashboard Rendering
- Map API response to UI cards
- Display:
  - title
  - organization
  - category
  - deadline
  - score
  - reason

- Ensure:
  - score is visually highlighted
  - reason text is visible (not hidden)

---

### 4. Save Functionality
- Implement "Save Opportunity"
- Store saved items in local state or localStorage
- Reflect saved items in Saved page

---

### 5. Error Handling
- Handle API failures gracefully
- Show:
  - loading state
  - error message
  - empty state

---

### 6. Trigger Agent (Optional UI Button)
- Add button: "Refresh Opportunities"
- Call GET /run-agent
- Show loading feedback

---

### 7. Data Validation
- Ensure frontend sends:
  - skills as array
  - interests as array
- Prevent empty submissions

---

### 8. Performance
- Avoid unnecessary re-renders
- Use efficient state updates

---

## Constraints

- Do not modify backend API structure
- Do not change frontend design significantly
- Keep integration clean and minimal
- Ensure compatibility with existing UI components

---

## Output Requirements

- Provide updated frontend code for:
  - API calls
  - state handling
  - integration logic

- Ensure code is clean, modular, and production-ready

---

## Goal

After integration:
- User submits profile
- Backend processes data
- Dashboard displays personalized opportunities with AI reasoning
- User can save and interact with results smoothly

Focus on reliability, clarity, and seamless user experience.