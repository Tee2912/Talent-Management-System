from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import Candidate, CandidateCreate, CandidateUpdate
import json
import os
from datetime import datetime

router = APIRouter()

# Simple file-based storage for demo (replace with database in production)
DATA_FILE = "candidates.json"

def load_candidates() -> List[dict]:
    """Load candidates from JSON file"""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_candidates(candidates: List[dict]):
    """Save candidates to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(candidates, f, indent=2, default=str)

@router.get("/", response_model=List[Candidate])
async def get_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    position: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all candidates with filtering options"""
    candidates = load_candidates()
    
    # Apply filters
    if position:
        candidates = [c for c in candidates if c.get('position_applied', '').lower() == position.lower()]
    
    if is_active is not None:
        candidates = [c for c in candidates if c.get('is_active') == is_active]
    
    # Apply pagination
    candidates = candidates[skip:skip + limit]
    
    return [Candidate(**c) for c in candidates]

@router.post("/", response_model=Candidate)
async def create_candidate(candidate: CandidateCreate):
    """Create a new candidate"""
    candidates = load_candidates()
    
    # Generate new ID
    new_id = max([c.get('id', 0) for c in candidates], default=0) + 1
    
    # Create candidate dict
    candidate_dict = candidate.dict()
    candidate_dict.update({
        'id': new_id,
        'created_at': datetime.now().isoformat(),
        'updated_at': None,
        'is_active': True,
        'resume_score': None,
        'interview_score': None,
        'technical_score': None,
        'final_score': None,
        'hiring_decision': None,
        'bias_score': None,
        'fairness_metrics': None
    })
    
    candidates.append(candidate_dict)
    save_candidates(candidates)
    
    return Candidate(**candidate_dict)

@router.get("/test")
async def test_endpoint():
    """Test endpoint"""
    return {
        "message": "Candidates API is working",
        "route": "/api/candidates", 
        "status": "success",
        "endpoints": ["/", "/test", "/{candidate_id}"]
    }
