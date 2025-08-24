from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
from pathlib import Path

router = APIRouter()

class Interviewer(BaseModel):
    id: int
    name: str
    email: str
    department: str
    role: str

class InterviewQuestion(BaseModel):
    id: int
    question: str
    category: str
    difficulty: str
    expected_answer: Optional[str] = None
    time_limit: Optional[int] = None

class ScoringCriteria(BaseModel):
    id: int
    name: str
    description: str
    weight: int
    max_score: int

class InterviewTemplate(BaseModel):
    id: int
    name: str
    type: str
    position: str
    duration: int
    questions: List[InterviewQuestion]
    scoring_criteria: List[ScoringCriteria]

class InterviewScore(BaseModel):
    criteria_id: int
    criteria_name: str
    score: int
    max_score: int
    feedback: str
    interviewer_id: int

class Interview(BaseModel):
    id: int
    candidate_id: int
    candidate_name: str
    position: str
    interviewers: List[Interviewer]
    scheduled_date: datetime
    duration: int
    type: str
    status: str
    location: str
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    scores: Optional[List[InterviewScore]] = None
    template_id: Optional[int] = None

class CreateInterviewRequest(BaseModel):
    candidate_id: int
    candidate_name: str
    position: str
    interviewer_ids: List[int]
    scheduled_date: datetime
    duration: int
    type: str
    location: str
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    template_id: Optional[int] = None

class UpdateInterviewRequest(BaseModel):
    scheduled_date: Optional[datetime] = None
    duration: Optional[int] = None
    status: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None

def load_interviews():
    """Load interviews from JSON file"""
    interviews_file = Path(__file__).parent.parent / "interviews.json"
    try:
        with open(interviews_file, 'r') as f:
            data = json.load(f)
            # Convert datetime strings back to datetime objects
            for interview in data:
                interview['scheduled_date'] = datetime.fromisoformat(interview['scheduled_date'].replace('Z', '+00:00'))
            return data
    except FileNotFoundError:
        return []

def save_interviews(interviews):
    """Save interviews to JSON file"""
    interviews_file = Path(__file__).parent.parent / "interviews.json"
    # Convert datetime objects to strings for JSON serialization
    interviews_to_save = []
    for interview in interviews:
        interview_copy = interview.copy()
        if isinstance(interview_copy['scheduled_date'], datetime):
            interview_copy['scheduled_date'] = interview_copy['scheduled_date'].isoformat()
        interviews_to_save.append(interview_copy)
    
    with open(interviews_file, 'w') as f:
        json.dump(interviews_to_save, f, indent=2)

def load_candidates():
    """Load candidates from JSON file"""
    candidates_file = Path(__file__).parent.parent / "candidates.json"
    try:
        with open(candidates_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def get_mock_interviewers():
    """Get mock interviewer data"""
    return [
        {
            "id": 1,
            "name": "John Smith",
            "email": "john.smith@company.com",
            "department": "Engineering",
            "role": "Senior Developer"
        },
        {
            "id": 2,
            "name": "Sarah Johnson",
            "email": "sarah.johnson@company.com",
            "department": "Engineering",
            "role": "Tech Lead"
        },
        {
            "id": 3,
            "name": "Mike Chen",
            "email": "mike.chen@company.com",
            "department": "HR",
            "role": "HR Manager"
        },
        {
            "id": 4,
            "name": "Emily Davis",
            "email": "emily.davis@company.com",
            "department": "Product",
            "role": "Product Manager"
        }
    ]

def get_mock_templates():
    """Get mock interview templates"""
    return [
        {
            "id": 1,
            "name": "Technical Interview - Senior Developer",
            "type": "technical",
            "position": "Senior Software Developer",
            "duration": 90,
            "questions": [
                {
                    "id": 1,
                    "question": "Explain the concept of closures in JavaScript and provide an example.",
                    "category": "JavaScript",
                    "difficulty": "medium",
                    "expected_answer": "A closure is a function that has access to variables in its outer scope even after the outer function returns.",
                    "time_limit": 10
                },
                {
                    "id": 2,
                    "question": "Design a system that can handle millions of requests per day.",
                    "category": "System Design",
                    "difficulty": "hard",
                    "time_limit": 30
                },
                {
                    "id": 3,
                    "question": "What are the differences between SQL and NoSQL databases?",
                    "category": "Database",
                    "difficulty": "medium",
                    "time_limit": 15
                }
            ],
            "scoring_criteria": [
                {
                    "id": 1,
                    "name": "Technical Knowledge",
                    "description": "Understanding of core technical concepts",
                    "weight": 40,
                    "max_score": 10
                },
                {
                    "id": 2,
                    "name": "Problem Solving",
                    "description": "Ability to approach and solve problems systematically",
                    "weight": 30,
                    "max_score": 10
                },
                {
                    "id": 3,
                    "name": "Communication",
                    "description": "Ability to explain technical concepts clearly",
                    "weight": 30,
                    "max_score": 10
                }
            ]
        },
        {
            "id": 2,
            "name": "Behavioral Interview - Team Lead",
            "type": "behavioral",
            "position": "Team Lead",
            "duration": 60,
            "questions": [
                {
                    "id": 4,
                    "question": "Tell me about a time when you had to manage a difficult team member.",
                    "category": "Leadership",
                    "difficulty": "medium",
                    "time_limit": 15
                },
                {
                    "id": 5,
                    "question": "Describe a situation where you had to make a decision with incomplete information.",
                    "category": "Decision Making",
                    "difficulty": "medium",
                    "time_limit": 15
                }
            ],
            "scoring_criteria": [
                {
                    "id": 4,
                    "name": "Leadership",
                    "description": "Demonstrated leadership capabilities",
                    "weight": 50,
                    "max_score": 10
                },
                {
                    "id": 5,
                    "name": "Communication",
                    "description": "Clear and effective communication",
                    "weight": 30,
                    "max_score": 10
                },
                {
                    "id": 6,
                    "name": "Cultural Fit",
                    "description": "Alignment with company values",
                    "weight": 20,
                    "max_score": 10
                }
            ]
        }
    ]

@router.get("/", response_model=List[Interview])
async def get_interviews(status: Optional[str] = Query(None, description="Filter by interview status")):
    """Get all interviews with optional status filtering"""
    try:
        interviews = load_interviews()
        
        if status:
            interviews = [i for i in interviews if i.get('status') == status]
        
        return interviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading interviews: {str(e)}")

@router.post("/", response_model=Interview)
async def create_interview(interview_request: CreateInterviewRequest):
    """Create a new interview"""
    try:
        interviews = load_interviews()
        candidates = load_candidates()
        interviewers = get_mock_interviewers()
        
        # Validate candidate exists
        candidate = next((c for c in candidates if c.get('id') == interview_request.candidate_id), None)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Get interviewer details
        interview_interviewers = []
        for interviewer_id in interview_request.interviewer_ids:
            interviewer = next((i for i in interviewers if i.get('id') == interviewer_id), None)
            if interviewer:
                interview_interviewers.append(interviewer)
        
        # Generate new interview ID
        new_id = max([i.get('id', 0) for i in interviews], default=0) + 1
        
        # Create new interview
        new_interview = {
            "id": new_id,
            "candidate_id": interview_request.candidate_id,
            "candidate_name": interview_request.candidate_name,
            "position": interview_request.position,
            "interviewers": interview_interviewers,
            "scheduled_date": interview_request.scheduled_date,
            "duration": interview_request.duration,
            "type": interview_request.type,
            "status": "scheduled",
            "location": interview_request.location,
            "meeting_link": interview_request.meeting_link,
            "notes": interview_request.notes,
            "template_id": interview_request.template_id
        }
        
        interviews.append(new_interview)
        save_interviews(interviews)
        
        return new_interview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating interview: {str(e)}")

@router.get("/{interview_id}", response_model=Interview)
async def get_interview(interview_id: int):
    """Get a specific interview by ID"""
    try:
        interviews = load_interviews()
        interview = next((i for i in interviews if i.get('id') == interview_id), None)
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        return interview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading interview: {str(e)}")

@router.put("/{interview_id}", response_model=Interview)
async def update_interview(interview_id: int, update_request: UpdateInterviewRequest):
    """Update an existing interview"""
    try:
        interviews = load_interviews()
        interview_index = next((i for i, interview in enumerate(interviews) if interview.get('id') == interview_id), None)
        
        if interview_index is None:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Update interview fields
        interview = interviews[interview_index]
        update_data = update_request.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            interview[field] = value
        
        save_interviews(interviews)
        return interview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating interview: {str(e)}")

@router.delete("/{interview_id}")
async def delete_interview(interview_id: int):
    """Delete an interview"""
    try:
        interviews = load_interviews()
        interview_index = next((i for i, interview in enumerate(interviews) if interview.get('id') == interview_id), None)
        
        if interview_index is None:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        deleted_interview = interviews.pop(interview_index)
        save_interviews(interviews)
        
        return {"message": "Interview deleted successfully", "deleted_interview": deleted_interview}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting interview: {str(e)}")

@router.get("/templates/", response_model=List[InterviewTemplate])
async def get_interview_templates():
    """Get all interview templates"""
    try:
        return get_mock_templates()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading templates: {str(e)}")

@router.post("/{interview_id}/scores")
async def submit_interview_scores(interview_id: int, scores: List[InterviewScore]):
    """Submit scores for an interview"""
    try:
        interviews = load_interviews()
        interview_index = next((i for i, interview in enumerate(interviews) if interview.get('id') == interview_id), None)
        
        if interview_index is None:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        interview = interviews[interview_index]
        interview['scores'] = [score.dict() for score in scores]
        interview['status'] = 'completed'
        
        save_interviews(interviews)
        
        return {"message": "Scores submitted successfully", "interview": interview}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting scores: {str(e)}")

@router.get("/analytics/summary")
async def get_interview_analytics():
    """Get interview analytics summary"""
    try:
        interviews = load_interviews()
        
        total_interviews = len(interviews)
        completed_interviews = len([i for i in interviews if i.get('status') == 'completed'])
        scheduled_interviews = len([i for i in interviews if i.get('status') == 'scheduled'])
        cancelled_interviews = len([i for i in interviews if i.get('status') == 'cancelled'])
        
        # Calculate average scores
        completed_with_scores = [i for i in interviews if i.get('status') == 'completed' and i.get('scores')]
        avg_score = 0
        if completed_with_scores:
            total_score = 0
            total_criteria = 0
            for interview in completed_with_scores:
                for score in interview['scores']:
                    total_score += score['score']
                    total_criteria += 1
            avg_score = total_score / total_criteria if total_criteria > 0 else 0
        
        return {
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "scheduled_interviews": scheduled_interviews,
            "cancelled_interviews": cancelled_interviews,
            "completion_rate": (completed_interviews / total_interviews * 100) if total_interviews > 0 else 0,
            "average_score": round(avg_score, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading analytics: {str(e)}")

@router.get("/interviewers/", response_model=List[Interviewer])
async def get_interviewers():
    """Get all available interviewers"""
    try:
        return get_mock_interviewers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading interviewers: {str(e)}")
