from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
import os
from datetime import datetime

router = APIRouter()

class PersonalityAssessment(BaseModel):
    candidate_id: int
    mbti_type: str
    personality_scores: Dict[str, int]
    personality_traits: List[str]
    assessment_date: str

class AssessmentRequest(BaseModel):
    candidate_id: int
    responses: Dict[str, int]

def load_candidates() -> List[dict]:
    """Load candidates from JSON file"""
    if not os.path.exists("candidates.json"):
        return []
    try:
        with open("candidates.json", 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_candidates(candidates: List[dict]):
    """Save candidates to JSON file"""
    try:
        with open("candidates.json", 'w') as f:
            json.dump(candidates, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save candidates: {str(e)}")

def calculate_mbti_type(responses: Dict[str, int]) -> Dict[str, Any]:
    """Calculate MBTI type from assessment responses"""
    # MBTI questions mapping (simplified version)
    mbti_questions = {
        "1": "E", "5": "E", "9": "E",  # Extraversion
        "2": "S", "6": "N", "10": "N",  # Sensing vs Intuition  
        "3": "T", "7": "F", "11": "T",  # Thinking vs Feeling
        "4": "J", "8": "P", "12": "J"   # Judging vs Perceiving
    }
    
    scores = {
        'E': 0, 'I': 0,  # Extraversion vs Introversion
        'S': 0, 'N': 0,  # Sensing vs Intuition
        'T': 0, 'F': 0,  # Thinking vs Feeling
        'J': 0, 'P': 0   # Judging vs Perceiving
    }
    
    # Process responses
    for question_id, response in responses.items():
        if question_id in mbti_questions:
            dimension = mbti_questions[question_id]
            opposites = {'E': 'I', 'S': 'N', 'T': 'F', 'J': 'P'}
            
            if response >= 4:
                scores[dimension] += response - 3
            else:
                opposite = opposites.get(dimension, dimension)
                scores[opposite] += 4 - response
    
    # Determine type
    mbti_type = (
        ('E' if scores['E'] > scores['I'] else 'I') +
        ('S' if scores['S'] > scores['N'] else 'N') +
        ('T' if scores['T'] > scores['F'] else 'F') +
        ('J' if scores['J'] > scores['P'] else 'P')
    )
    
    # Calculate percentages
    total_e_i = scores['E'] + scores['I']
    total_s_n = scores['S'] + scores['N']
    total_t_f = scores['T'] + scores['F']
    total_j_p = scores['J'] + scores['P']
    
    personality_scores = {
        'extraversion': round((scores['E'] / total_e_i) * 100) if total_e_i > 0 else 50,
        'intuition': round((scores['N'] / total_s_n) * 100) if total_s_n > 0 else 50,
        'thinking': round((scores['T'] / total_t_f) * 100) if total_t_f > 0 else 50,
        'judging': round((scores['J'] / total_j_p) * 100) if total_j_p > 0 else 50,
    }
    
    # MBTI type descriptions
    mbti_descriptions = {
        "INTJ": {"name": "The Architect", "description": "Strategic, analytical, and independent"},
        "INTP": {"name": "The Thinker", "description": "Logical, analytical, and innovative"},
        "ENTJ": {"name": "The Commander", "description": "Natural leaders, strategic and assertive"},
        "ENTP": {"name": "The Debater", "description": "Innovative, enthusiastic, and strategic"},
        "INFJ": {"name": "The Advocate", "description": "Creative, insightful, and principled"},
        "INFP": {"name": "The Mediator", "description": "Idealistic, creative, and caring"},
        "ENFJ": {"name": "The Protagonist", "description": "Charismatic, inspiring, and empathetic"},
        "ENFP": {"name": "The Campaigner", "description": "Enthusiastic, creative, and sociable"},
        "ISTJ": {"name": "The Logistician", "description": "Practical, fact-minded, and reliable"},
        "ISFJ": {"name": "The Protector", "description": "Warm, responsible, and conscientious"},
        "ESTJ": {"name": "The Executive", "description": "Organized, practical, and decisive"},
        "ESFJ": {"name": "The Consul", "description": "Caring, social, and community-minded"},
        "ISTP": {"name": "The Virtuoso", "description": "Bold, practical, and adaptable"},
        "ISFP": {"name": "The Adventurer", "description": "Flexible, charming, and artistic"},
        "ESTP": {"name": "The Entrepreneur", "description": "Bold, perceptive, and direct"},
        "ESFP": {"name": "The Entertainer", "description": "Spontaneous, energetic, and enthusiastic"},
    }
    
    type_info = mbti_descriptions.get(mbti_type, {"name": "Unknown", "description": "Unknown type"})
    
    return {
        "mbti_type": mbti_type,
        "personality_scores": personality_scores,
        "personality_traits": [type_info["name"], type_info["description"]],
        "type_info": type_info
    }

@router.post("/assess")
async def submit_personality_assessment(assessment: AssessmentRequest):
    """Submit personality assessment for a candidate"""
    candidates = load_candidates()
    
    # Find candidate
    candidate_index = None
    for i, candidate in enumerate(candidates):
        if candidate.get('id') == assessment.candidate_id:
            candidate_index = i
            break
    
    if candidate_index is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Calculate MBTI type
    result = calculate_mbti_type(assessment.responses)
    
    # Update candidate with assessment results
    candidates[candidate_index].update({
        'mbti_type': result['mbti_type'],
        'personality_scores': result['personality_scores'],
        'personality_traits': result['personality_traits'],
        'assessment_date': datetime.now().isoformat(),
        'assessment_responses': assessment.responses
    })
    
    # Save updated candidates
    save_candidates(candidates)
    
    return {
        "success": True,
        "candidate_id": assessment.candidate_id,
        "result": result
    }

@router.get("/analytics")
async def get_personality_analytics():
    """Get personality assessment analytics"""
    candidates = load_candidates()
    
    # Filter candidates with MBTI assessments
    assessed_candidates = [c for c in candidates if c.get('mbti_type')]
    
    if not assessed_candidates:
        return {
            "total_candidates": len(candidates),
            "assessed_candidates": 0,
            "completion_rate": 0,
            "mbti_distribution": {},
            "personality_insights": {}
        }
    
    # Calculate MBTI distribution
    mbti_distribution = {}
    for candidate in assessed_candidates:
        mbti_type = candidate.get('mbti_type')
        if mbti_type:
            mbti_distribution[mbti_type] = mbti_distribution.get(mbti_type, 0) + 1
    
    # Calculate average personality scores
    avg_scores = {
        'extraversion': 0,
        'intuition': 0,
        'thinking': 0,
        'judging': 0
    }
    
    score_count = 0
    for candidate in assessed_candidates:
        scores = candidate.get('personality_scores', {})
        if scores:
            for trait, score in scores.items():
                if trait in avg_scores:
                    avg_scores[trait] += score
            score_count += 1
    
    if score_count > 0:
        for trait in avg_scores:
            avg_scores[trait] = round(avg_scores[trait] / score_count, 1)
    
    # Most common type
    most_common_type = max(mbti_distribution.items(), key=lambda x: x[1]) if mbti_distribution else None
    
    return {
        "total_candidates": len(candidates),
        "assessed_candidates": len(assessed_candidates),
        "completion_rate": round((len(assessed_candidates) / len(candidates)) * 100, 1) if candidates else 0,
        "mbti_distribution": mbti_distribution,
        "personality_insights": {
            "most_common_type": most_common_type[0] if most_common_type else None,
            "unique_types": len(mbti_distribution),
            "average_scores": avg_scores
        }
    }

@router.get("/distribution")
async def get_mbti_distribution():
    """Get detailed MBTI type distribution"""
    candidates = load_candidates()
    assessed_candidates = [c for c in candidates if c.get('mbti_type')]
    
    # Group by positions
    position_distribution = {}
    for candidate in assessed_candidates:
        position = candidate.get('position_applied', 'Unknown')
        mbti_type = candidate.get('mbti_type')
        
        if position not in position_distribution:
            position_distribution[position] = {}
        
        if mbti_type not in position_distribution[position]:
            position_distribution[position][mbti_type] = 0
        
        position_distribution[position][mbti_type] += 1
    
    return {
        "overall_distribution": {
            mbti_type: len([c for c in assessed_candidates if c.get('mbti_type') == mbti_type])
            for mbti_type in set(c.get('mbti_type') for c in assessed_candidates if c.get('mbti_type'))
        },
        "position_distribution": position_distribution,
        "total_assessed": len(assessed_candidates)
    }

@router.get("/candidate/{candidate_id}")
async def get_candidate_personality(candidate_id: int):
    """Get personality assessment for a specific candidate"""
    candidates = load_candidates()
    
    candidate = next((c for c in candidates if c.get('id') == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    if not candidate.get('mbti_type'):
        raise HTTPException(status_code=404, detail="No personality assessment found for this candidate")
    
    return {
        "candidate_id": candidate_id,
        "mbti_type": candidate.get('mbti_type'),
        "personality_scores": candidate.get('personality_scores', {}),
        "personality_traits": candidate.get('personality_traits', []),
        "assessment_date": candidate.get('assessment_date'),
        "full_name": f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}",
        "position_applied": candidate.get('position_applied', '')
    }
