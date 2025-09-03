from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import BiasAnalysisRequest, BiasAnalysisResult
from datetime import datetime
import json
import os
import sys

# Add the services directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

# Import AI orchestrator
try:
    from services.ai_orchestrator import get_ai_orchestrator, AIOrchestrator
    AI_ORCHESTRATOR_AVAILABLE = True
    print("✅ AI Orchestrator import successful")
except ImportError as e:
    print(f"❌ AI Orchestrator import failed: {e}")
    AI_ORCHESTRATOR_AVAILABLE = False

router = APIRouter()

# Get AI orchestrator instance (which includes the enhanced bias detection engine)
def get_bias_detector():
    """Get the bias detection engine from AI orchestrator"""
    if AI_ORCHESTRATOR_AVAILABLE:
        orchestrator = get_ai_orchestrator()
        return orchestrator.bias_detector
    else:
        # Fallback to basic detection if AI orchestrator not available
        from app.models.bias_detection import BiasDetector
        return BiasDetector()

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
        if AI_ORCHESTRATOR_AVAILABLE:
            # Use enhanced AI orchestrator bias detection
            orchestrator = get_ai_orchestrator()
            analysis_result = orchestrator.get_bias_insights(candidates)
            
            return BiasAnalysisResult(
                overall_bias_score=analysis_result['summary'].get('overall_bias_score', 0.0),
                demographic_bias=analysis_result.get('demographic_analysis', {}),
                fairness_metrics=analysis_result.get('score_analysis', {}),
                recommendations=analysis_result.get('recommendations', []),
                flagged_decisions=[]  # Enhanced insights don't track individual flags
            )
        else:
            # Fallback to basic bias detector
            bias_detector = get_bias_detector()
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
        if AI_ORCHESTRATOR_AVAILABLE:
            # Use enhanced AI orchestrator for position-specific analysis
            orchestrator = get_ai_orchestrator()
            analysis_result = orchestrator.get_bias_insights(position_candidates)
            
            return {
                "position": position,
                "total_candidates": len(position_candidates),
                "bias_score": analysis_result['summary'].get('overall_bias_score', 0.0),
                "fairness_metrics": analysis_result.get('demographic_analysis', {}),
                "recommendations": analysis_result.get('recommendations', [])
            }
        else:
            # Fallback to basic bias detector
            bias_detector = get_bias_detector()
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
        if AI_ORCHESTRATOR_AVAILABLE:
            # Use enhanced AI orchestrator for comprehensive analysis
            orchestrator = get_ai_orchestrator()
            insights = orchestrator.get_bias_insights(candidates)
            overall_bias_score = insights['summary'].get('overall_bias_score', 0.0)
            recent_flags = []  # Enhanced analysis doesn't track individual flags
        else:
            # Fallback to basic bias detector
            bias_detector = get_bias_detector()
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
        if AI_ORCHESTRATOR_AVAILABLE:
            # Enhanced bias detection doesn't require separate training
            # as it uses statistical and rule-based methods
            return {
                "message": "Enhanced bias detection is ready (no training required)",
                "training_metrics": {
                    "method": "statistical_analysis",
                    "capabilities": ["demographic_parity", "equalized_odds", "text_analysis"]
                },
                "training_data_size": len(candidates)
            }
        else:
            # Fallback to ML-based training
            bias_detector = get_bias_detector()
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
        if AI_ORCHESTRATOR_AVAILABLE:
            # Use enhanced bias detection for audit
            orchestrator = get_ai_orchestrator()
            comparison_insights = orchestrator.get_bias_insights(comparison_group)
            
            # Individual candidate bias check
            individual_bias = {}
            if candidate.get('evaluation_notes'):
                bias_result = await orchestrator.detect_bias_comprehensive(
                    candidate['evaluation_notes'],
                    {'gender': candidate.get('gender'), 'ethnicity': candidate.get('ethnicity')}
                )
                individual_bias = bias_result
            
            bias_indicators = []
            candidate_demo = {
                'gender': candidate.get('gender'),
                'ethnicity': candidate.get('ethnicity')
            }
            
            # Check for bias using enhanced insights
            if comparison_insights.get('risk_level') == 'high':
                bias_indicators.append("High bias risk detected in comparison group")
            elif comparison_insights.get('risk_level') == 'medium':
                bias_indicators.append("Medium bias risk detected in comparison group")
            
            return {
                "candidate_id": candidate_id,
                "candidate_demographics": candidate_demo,
                "similar_candidates_count": len(similar_candidates),
                "bias_score": comparison_insights['summary'].get('overall_bias_score', 0.0),
                "bias_indicators": bias_indicators,
                "recommendations": comparison_insights.get('recommendations', []),
                "fairness_metrics": comparison_insights.get('demographic_analysis', {}),
                "individual_analysis": individual_bias
            }
        else:
            # Fallback to basic bias detector
            bias_detector = get_bias_detector()
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

# NEW: Enhanced AI-Powered Bias Detection Endpoints

@router.post("/text-analyze")
async def analyze_text_bias(request: Dict[str, Any]):
    """Analyze text for bias using enhanced AI orchestrator"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    text = request.get("text", "")
    candidate_info = request.get("candidate_info", {})
    
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    
    try:
        orchestrator = get_ai_orchestrator()
        
        # Use the enhanced bias detection
        analysis_result = await orchestrator.detect_bias_comprehensive(
            evaluation_text=text,
            candidate_info=candidate_info
        )
        
        return {
            "status": "success",
            "text_analysis": {
                "bias_detected": analysis_result.get('bias_detected', False),
                "bias_score": analysis_result.get('bias_score', 0.0),
                "confidence": analysis_result.get('confidence', 'medium'),
                "detected_patterns": analysis_result.get('detected_patterns', {}),
                "flagged_phrases": analysis_result.get('flagged_phrases', []),
                "risk_level": analysis_result.get('risk_level', 'low')
            },
            "recommendations": analysis_result.get('recommendations', []),
            "analysis_timestamp": analysis_result.get('analysis_timestamp')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/ai-analyze")
async def ai_analyze_bias(request: Dict[str, Any]):
    """Enhanced AI-powered bias analysis using the AI orchestrator"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    ai_orchestrator = get_ai_orchestrator()
    
    evaluation_text = request.get("evaluation_text", "")
    candidate_info = request.get("candidate_info", {})
    
    if not evaluation_text:
        raise HTTPException(status_code=400, detail="evaluation_text is required")
    
    # Load all candidates for statistical context
    candidates = load_candidates()
    
    try:
        # Perform comprehensive bias analysis
        bias_analysis = await ai_orchestrator.detect_bias_comprehensive(
            evaluation_text=evaluation_text,
            candidate_info=candidate_info,
            candidates_dataset=candidates
        )
        
        return {
            "status": "success",
            "analysis": bias_analysis,
            "analysis_type": "comprehensive_ai_powered",
            "timestamp": bias_analysis.get('analysis_timestamp')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI bias analysis failed: {str(e)}")

@router.get("/insights")
async def get_bias_insights():
    """Get comprehensive bias insights for all candidates"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    ai_orchestrator = get_ai_orchestrator()
    candidates = load_candidates()
    
    if not candidates:
        raise HTTPException(status_code=404, detail="No candidates found")
    
    try:
        insights = ai_orchestrator.get_bias_insights(candidates)
        return {
            "status": "success",
            "insights": insights,
            "total_candidates_analyzed": len(candidates),
            "analysis_timestamp": insights.get('summary', {}).get('analysis_timestamp')
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")

@router.post("/text-analyze")
async def analyze_text_bias(request: Dict[str, Any]):
    """Analyze text for bias indicators using rule-based analysis"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    ai_orchestrator = get_ai_orchestrator()
    
    text = request.get("text", "")
    candidate_info = request.get("candidate_info", {})
    
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    
    try:
        # Use the AI orchestrator's text bias analysis
        text_analysis = ai_orchestrator._analyze_text_bias(text, candidate_info)
        
        return {
            "status": "success",
            "text_analysis": text_analysis,
            "analysis_type": text_analysis.get("analysis_type", "rule_based_text_analysis"),
            "text_length": len(text)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

@router.post("/text-analyze-advanced")
async def analyze_text_bias_advanced(request: Dict[str, Any]):
    """Advanced text bias analysis using ML and NLP techniques"""
    
    text = request.get("text", "")
    candidate_info = request.get("candidate_info", {})
    
    if not text:
        raise HTTPException(status_code=400, detail="text is required")
    
    try:
        # Import and use the advanced text bias analyzer directly
        from app.models.text_bias_analyzer import analyze_text_bias, get_bias_analyzer_info
        
        # Get analyzer capabilities info
        analyzer_info = get_bias_analyzer_info()
        
        # Perform comprehensive analysis
        analysis_result = analyze_text_bias(text, candidate_info)
        
        return {
            "status": "success",
            "analysis_method": "advanced_ml_nlp",
            "analyzer_capabilities": analyzer_info,
            "text_analysis": {
                "bias_detected": analysis_result['bias_detected'],
                "bias_score": analysis_result['bias_score'],
                "confidence": analysis_result['confidence'],
                "risk_level": analysis_result['risk_level'],
                "detected_patterns": analysis_result['detected_patterns'],
                "sentiment_analysis": analysis_result['sentiment_analysis'],
                "linguistic_analysis": analysis_result['linguistic_analysis'],
                "recommendations": analysis_result['recommendations']
            },
            "detailed_analysis": analysis_result['detailed_analysis'],
            "text_length": len(text),
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except ImportError as e:
        raise HTTPException(status_code=503, detail=f"Advanced analyzer not available: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced text analysis failed: {str(e)}")

@router.get("/health")
async def bias_detection_health():
    """Health check for bias detection services"""
    candidates = load_candidates()
    
    health_status = {
        "bias_detector_available": True,
        "ai_orchestrator_available": AI_ORCHESTRATOR_AVAILABLE,
        "total_candidates": len(candidates),
        "analysis_capabilities": [
            "statistical_bias_detection",
            "rule_based_text_analysis", 
            "fairness_metrics_calculation",
            "demographic_parity_analysis"
        ]
    }
    
    # Test AI orchestrator functionality
    if AI_ORCHESTRATOR_AVAILABLE:
        try:
            ai_orchestrator = get_ai_orchestrator()
            
            # Verify AI orchestrator is working
            ai_insights = ai_orchestrator.get_ai_insights()
            health_status["ai_capabilities"] = ai_insights.get("available_features", [])
            health_status["ai_status"] = ai_insights.get("ai_status", "active")
            health_status["langchain_available"] = ai_insights.get("langchain_available", False)
            health_status["langfuse_connected"] = ai_insights.get("langfuse_connected", False)
            
            # Test bias detection engine
            if len(candidates) > 0:
                # Test with small sample
                test_result = ai_orchestrator.bias_detector.analyze_demographic_bias(
                    candidates[:5], 'gender'
                )
                health_status["bias_engine_test"] = "passed" if test_result else "failed"
            else:
                health_status["bias_engine_test"] = "no_data"
                
        except Exception as e:
            health_status["ai_status"] = f"error: {str(e)}"
            health_status["ai_error_details"] = str(e)
            # Still mark as available if import worked, just with error
            health_status["ai_orchestrator_available"] = True
    else:
        health_status["ai_status"] = "import_failed"
    
    return health_status

@router.post("/batch-analyze")
async def batch_analyze_bias(request: Dict[str, Any]):
    """Batch analysis of multiple evaluations for bias detection"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    ai_orchestrator = get_ai_orchestrator()
    
    evaluations = request.get("evaluations", [])
    if not evaluations:
        raise HTTPException(status_code=400, detail="evaluations list is required")
    
    if len(evaluations) > 50:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 50 evaluations per batch")
    
    # Load candidates for context
    candidates = load_candidates()
    
    batch_results = []
    
    try:
        for i, evaluation in enumerate(evaluations):
            evaluation_text = evaluation.get("text", "")
            candidate_info = evaluation.get("candidate_info", {})
            
            if not evaluation_text:
                batch_results.append({
                    "index": i,
                    "status": "error",
                    "error": "Missing evaluation text"
                })
                continue
            
            # Analyze this evaluation
            analysis = await ai_orchestrator.detect_bias_comprehensive(
                evaluation_text=evaluation_text,
                candidate_info=candidate_info,
                candidates_dataset=candidates
            )
            
            batch_results.append({
                "index": i,
                "status": "success",
                "analysis": analysis
            })
        
        return {
            "status": "success",
            "batch_results": batch_results,
            "total_evaluations": len(evaluations),
            "successful_analyses": len([r for r in batch_results if r["status"] == "success"]),
            "failed_analyses": len([r for r in batch_results if r["status"] == "error"])
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@router.get("/recommendations/{risk_level}")
async def get_bias_recommendations(risk_level: str):
    """Get bias mitigation recommendations based on risk level"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    ai_orchestrator = get_ai_orchestrator()
    
    if risk_level not in ["low", "medium", "high"]:
        raise HTTPException(status_code=400, detail="risk_level must be 'low', 'medium', or 'high'")
    
    # Generate recommendations based on risk level
    mock_analysis = {
        "bias_detected": risk_level != "low",
        "bias_score": {"low": 0.1, "medium": 0.5, "high": 0.8}[risk_level],
        "bias_types": {
            "low": [],
            "medium": ["demographic_bias"],
            "high": ["demographic_bias", "score_bias", "text_bias"]
        }[risk_level]
    }
    
    recommendations = ai_orchestrator.bias_detector.generate_bias_recommendations(mock_analysis)
    
    return {
        "status": "success",
        "risk_level": risk_level,
        "recommendations": recommendations,
        "action_priority": {
            "low": "Monitor and maintain current practices",
            "medium": "Review and implement improvements",
            "high": "Immediate action required"
        }[risk_level],
        "estimated_impact": {
            "low": "Minimal bias detected - continue monitoring",
            "medium": "Moderate bias - implement preventive measures",
            "high": "Significant bias - immediate intervention required"
        }[risk_level]
    }

@router.post("/validate-decision")
async def validate_hiring_decision(request: Dict[str, Any]):
    """Validate a hiring decision for potential bias"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI Orchestrator not available")
    
    ai_orchestrator = get_ai_orchestrator()
    
    candidate_id = request.get("candidate_id")
    decision = request.get("decision")
    evaluation_notes = request.get("evaluation_notes", "")
    
    if not candidate_id or not decision:
        raise HTTPException(status_code=400, detail="candidate_id and decision are required")
    
    if decision not in ["hire", "reject", "pending"]:
        raise HTTPException(status_code=400, detail="decision must be 'hire', 'reject', or 'pending'")
    
    # Load candidates for analysis
    candidates = load_candidates()
    candidate = next((c for c in candidates if c.get('id') == candidate_id), None)
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    try:
        # Analyze the decision for bias
        decision_analysis = await ai_orchestrator.detect_bias_comprehensive(
            evaluation_text=evaluation_notes or f"Decision: {decision} for candidate {candidate_id}",
            candidate_info=candidate,
            candidates_dataset=candidates
        )
        
        # Additional decision validation logic
        validation_result = {
            "candidate_id": candidate_id,
            "decision": decision,
            "bias_analysis": decision_analysis,
            "validation_status": "passed" if decision_analysis.get('bias_score', 0) < 0.3 else "flagged",
            "confidence_score": 1.0 - decision_analysis.get('bias_score', 0)
        }
        
        return {
            "status": "success",
            "validation": validation_result,
            "recommendation": "proceed" if validation_result["validation_status"] == "passed" else "review_required"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decision validation failed: {str(e)}")

@router.get("/insights")
async def get_comprehensive_insights():
    """Get comprehensive bias insights using enhanced AI orchestrator"""
    if not AI_ORCHESTRATOR_AVAILABLE:
        return {
            "status": "limited",
            "message": "AI Orchestrator not available, using basic insights",
            "insights": {}
        }
    
    candidates = load_candidates()
    
    if not candidates:
        return {
            "status": "no_data",
            "message": "No candidates available for analysis",
            "insights": {}
        }
    
    try:
        orchestrator = get_ai_orchestrator()
        
        # First, let's add some debugging
        print(f"DEBUG: Analyzing {len(candidates)} candidates")
        
        # Get insights with error handling
        comprehensive_insights = orchestrator.get_bias_insights(candidates)
        
        print(f"DEBUG: Got insights, converting numpy types...")
        
        # Ensure all data is JSON serializable
        from services.ai_orchestrator import convert_numpy_types
        safe_insights = convert_numpy_types(comprehensive_insights)
        
        print(f"DEBUG: Conversion successful")
        
        return {
            "status": "success",
            "insights": safe_insights,
            "total_candidates": len(candidates),
            "analysis_timestamp": safe_insights.get('summary', {}).get('analysis_timestamp')
        }
    
    except Exception as e:
        print(f"DEBUG: Error in insights generation: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return a safe fallback response
        return {
            "status": "error",
            "message": f"Insights generation failed: {str(e)}",
            "insights": {
                "summary": {"message": "Analysis failed, please try again"},
                "risk_level": "unknown"
            },
            "total_candidates": len(candidates) if candidates else 0
        }
