from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.models.schemas import Candidate, CandidateCreate, CandidateUpdate
import json
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Debug route to test if router is working
@router.get("/debug", response_model=dict)
async def debug_candidates():
    """Debug endpoint to test router connectivity"""
    logger.info("DEBUG endpoint called")
    return {"message": "Candidates router is working", "data_file": DATA_FILE, "file_exists": os.path.exists(DATA_FILE)}

# Simple file-based storage for demo (replace with database in production)
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "candidates.json")

# Log the file path for debugging
logger.info(f"Candidates DATA_FILE path: {DATA_FILE}")
logger.info(f"Candidates file exists: {os.path.exists(DATA_FILE)}")
if os.path.exists(DATA_FILE):
    logger.info(f"Candidates file size: {os.path.getsize(DATA_FILE)} bytes")

def load_candidates() -> List[dict]:
    """Load candidates from JSON file"""
    logger.info(f"Loading candidates from: {DATA_FILE}")
    logger.info(f"File exists: {os.path.exists(DATA_FILE)}")
    
    if not os.path.exists(DATA_FILE):
        logger.warning(f"Candidates file not found: {DATA_FILE}")
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            logger.info(f"Successfully loaded {len(data)} candidates")
            return data
    except (json.JSONDecodeError, FileNotFoundError) as e:
        logger.error(f"Error loading candidates: {e}")
        return []

def save_candidates(candidates: List[dict]):
    """Save candidates to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(candidates, f, indent=2, default=str)

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

@router.get("/", response_model=List[Candidate])
async def get_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    position: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all candidates with filtering options"""
    logger.info(f"GET /candidates called with skip={skip}, limit={limit}, position={position}, is_active={is_active}")
    
    try:
        candidates = load_candidates()
        logger.info(f"Loaded {len(candidates)} candidates from file")
        
        # Apply filters
        if position:
            candidates = [c for c in candidates if c.get('position_applied', '').lower() == position.lower()]
        
        if is_active is not None:
            candidates = [c for c in candidates if c.get('is_active') == is_active]
        
        # Apply pagination
        candidates = candidates[skip:skip + limit]
        
        logger.info(f"Returning {len(candidates)} candidates after filtering and pagination")
        
        # Convert to Pydantic models with error handling
        result = []
        for i, c in enumerate(candidates):
            try:
                candidate = Candidate(**c)
                result.append(candidate)
            except Exception as e:
                logger.error(f"Error converting candidate {i} to Pydantic model: {e}")
                logger.error(f"Candidate data: {c}")
                # Skip invalid candidates rather than failing the entire request
                continue
        
        logger.info(f"Successfully converted {len(result)} candidates to Pydantic models")
        return result
        
    except Exception as e:
        logger.error(f"Error in get_candidates: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{candidate_id}", response_model=Candidate)
async def get_candidate(candidate_id: int):
    """Get a specific candidate by ID"""
    candidates = load_candidates()
    
    candidate = next((c for c in candidates if c.get('id') == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return Candidate(**candidate)

@router.put("/{candidate_id}", response_model=Candidate)
async def update_candidate(candidate_id: int, candidate_update: CandidateUpdate):
    """Update a candidate"""
    candidates = load_candidates()
    
    candidate_idx = next((i for i, c in enumerate(candidates) if c.get('id') == candidate_id), None)
    if candidate_idx is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Update candidate
    update_data = candidate_update.dict(exclude_unset=True)
    update_data['updated_at'] = datetime.now().isoformat()
    
    candidates[candidate_idx].update(update_data)
    save_candidates(candidates)
    
    return Candidate(**candidates[candidate_idx])

@router.delete("/{candidate_id}")
async def delete_candidate(candidate_id: int):
    """Delete a candidate (soft delete)"""
    candidates = load_candidates()
    
    candidate_idx = next((i for i, c in enumerate(candidates) if c.get('id') == candidate_id), None)
    if candidate_idx is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Soft delete
    candidates[candidate_idx]['is_active'] = False
    candidates[candidate_idx]['updated_at'] = datetime.now().isoformat()
    
    save_candidates(candidates)
    
    return {"message": "Candidate deleted successfully"}

@router.post("/{candidate_id}/scores")
async def update_candidate_scores(
    candidate_id: int,
    resume_score: Optional[float] = None,
    interview_score: Optional[float] = None,
    technical_score: Optional[float] = None
):
    """Update candidate scores"""
    candidates = load_candidates()
    
    candidate_idx = next((i for i, c in enumerate(candidates) if c.get('id') == candidate_id), None)
    if candidate_idx is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate = candidates[candidate_idx]
    
    # Update scores
    if resume_score is not None:
        if not 0 <= resume_score <= 100:
            raise HTTPException(status_code=400, detail="Resume score must be between 0 and 100")
        candidate['resume_score'] = resume_score
    
    if interview_score is not None:
        if not 0 <= interview_score <= 100:
            raise HTTPException(status_code=400, detail="Interview score must be between 0 and 100")
        candidate['interview_score'] = interview_score
    
    if technical_score is not None:
        if not 0 <= technical_score <= 100:
            raise HTTPException(status_code=400, detail="Technical score must be between 0 and 100")
        candidate['technical_score'] = technical_score
    
    # Calculate final score if all scores are available
    scores = [candidate.get('resume_score'), candidate.get('interview_score'), candidate.get('technical_score')]
    if all(score is not None for score in scores):
        # Weighted average: resume (30%), interview (40%), technical (30%)
        candidate['final_score'] = (scores[0] * 0.3 + scores[1] * 0.4 + scores[2] * 0.3)
    
    candidate['updated_at'] = datetime.now().isoformat()
    save_candidates(candidates)
    
    return Candidate(**candidate)

@router.post("/{candidate_id}/decision")
async def make_hiring_decision(candidate_id: int, decision: str):
    """Make a hiring decision for a candidate"""
    if decision not in ['hired', 'rejected', 'on_hold']:
        raise HTTPException(status_code=400, detail="Decision must be 'hired', 'rejected', or 'on_hold'")
    
    candidates = load_candidates()
    
    candidate_idx = next((i for i, c in enumerate(candidates) if c.get('id') == candidate_id), None)
    if candidate_idx is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidates[candidate_idx]['hiring_decision'] = decision
    candidates[candidate_idx]['updated_at'] = datetime.now().isoformat()
    
    save_candidates(candidates)
    
    return {"message": f"Hiring decision '{decision}' recorded for candidate {candidate_id}"}
