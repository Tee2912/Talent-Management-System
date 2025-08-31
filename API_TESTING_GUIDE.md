# HireIQ Pro - API Testing Guide

This guide provides instructions and examples for testing the HireIQ Pro backend API.

## Base URL: `http://localhost:8000`

## Health & Status

### Health Check
Check if the API is running and healthy.
```bash
curl http://localhost:8000/health
```

### Root Endpoint
Get basic information about the API version and features.
```bash
curl http://localhost:8000/
```

## Core API Endpoints

### Candidates
- **Get All Candidates**: `GET /api/v1/candidates/`
- **Create Candidate**: `POST /api/v1/candidates/`
- **Get Candidate by ID**: `GET /api/v1/candidates/{candidate_id}`

**Example: Create a new candidate**
```bash
curl -X POST http://localhost:8000/api/v1/candidates/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "position_applied": "Data Scientist",
    "experience_years": 7,
    "education_level": "Master",
    "skills": ["Python", "R", "Machine Learning"],
    "gender": "female",
    "ethnicity": "hispanic",
    "age": 34
  }'
```

### Analytics
- **Get Consolidated Analytics**: `GET /api/v1/analytics/`
- **Get Analytics by Type**: `GET /api/v1/analytics/{analytics_type}` (e.g., `positions`, `demographics`, `timeline`)

**Example: Get consolidated analytics data**
```bash
curl http://localhost:8000/api/v1/analytics/
```

### Bias Detection
- **Run Bias Analysis**: `POST /api/v1/bias/analyze`
- **Get Bias Dashboard**: `GET /api/v1/bias/dashboard`

**Example: Run a new bias analysis**
```bash
curl -X POST http://localhost:8000/api/v1/bias/analyze \
  -H "Content-Type: application/json" \
  -d '{"candidate_ids": [1, 2, 3]}'
```

## Smart AI Features Endpoints (`/api/v1/ai-copilot`)

### AI-Powered Resume Analysis
- **Analyze Resume**: `POST /api/v1/ai-copilot/analyze-resume`

**Example: Analyze a resume against a job description**
```bash
curl -X POST http://localhost:8000/api/v1/ai-copilot/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "...",
    "job_description": "..."
  }'
```

### Intelligent Candidate Matching
- **Find Similar Candidates**: `POST /api/v1/ai-copilot/find-similar-candidates`

**Example: Find candidates similar to a profile**
```bash
curl -X POST http://localhost:8000/api/v1/ai-copilot/find-similar-candidates \
  -H "Content-Type: application/json" \
  -d '{
    "source_candidate_id": 1,
    "top_n": 5
  }'
```

### Predictive Analytics
- **Predict Hiring Success**: `POST /api/v1/ai-copilot/predict-hiring-success/{candidate_id}`

**Example: Predict success for a candidate**
```bash
curl -X POST http://localhost:8000/api/v1/ai-copilot/predict-hiring-success/1
```

## Test Workflow

1.  **Start Backend & Frontend**:
    ```bash
    # Terminal 1 (backend)
    cd backend
    uvicorn app.main:app --reload

    # Terminal 2 (frontend)
    cd frontend
    npm start
    ```

2.  **Populate Data**: Use the frontend or API to create candidates.

3.  **Test Analytics**:
    - Access `http://localhost:3000/analytics` to see the consolidated dashboard.
    - Use `curl` to test the `/api/v1/analytics/` endpoint.

4.  **Test AI Features**:
    - Navigate to the "AI Copilot" page in the frontend.
    - Use `curl` to test the `/api/v1/ai-copilot/` endpoints.

5.  **Review API Docs**: For a full, interactive list of all endpoints, visit `http://localhost:8000/docs`.
