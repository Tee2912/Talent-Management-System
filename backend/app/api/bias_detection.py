from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import BiasAnalysisRequest, BiasAnalysisResult
from app.models.bias_detection import BiasDetector
import json
import os

router = APIRouter()

# Initialize bias detector
bias_detector = BiasDetector()

def load_candidates() -> List[dict]:
    """Load candidates from JSON file"""
    if not os.path.exists("candidates.json"):
        return []
    try:
        with open("candidates.json", 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

@router.post("/analyze", response_model=BiasAnalysisResult)
async def analyze_bias(request: BiasAnalysisRequest):
    """Analyze hiring decisions for bias"""
    candidates = load_candidates()
    
    # Filter candidates if specific IDs provided
    if request.candidate_ids:
        candidates = [c for c in candidates if c.get('id') in request.candidate_ids]
    
    # Filter by position if specified
    if request.position:
        candidates = [c for c in candidates if c.get('position_applied', '').lower() == request.position.lower()]
    
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found for analysis")
    
    # Perform bias analysis
    try:
        analysis_result = bias_detector.detect_bias(candidates)
        
        return BiasAnalysisResult(
            overall_bias_score=analysis_result['bias_score'],
            demographic_bias=analysis_result.get('fairness_metrics', {}),
            fairness_metrics=analysis_result.get('fairness_metrics', {}),
            recommendations=analysis_result.get('recommendations', []),
            flagged_decisions=analysis_result.get('flagged_candidates', [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bias analysis failed: {str(e)}")

@router.get("/metrics/{position}")
async def get_fairness_metrics(position: str):
    """Get fairness metrics for a specific position"""
    candidates = load_candidates()
    position_candidates = [c for c in candidates if c.get('position_applied', '').lower() == position.lower()]
    
    if not position_candidates:
        raise HTTPException(status_code=404, detail=f"No candidates found for position: {position}")
    
    try:
        analysis_result = bias_detector.detect_bias(position_candidates)
        return {
            "position": position,
            "total_candidates": len(position_candidates),
            "bias_score": analysis_result['bias_score'],
            "fairness_metrics": analysis_result.get('fairness_metrics', {}),
            "recommendations": analysis_result.get('recommendations', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Metrics calculation failed: {str(e)}")

@router.get("/dashboard")
async def get_bias_dashboard():
    """Get bias dashboard data"""
    candidates = load_candidates()
    
    if not candidates:
        return {
            "total_candidates": 0,
            "overall_bias_score": 0.0,
            "position_breakdown": {},
            "demographic_summary": {},
            "recent_flags": []
        }
    
    # Overall statistics
    total_candidates = len(candidates)
    hired_candidates = len([c for c in candidates if c.get('hiring_decision') == 'hired'])
    
    # Position breakdown
    positions = {}
    for candidate in candidates:
        position = candidate.get('position_applied', 'Unknown')
        if position not in positions:
            positions[position] = {'total': 0, 'hired': 0}
        positions[position]['total'] += 1
        if candidate.get('hiring_decision') == 'hired':
            positions[position]['hired'] += 1
    
    # Calculate hiring rates by position
    for position in positions:
        total = positions[position]['total']
        hired = positions[position]['hired']
        positions[position]['hiring_rate'] = (hired / total * 100) if total > 0 else 0
    
    # Demographic summary
    demographics = {
        'gender': {},
        'ethnicity': {}
    }
    
    for candidate in candidates:
        gender = candidate.get('gender', 'unknown')
        ethnicity = candidate.get('ethnicity', 'unknown')
        
        if gender not in demographics['gender']:
            demographics['gender'][gender] = {'total': 0, 'hired': 0}
        if ethnicity not in demographics['ethnicity']:
            demographics['ethnicity'][ethnicity] = {'total': 0, 'hired': 0}
        
        demographics['gender'][gender]['total'] += 1
        demographics['ethnicity'][ethnicity]['total'] += 1
        
        if candidate.get('hiring_decision') == 'hired':
            demographics['gender'][gender]['hired'] += 1
            demographics['ethnicity'][ethnicity]['hired'] += 1
    
    # Calculate hiring rates by demographics
    for demo_type in demographics:
        for group in demographics[demo_type]:
            total = demographics[demo_type][group]['total']
            hired = demographics[demo_type][group]['hired']
            demographics[demo_type][group]['hiring_rate'] = (hired / total * 100) if total > 0 else 0
    
    # Overall bias analysis
    try:
        analysis_result = bias_detector.detect_bias(candidates)
        overall_bias_score = analysis_result['bias_score']
        recent_flags = analysis_result.get('flagged_candidates', [])
    except:
        overall_bias_score = 0.0
        recent_flags = []
    
    return {
        "total_candidates": total_candidates,
        "total_hired": hired_candidates,
        "overall_hiring_rate": (hired_candidates / total_candidates * 100) if total_candidates > 0 else 0,
        "overall_bias_score": overall_bias_score,
        "position_breakdown": positions,
        "demographic_summary": demographics,
        "recent_flags": recent_flags[:10]  # Last 10 flagged candidates
    }

@router.post("/train")
async def train_bias_model():
    """Train the bias detection model with current data"""
    candidates = load_candidates()
    
    if len(candidates) < 50:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient training data. Need at least 50 candidates, found {len(candidates)}"
        )
    
    try:
        metrics = bias_detector.train_model(candidates)
        return {
            "message": "Model trained successfully",
            "training_metrics": metrics,
            "training_data_size": len(candidates)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/audit/{candidate_id}")
async def audit_candidate_decision(candidate_id: int):
    """Audit a specific candidate's hiring decision for bias"""
    candidates = load_candidates()
    
    candidate = next((c for c in candidates if c.get('id') == candidate_id), None)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Find similar candidates for comparison
    similar_candidates = []
    for c in candidates:
        if (c.get('id') != candidate_id and 
            c.get('position_applied') == candidate.get('position_applied') and
            abs(c.get('experience_years', 0) - candidate.get('experience_years', 0)) <= 2):
            similar_candidates.append(c)
    
    if not similar_candidates:
        return {
            "candidate_id": candidate_id,
            "audit_result": "No similar candidates found for comparison",
            "bias_indicators": [],
            "recommendations": ["Expand comparison criteria or increase candidate pool"]
        }
    
    # Analyze bias for this candidate and similar ones
    comparison_group = [candidate] + similar_candidates
    
    try:
        analysis_result = bias_detector.detect_bias(comparison_group)
        
        bias_indicators = []
        if candidate_id in analysis_result.get('flagged_candidates', []):
            bias_indicators.append("Candidate flagged by bias detection algorithm")
        
        # Check for demographic disparities
        candidate_demo = {
            'gender': candidate.get('gender'),
            'ethnicity': candidate.get('ethnicity')
        }
        
        # Compare with similar candidates
        similar_decisions = [c.get('hiring_decision') for c in similar_candidates]
        candidate_decision = candidate.get('hiring_decision')
        
        if candidate_decision and similar_decisions:
            hired_similar = sum(1 for d in similar_decisions if d == 'hired')
            total_similar = len(similar_decisions)
            
            if candidate_decision != 'hired' and hired_similar / total_similar > 0.7:
                bias_indicators.append("Candidate rejected while most similar candidates were hired")
            elif candidate_decision == 'hired' and hired_similar / total_similar < 0.3:
                bias_indicators.append("Candidate hired while most similar candidates were rejected")
        
        return {
            "candidate_id": candidate_id,
            "candidate_demographics": candidate_demo,
            "similar_candidates_count": len(similar_candidates),
            "bias_score": analysis_result['bias_score'],
            "bias_indicators": bias_indicators,
            "recommendations": analysis_result.get('recommendations', []),
            "fairness_metrics": analysis_result.get('fairness_metrics', {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")
