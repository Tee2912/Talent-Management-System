from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import random

router = APIRouter()

# Mock data for interview feedback
FEEDBACK_DATA = {
    "feedback_forms": [
        {
            "id": 1,
            "interview_id": 101,
            "candidate_name": "John Doe",
            "candidate_id": 1,
            "position": "Software Engineer",
            "interviewer_name": "Sarah Wilson",
            "interviewer_id": 5,
            "interview_date": "2024-01-15T10:00:00",
            "feedback_submitted_at": "2024-01-15T11:30:00",
            "overall_rating": 4,
            "technical_rating": 4,
            "communication_rating": 4,
            "cultural_fit_rating": 4,
            "problem_solving_rating": 4,
            "strengths": [
                "Strong technical background in React and Node.js",
                "Excellent problem-solving approach",
                "Clear communication skills"
            ],
            "areas_for_improvement": [
                "Could improve knowledge in system design",
                "More experience with cloud platforms needed"
            ],
            "detailed_feedback": "John demonstrated solid technical skills and showed a methodical approach to problem-solving. His code was clean and well-structured. He asked good clarifying questions and explained his thought process clearly.",
            "recommendation": "hire",
            "next_steps": "Proceed to final round with CTO",
            "questions_asked": [
                "Implement a function to reverse a linked list",
                "Design a simple chat application",
                "Explain the difference between SQL and NoSQL databases"
            ],
            "candidate_responses": [
                "Provided correct recursive and iterative solutions",
                "Good high-level design with consideration for scalability",
                "Clear explanation with practical examples"
            ],
            "interview_duration": 60,
            "notes": "Candidate was well-prepared and professional throughout the interview."
        },
        {
            "id": 2,
            "interview_id": 102,
            "candidate_name": "Jane Smith",
            "candidate_id": 2,
            "position": "Data Scientist",
            "interviewer_name": "Mike Johnson",
            "interviewer_id": 3,
            "interview_date": "2024-01-16T14:00:00",
            "feedback_submitted_at": "2024-01-16T15:45:00",
            "overall_rating": 5,
            "technical_rating": 5,
            "communication_rating": 4,
            "cultural_fit_rating": 5,
            "problem_solving_rating": 5,
            "strengths": [
                "Exceptional analytical skills",
                "Deep understanding of machine learning algorithms",
                "Great cultural fit with team values"
            ],
            "areas_for_improvement": [
                "Could work on presenting technical concepts to non-technical stakeholders"
            ],
            "detailed_feedback": "Jane showed exceptional technical depth and demonstrated strong analytical thinking. Her approach to the data analysis problem was methodical and innovative.",
            "recommendation": "strong_hire",
            "next_steps": "Extend offer immediately",
            "questions_asked": [
                "Analyze this dataset and identify trends",
                "Explain your approach to model validation",
                "How would you handle missing data?"
            ],
            "candidate_responses": [
                "Excellent analysis with clear insights",
                "Comprehensive validation strategy",
                "Multiple appropriate techniques discussed"
            ],
            "interview_duration": 75,
            "notes": "Outstanding candidate, would be a great addition to the team."
        }
    ],
    "feedback_templates": {
        "technical_interview": {
            "name": "Technical Interview Feedback",
            "sections": [
                {
                    "title": "Technical Skills",
                    "fields": [
                        {"name": "coding_skills", "type": "rating", "label": "Coding Skills", "required": True},
                        {"name": "problem_solving", "type": "rating", "label": "Problem Solving", "required": True},
                        {"name": "technical_knowledge", "type": "rating", "label": "Technical Knowledge", "required": True}
                    ]
                },
                {
                    "title": "Communication",
                    "fields": [
                        {"name": "explanation_clarity", "type": "rating", "label": "Explanation Clarity", "required": True},
                        {"name": "question_asking", "type": "rating", "label": "Question Asking", "required": False}
                    ]
                },
                {
                    "title": "Overall Assessment",
                    "fields": [
                        {"name": "overall_rating", "type": "rating", "label": "Overall Rating", "required": True},
                        {"name": "recommendation", "type": "select", "label": "Recommendation", "options": ["strong_hire", "hire", "no_hire", "strong_no_hire"], "required": True},
                        {"name": "detailed_feedback", "type": "textarea", "label": "Detailed Feedback", "required": True}
                    ]
                }
            ]
        },
        "behavioral_interview": {
            "name": "Behavioral Interview Feedback",
            "sections": [
                {
                    "title": "Cultural Fit",
                    "fields": [
                        {"name": "team_collaboration", "type": "rating", "label": "Team Collaboration", "required": True},
                        {"name": "adaptability", "type": "rating", "label": "Adaptability", "required": True},
                        {"name": "leadership_potential", "type": "rating", "label": "Leadership Potential", "required": False}
                    ]
                },
                {
                    "title": "Communication",
                    "fields": [
                        {"name": "communication_skills", "type": "rating", "label": "Communication Skills", "required": True},
                        {"name": "storytelling", "type": "rating", "label": "Storytelling Ability", "required": False}
                    ]
                },
                {
                    "title": "Overall Assessment",
                    "fields": [
                        {"name": "overall_rating", "type": "rating", "label": "Overall Rating", "required": True},
                        {"name": "recommendation", "type": "select", "label": "Recommendation", "options": ["strong_hire", "hire", "no_hire", "strong_no_hire"], "required": True},
                        {"name": "cultural_fit_notes", "type": "textarea", "label": "Cultural Fit Notes", "required": True}
                    ]
                }
            ]
        }
    },
    "feedback_analytics": {
        "submission_rate": 94.2,
        "average_completion_time": 12.5,
        "quality_score": 4.1,
        "consistency_metrics": {
            "inter_rater_reliability": 0.82,
            "rating_variance": 0.8,
            "calibration_score": 0.89
        }
    }
}

@router.get("/templates")
async def get_feedback_templates():
    """Get available feedback templates"""
    return {
        "success": True,
        "templates": FEEDBACK_DATA["feedback_templates"]
    }

@router.post("/templates")
async def create_feedback_template(template_data: Dict[str, Any]):
    """Create a new feedback template"""
    try:
        template_name = template_data.get("name")
        if not template_name:
            raise HTTPException(status_code=400, detail="Template name is required")
        
        # Add template to data
        FEEDBACK_DATA["feedback_templates"][template_name.lower().replace(" ", "_")] = template_data
        
        return {
            "success": True,
            "message": "Feedback template created successfully",
            "template": template_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@router.get("/interviews/{interview_id}/feedback-form")
async def get_feedback_form(interview_id: int, template: Optional[str] = "technical_interview"):
    """Get feedback form for a specific interview"""
    try:
        # In a real implementation, you would fetch interview details from database
        interview_details = {
            "interview_id": interview_id,
            "candidate_name": "Sample Candidate",
            "position": "Software Engineer",
            "interview_date": datetime.now().isoformat(),
            "interviewer_name": "Current User"
        }
        
        if template not in FEEDBACK_DATA["feedback_templates"]:
            raise HTTPException(status_code=404, detail="Template not found")
        
        feedback_form = {
            "interview_details": interview_details,
            "template": FEEDBACK_DATA["feedback_templates"][template],
            "form_id": f"feedback_{interview_id}_{int(datetime.now().timestamp())}"
        }
        
        return {
            "success": True,
            "form": feedback_form
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feedback form: {str(e)}")

@router.post("/submit")
async def submit_feedback(feedback_data: Dict[str, Any]):
    """Submit interview feedback"""
    try:
        # Validate required fields
        required_fields = ["interview_id", "interviewer_id", "overall_rating", "recommendation"]
        for field in required_fields:
            if field not in feedback_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create feedback record
        feedback_record = {
            "id": len(FEEDBACK_DATA["feedback_forms"]) + 1,
            "interview_id": feedback_data["interview_id"],
            "candidate_id": feedback_data.get("candidate_id"),
            "candidate_name": feedback_data.get("candidate_name"),
            "position": feedback_data.get("position"),
            "interviewer_id": feedback_data["interviewer_id"],
            "interviewer_name": feedback_data.get("interviewer_name"),
            "interview_date": feedback_data.get("interview_date"),
            "feedback_submitted_at": datetime.now().isoformat(),
            "overall_rating": feedback_data["overall_rating"],
            "technical_rating": feedback_data.get("technical_rating"),
            "communication_rating": feedback_data.get("communication_rating"),
            "cultural_fit_rating": feedback_data.get("cultural_fit_rating"),
            "problem_solving_rating": feedback_data.get("problem_solving_rating"),
            "strengths": feedback_data.get("strengths", []),
            "areas_for_improvement": feedback_data.get("areas_for_improvement", []),
            "detailed_feedback": feedback_data.get("detailed_feedback", ""),
            "recommendation": feedback_data["recommendation"],
            "next_steps": feedback_data.get("next_steps", ""),
            "questions_asked": feedback_data.get("questions_asked", []),
            "candidate_responses": feedback_data.get("candidate_responses", []),
            "interview_duration": feedback_data.get("interview_duration"),
            "notes": feedback_data.get("notes", ""),
            "custom_fields": feedback_data.get("custom_fields", {})
        }
        
        FEEDBACK_DATA["feedback_forms"].append(feedback_record)
        
        return {
            "success": True,
            "message": "Feedback submitted successfully",
            "feedback_id": feedback_record["id"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit feedback: {str(e)}")

@router.get("/interviews/{interview_id}")
async def get_interview_feedback(interview_id: int):
    """Get all feedback for a specific interview"""
    feedback_list = [
        feedback for feedback in FEEDBACK_DATA["feedback_forms"]
        if feedback["interview_id"] == interview_id
    ]
    
    return {
        "success": True,
        "feedback": feedback_list
    }

@router.get("/candidates/{candidate_id}")
async def get_candidate_feedback(candidate_id: int):
    """Get all feedback for a specific candidate"""
    feedback_list = [
        feedback for feedback in FEEDBACK_DATA["feedback_forms"]
        if feedback.get("candidate_id") == candidate_id
    ]
    
    return {
        "success": True,
        "feedback": feedback_list
    }

@router.get("/interviewers/{interviewer_id}")
async def get_interviewer_feedback(interviewer_id: int):
    """Get all feedback submitted by a specific interviewer"""
    feedback_list = [
        feedback for feedback in FEEDBACK_DATA["feedback_forms"]
        if feedback["interviewer_id"] == interviewer_id
    ]
    
    return {
        "success": True,
        "feedback": feedback_list
    }

@router.get("/analytics")
async def get_feedback_analytics():
    """Get feedback analytics and metrics"""
    # Calculate additional analytics
    all_feedback = FEEDBACK_DATA["feedback_forms"]
    
    if not all_feedback:
        return {
            "success": True,
            "analytics": FEEDBACK_DATA["feedback_analytics"]
        }
    
    # Rating distribution
    ratings = [f["overall_rating"] for f in all_feedback if f.get("overall_rating")]
    rating_distribution = {}
    for i in range(1, 6):
        rating_distribution[str(i)] = ratings.count(i)
    
    # Recommendation distribution
    recommendations = [f["recommendation"] for f in all_feedback if f.get("recommendation")]
    recommendation_distribution = {}
    for rec in ["strong_hire", "hire", "no_hire", "strong_no_hire"]:
        recommendation_distribution[rec] = recommendations.count(rec)
    
    # Interviewer performance
    interviewer_stats = {}
    for feedback in all_feedback:
        interviewer_id = str(feedback["interviewer_id"])
        if interviewer_id not in interviewer_stats:
            interviewer_stats[interviewer_id] = {
                "name": feedback.get("interviewer_name", f"Interviewer {interviewer_id}"),
                "feedback_count": 0,
                "average_rating": 0,
                "recommendations": {"strong_hire": 0, "hire": 0, "no_hire": 0, "strong_no_hire": 0}
            }
        
        interviewer_stats[interviewer_id]["feedback_count"] += 1
        if feedback.get("overall_rating"):
            current_avg = interviewer_stats[interviewer_id]["average_rating"]
            count = interviewer_stats[interviewer_id]["feedback_count"]
            interviewer_stats[interviewer_id]["average_rating"] = (
                (current_avg * (count - 1) + feedback["overall_rating"]) / count
            )
        
        if feedback.get("recommendation"):
            interviewer_stats[interviewer_id]["recommendations"][feedback["recommendation"]] += 1
    
    analytics_data = {
        **FEEDBACK_DATA["feedback_analytics"],
        "rating_distribution": rating_distribution,
        "recommendation_distribution": recommendation_distribution,
        "interviewer_performance": interviewer_stats,
        "total_feedback_forms": len(all_feedback),
        "average_rating": sum(ratings) / len(ratings) if ratings else 0,
        "feedback_trends": {
            "last_30_days": len([f for f in all_feedback if datetime.fromisoformat(f["feedback_submitted_at"]) > datetime.now() - timedelta(days=30)]),
            "completion_rate": 94.2,  # Mock data
            "response_time_avg": 12.5  # Mock data
        }
    }
    
    return {
        "success": True,
        "analytics": analytics_data
    }

@router.get("/summary/{candidate_id}")
async def get_candidate_feedback_summary(candidate_id: int):
    """Get summarized feedback for a candidate"""
    candidate_feedback = [
        feedback for feedback in FEEDBACK_DATA["feedback_forms"]
        if feedback.get("candidate_id") == candidate_id
    ]
    
    if not candidate_feedback:
        return {
            "success": True,
            "summary": {
                "candidate_id": candidate_id,
                "total_interviews": 0,
                "average_rating": 0,
                "recommendations": {},
                "strengths": [],
                "areas_for_improvement": []
            }
        }
    
    # Calculate summary metrics
    ratings = [f["overall_rating"] for f in candidate_feedback if f.get("overall_rating")]
    average_rating = sum(ratings) / len(ratings) if ratings else 0
    
    recommendations = [f["recommendation"] for f in candidate_feedback if f.get("recommendation")]
    recommendation_counts = {}
    for rec in recommendations:
        recommendation_counts[rec] = recommendation_counts.get(rec, 0) + 1
    
    # Aggregate strengths and areas for improvement
    all_strengths = []
    all_improvements = []
    
    for feedback in candidate_feedback:
        all_strengths.extend(feedback.get("strengths", []))
        all_improvements.extend(feedback.get("areas_for_improvement", []))
    
    # Count frequency of similar feedback
    strength_counts = {}
    for strength in all_strengths:
        strength_counts[strength] = strength_counts.get(strength, 0) + 1
    
    improvement_counts = {}
    for improvement in all_improvements:
        improvement_counts[improvement] = improvement_counts.get(improvement, 0) + 1
    
    summary = {
        "candidate_id": candidate_id,
        "candidate_name": candidate_feedback[0].get("candidate_name", ""),
        "total_interviews": len(candidate_feedback),
        "average_rating": round(average_rating, 2),
        "recommendations": recommendation_counts,
        "common_strengths": sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:5],
        "common_improvements": sorted(improvement_counts.items(), key=lambda x: x[1], reverse=True)[:5],
        "interview_dates": [f["interview_date"] for f in candidate_feedback],
        "interviewers": [f["interviewer_name"] for f in candidate_feedback],
        "positions": list(set([f["position"] for f in candidate_feedback if f.get("position")]))
    }
    
    return {
        "success": True,
        "summary": summary
    }

@router.put("/feedback/{feedback_id}")
async def update_feedback(feedback_id: int, update_data: Dict[str, Any]):
    """Update existing feedback"""
    try:
        # Find feedback
        feedback = None
        for f in FEEDBACK_DATA["feedback_forms"]:
            if f["id"] == feedback_id:
                feedback = f
                break
        
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        # Update fields
        for key, value in update_data.items():
            if key in feedback:
                feedback[key] = value
        
        feedback["updated_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": "Feedback updated successfully",
            "feedback": feedback
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update feedback: {str(e)}")

@router.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: int):
    """Delete feedback"""
    try:
        # Find and remove feedback
        for i, feedback in enumerate(FEEDBACK_DATA["feedback_forms"]):
            if feedback["id"] == feedback_id:
                del FEEDBACK_DATA["feedback_forms"][i]
                return {
                    "success": True,
                    "message": "Feedback deleted successfully"
                }
        
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete feedback: {str(e)}")

@router.get("/bulk-export")
async def export_feedback(
    format: str = "excel",
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    interviewer_id: Optional[int] = None
):
    """Export feedback data in bulk"""
    try:
        if format not in ["excel", "csv", "pdf"]:
            raise HTTPException(status_code=400, detail="Unsupported export format")
        
        filtered_feedback = FEEDBACK_DATA["feedback_forms"]
        
        # Apply filters
        if date_from:
            date_from_obj = datetime.fromisoformat(date_from)
            filtered_feedback = [
                f for f in filtered_feedback
                if datetime.fromisoformat(f["feedback_submitted_at"]) >= date_from_obj
            ]
        
        if date_to:
            date_to_obj = datetime.fromisoformat(date_to)
            filtered_feedback = [
                f for f in filtered_feedback
                if datetime.fromisoformat(f["feedback_submitted_at"]) <= date_to_obj
            ]
        
        if interviewer_id:
            filtered_feedback = [
                f for f in filtered_feedback
                if f["interviewer_id"] == interviewer_id
            ]
        
        export_data = {
            "export_id": f"feedback_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "format": format,
            "record_count": len(filtered_feedback),
            "generated_at": datetime.now().isoformat(),
            "download_url": f"/api/v1/feedback/download/feedback_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}",
            "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
        }
        
        return {
            "success": True,
            "export": export_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export feedback: {str(e)}")
