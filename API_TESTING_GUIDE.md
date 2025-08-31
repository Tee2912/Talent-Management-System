# Fair Hiring System - API Testing Guide

## Backend API Endpoints

### Base URL: http://localhost:8000

### Health Check
```bash
curl http://localhost:8000/health
```

### Get All Candidates
```bash
curl http://localhost:8000/api/v1/candidates/
```

### Create New Candidate
```bash
curl -X POST http://localhost:8000/api/v1/candidates/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "position_applied": "Software Engineer",
    "experience_years": 5,
    "education_level": "Bachelor",
    "skills": ["Python", "JavaScript"],
    "gender": "male",
    "ethnicity": "white",
    "age": 30
  }'
```

### Update Candidate Scores
```bash
curl -X POST http://localhost:8000/api/v1/candidates/1/scores \
  -H "Content-Type: application/json" \
  -d '{
    "resume_score": 85,
    "interview_score": 90,
    "technical_score": 88
  }'
```

### Make Hiring Decision
```bash
curl -X POST http://localhost:8000/api/v1/candidates/1/decision \
  -H "Content-Type: application/json" \
  -d '"hired"'
```

### Run Bias Analysis
```bash
curl -X POST http://localhost:8000/api/v1/bias/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_ids": []
  }'
```

### Get Bias Dashboard
```bash
curl http://localhost:8000/api/v1/bias/dashboard
```

### Get Analytics Summary
```bash
curl http://localhost:8000/api/v1/analytics/summary
```

### Get Position Analytics
```bash
curl http://localhost:8000/api/v1/analytics/positions
```

### Get Demographic Analytics
```bash
curl http://localhost:8000/api/v1/analytics/demographics
```

## Frontend URLs

### Main Application: http://localhost:3000

- **Dashboard**: http://localhost:3000/ - Overview of hiring metrics and bias scores
- **Candidates**: http://localhost:3000/candidates - Manage candidate information
- **Analytics**: http://localhost:3000/analytics - Detailed hiring analytics
- **Bias Detection**: http://localhost:3000/bias-detection - Run and view bias analysis

## Sample Test Workflow

1. **Start the servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   C:/Users/warre/vibathon/.venv/Scripts/uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
   
   # Terminal 2 - Frontend  
   cd frontend
   npm start
   ```

2. **Add test candidates** using the API or frontend interface

3. **Score candidates** through the candidates interface

4. **Make hiring decisions** 

5. **Run bias analysis** to check for fairness issues

6. **Review analytics** for insights into hiring patterns

## Key Features Demonstrated

- **Bias Detection**: ML-based analysis of hiring decisions for demographic bias
- **Fair Scoring**: Transparent candidate evaluation system  
- **Real-time Analytics**: Dashboard showing hiring trends and metrics
- **Audit Trail**: Complete tracking of all hiring decisions
- **Compliance Reporting**: Fairness metrics for regulatory compliance
