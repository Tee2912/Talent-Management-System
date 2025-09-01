# Enhanced Personality Assessment with Cultural Fit Analysis
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
import json
import os
from datetime import datetime, timedelta
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import asyncio
from enum import Enum
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Enhanced Models
class AssessmentType(str, Enum):
    MBTI = "mbti"
    BIG_FIVE = "big_five"
    DISC = "disc"
    CULTURAL_FIT = "cultural_fit"
    TEAM_COMPATIBILITY = "team_compatibility"
    LEADERSHIP_POTENTIAL = "leadership_potential"
    EMOTIONAL_INTELLIGENCE = "emotional_intelligence"

class PersonalityDimension(BaseModel):
    name: str
    score: float = Field(..., ge=0, le=100)
    percentile: Optional[float] = None
    description: str
    strengths: List[str] = []
    development_areas: List[str] = []

class CulturalValue(BaseModel):
    dimension: str
    score: float = Field(..., ge=0, le=100)
    description: str
    alignment_level: str  # High, Medium, Low

class TeamRole(BaseModel):
    role_type: str
    compatibility_score: float
    description: str
    strengths: List[str]
    challenges: List[str]

class ComprehensiveAssessment(BaseModel):
    candidate_id: int
    assessment_types: List[AssessmentType]
    responses: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = {}

class PersonalityProfile(BaseModel):
    candidate_id: int
    assessment_date: datetime
    mbti_profile: Optional[Dict[str, Any]] = None
    big_five_profile: Optional[Dict[str, Any]] = None
    disc_profile: Optional[Dict[str, Any]] = None
    cultural_fit: Optional[Dict[str, Any]] = None
    team_compatibility: Optional[Dict[str, Any]] = None
    leadership_assessment: Optional[Dict[str, Any]] = None
    emotional_intelligence: Optional[Dict[str, Any]] = None
    overall_insights: Dict[str, Any]
    recommendations: List[str]

class CulturalFitRequest(BaseModel):
    candidate_id: int
    company_values: List[str]
    team_culture: Dict[str, Any]
    role_requirements: Dict[str, Any]

# Enhanced Assessment Questions
COMPREHENSIVE_QUESTIONS = {
    "mbti_extended": [
        {
            "id": "mbti_1",
            "question": "In group settings, I typically...",
            "options": [
                {"text": "Take charge and guide the discussion", "weight": {"E": 3, "T": 2, "J": 2}},
                {"text": "Contribute ideas when asked", "weight": {"I": 2, "F": 1}},
                {"text": "Listen and observe before speaking", "weight": {"I": 3, "S": 1}},
                {"text": "Generate creative possibilities", "weight": {"E": 1, "N": 3}}
            ],
            "category": "Social Interaction"
        },
        {
            "id": "mbti_2",
            "question": "When making important decisions, I rely most on...",
            "options": [
                {"text": "Logical analysis and objective criteria", "weight": {"T": 3, "J": 1}},
                {"text": "How it will affect people involved", "weight": {"F": 3, "I": 1}},
                {"text": "Past experience and proven methods", "weight": {"S": 3, "J": 2}},
                {"text": "Future possibilities and potential", "weight": {"N": 3, "P": 1}}
            ],
            "category": "Decision Making"
        },
        {
            "id": "mbti_3",
            "question": "My ideal work environment is...",
            "options": [
                {"text": "Structured with clear expectations", "weight": {"J": 3, "S": 1}},
                {"text": "Flexible and adaptable", "weight": {"P": 3, "N": 1}},
                {"text": "Collaborative and people-focused", "weight": {"F": 2, "E": 2}},
                {"text": "Independent with minimal interruptions", "weight": {"I": 3, "T": 1}}
            ],
            "category": "Work Style"
        }
    ],
    
    "big_five": [
        {
            "id": "bf_1",
            "question": "I see myself as someone who is outgoing, sociable",
            "scale": "strongly_disagree_to_agree",
            "dimension": "extraversion",
            "reverse_scored": False
        },
        {
            "id": "bf_2", 
            "question": "I see myself as someone who tends to find fault with others",
            "scale": "strongly_disagree_to_agree",
            "dimension": "agreeableness",
            "reverse_scored": True
        },
        {
            "id": "bf_3",
            "question": "I see myself as someone who does a thorough job",
            "scale": "strongly_disagree_to_agree", 
            "dimension": "conscientiousness",
            "reverse_scored": False
        },
        {
            "id": "bf_4",
            "question": "I see myself as someone who gets nervous easily",
            "scale": "strongly_disagree_to_agree",
            "dimension": "neuroticism", 
            "reverse_scored": False
        },
        {
            "id": "bf_5",
            "question": "I see myself as someone who has an active imagination",
            "scale": "strongly_disagree_to_agree",
            "dimension": "openness",
            "reverse_scored": False
        }
    ],
    
    "cultural_fit": [
        {
            "id": "cf_1",
            "question": "How important is work-life balance to you?",
            "scale": "not_important_to_very_important",
            "cultural_dimension": "work_life_balance"
        },
        {
            "id": "cf_2",
            "question": "I prefer working in environments that are...",
            "options": [
                {"text": "Highly competitive and results-driven", "weight": {"competition": 5, "results": 4}},
                {"text": "Collaborative and team-oriented", "weight": {"collaboration": 5, "teamwork": 4}},
                {"text": "Innovative and risk-taking", "weight": {"innovation": 5, "risk_tolerance": 4}},
                {"text": "Stable and process-oriented", "weight": {"stability": 5, "process": 4}}
            ],
            "cultural_dimension": "work_environment"
        }
    ],
    
    "emotional_intelligence": [
        {
            "id": "eq_1",
            "question": "When I'm feeling stressed, I...",
            "options": [
                {"text": "Take time to understand my emotions", "weight": {"self_awareness": 3}},
                {"text": "Focus on controlling my reactions", "weight": {"self_regulation": 3}},
                {"text": "Seek support from others", "weight": {"social_awareness": 2}},
                {"text": "Channel the energy into productive action", "weight": {"motivation": 3}}
            ],
            "category": "Self-Management"
        }
    ]
}

# Company Culture Profiles
CULTURE_PROFILES = {
    "innovative_startup": {
        "values": ["innovation", "agility", "risk_taking", "collaboration"],
        "work_style": "flexible",
        "hierarchy": "flat", 
        "pace": "fast",
        "decision_making": "decentralized"
    },
    "enterprise_corporate": {
        "values": ["stability", "process", "excellence", "professionalism"],
        "work_style": "structured",
        "hierarchy": "traditional",
        "pace": "steady",
        "decision_making": "centralized"
    },
    "creative_agency": {
        "values": ["creativity", "originality", "client_focus", "artistic_expression"],
        "work_style": "project_based",
        "hierarchy": "flat",
        "pace": "variable",
        "decision_making": "collaborative"
    }
}

class EnhancedPersonalityEngine:
    def __init__(self):
        self.assessment_cache = {}
        self.culture_models = self._initialize_culture_models()
        
    def _initialize_culture_models(self):
        """Initialize cultural fit models based on research data"""
        return {
            "hofstede_dimensions": {
                "power_distance": {"low": 0, "medium": 50, "high": 100},
                "individualism": {"collective": 0, "balanced": 50, "individual": 100},
                "uncertainty_avoidance": {"low": 0, "medium": 50, "high": 100},
                "masculinity": {"feminine": 0, "balanced": 50, "masculine": 100}
            },
            "organizational_culture": {
                "clan": {"collaboration": 100, "mentoring": 90, "consensus": 85},
                "adhocracy": {"innovation": 100, "entrepreneurship": 90, "flexibility": 85},
                "market": {"results": 100, "competition": 90, "achievement": 85},
                "hierarchy": {"control": 100, "efficiency": 90, "stability": 85}
            }
        }

    async def comprehensive_assessment(self, assessment_data: ComprehensiveAssessment) -> PersonalityProfile:
        """Conduct comprehensive personality assessment"""
        try:
            profile = PersonalityProfile(
                candidate_id=assessment_data.candidate_id,
                assessment_date=datetime.now(),
                overall_insights={},
                recommendations=[]
            )
            
            # Process each assessment type
            for assessment_type in assessment_data.assessment_types:
                if assessment_type == AssessmentType.MBTI:
                    profile.mbti_profile = await self._assess_mbti_enhanced(assessment_data.responses)
                elif assessment_type == AssessmentType.BIG_FIVE:
                    profile.big_five_profile = await self._assess_big_five(assessment_data.responses)
                elif assessment_type == AssessmentType.CULTURAL_FIT:
                    profile.cultural_fit = await self._assess_cultural_fit(assessment_data.responses, assessment_data.metadata)
                elif assessment_type == AssessmentType.TEAM_COMPATIBILITY:
                    profile.team_compatibility = await self._assess_team_compatibility(assessment_data.responses)
                elif assessment_type == AssessmentType.LEADERSHIP_POTENTIAL:
                    profile.leadership_assessment = await self._assess_leadership_potential(assessment_data.responses)
                elif assessment_type == AssessmentType.EMOTIONAL_INTELLIGENCE:
                    profile.emotional_intelligence = await self._assess_emotional_intelligence(assessment_data.responses)
            
            # Generate overall insights and recommendations
            profile.overall_insights = self._generate_overall_insights(profile)
            profile.recommendations = self._generate_recommendations(profile)
            
            return profile
            
        except Exception as e:
            logger.error(f"Comprehensive assessment failed: {e}")
            raise HTTPException(status_code=500, detail=f"Assessment processing failed: {str(e)}")

    async def _assess_mbti_enhanced(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced MBTI assessment with detailed insights"""
        dimensions = {"E": 0, "I": 0, "S": 0, "N": 0, "T": 0, "F": 0, "J": 0, "P": 0}
        
        # Process responses with weighted scoring
        for question_id, response in responses.items():
            if question_id.startswith("mbti_"):
                question_data = next((q for q in COMPREHENSIVE_QUESTIONS["mbti_extended"] if q["id"] == question_id), None)
                if question_data and isinstance(response, int) and 0 <= response < len(question_data["options"]):
                    weights = question_data["options"][response]["weight"]
                    for dim, weight in weights.items():
                        dimensions[dim] += weight

        # Calculate type and confidence
        mbti_type = (
            ("E" if dimensions["E"] > dimensions["I"] else "I") +
            ("S" if dimensions["S"] > dimensions["N"] else "N") +
            ("T" if dimensions["T"] > dimensions["F"] else "F") +
            ("J" if dimensions["J"] > dimensions["P"] else "P")
        )
        
        # Calculate confidence scores
        confidence_scores = {
            "E_I": abs(dimensions["E"] - dimensions["I"]) / (dimensions["E"] + dimensions["I"]) if (dimensions["E"] + dimensions["I"]) > 0 else 0,
            "S_N": abs(dimensions["S"] - dimensions["N"]) / (dimensions["S"] + dimensions["N"]) if (dimensions["S"] + dimensions["N"]) > 0 else 0,
            "T_F": abs(dimensions["T"] - dimensions["F"]) / (dimensions["T"] + dimensions["F"]) if (dimensions["T"] + dimensions["F"]) > 0 else 0,
            "J_P": abs(dimensions["J"] - dimensions["P"]) / (dimensions["J"] + dimensions["P"]) if (dimensions["J"] + dimensions["P"]) > 0 else 0
        }
        
        # Generate insights
        insights = self._generate_mbti_insights(mbti_type, confidence_scores, dimensions)
        
        return {
            "type": mbti_type,
            "dimensions": dimensions,
            "confidence_scores": confidence_scores,
            "insights": insights,
            "cognitive_functions": self._get_cognitive_functions(mbti_type),
            "career_suggestions": self._get_career_suggestions(mbti_type),
            "team_role": self._get_ideal_team_role(mbti_type),
            "communication_style": self._get_communication_style(mbti_type),
            "leadership_style": self._get_leadership_style(mbti_type)
        }

    async def _assess_big_five(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Assess Big Five personality traits"""
        dimensions = {
            "extraversion": [],
            "agreeableness": [], 
            "conscientiousness": [],
            "neuroticism": [],
            "openness": []
        }
        
        # Process Big Five responses
        for question_id, response in responses.items():
            if question_id.startswith("bf_"):
                question_data = next((q for q in COMPREHENSIVE_QUESTIONS["big_five"] if q["id"] == question_id), None)
                if question_data:
                    dimension = question_data["dimension"]
                    score = response
                    if question_data["reverse_scored"]:
                        score = 6 - score  # Reverse score (assuming 1-5 scale)
                    dimensions[dimension].append(score)
        
        # Calculate averages and percentiles
        big_five_scores = {}
        for dimension, scores in dimensions.items():
            if scores:
                avg_score = np.mean(scores)
                big_five_scores[dimension] = {
                    "score": round((avg_score - 1) * 25, 1),  # Convert to 0-100 scale
                    "percentile": self._calculate_percentile(avg_score, dimension),
                    "level": self._get_trait_level(avg_score),
                    "description": self._get_big_five_description(dimension, avg_score),
                    "facets": self._get_big_five_facets(dimension, avg_score)
                }
        
        return {
            "scores": big_five_scores,
            "profile_summary": self._generate_big_five_summary(big_five_scores),
            "strengths": self._identify_big_five_strengths(big_five_scores),
            "development_areas": self._identify_big_five_development_areas(big_five_scores),
            "work_preferences": self._predict_work_preferences(big_five_scores)
        }

    async def _assess_cultural_fit(self, responses: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Assess cultural fit based on company values and culture"""
        company_culture = metadata.get("company_culture", "innovative_startup")
        target_culture = CULTURE_PROFILES.get(company_culture, CULTURE_PROFILES["innovative_startup"])
        
        cultural_scores = {}
        
        # Process cultural fit responses
        for question_id, response in responses.items():
            if question_id.startswith("cf_"):
                question_data = next((q for q in COMPREHENSIVE_QUESTIONS["cultural_fit"] if q["id"] == question_id), None)
                if question_data:
                    if "options" in question_data and isinstance(response, int):
                        if 0 <= response < len(question_data["options"]):
                            weights = question_data["options"][response]["weight"]
                            for dimension, weight in weights.items():
                                cultural_scores[dimension] = cultural_scores.get(dimension, 0) + weight
                    else:
                        # Scale-based response
                        dimension = question_data["cultural_dimension"]
                        cultural_scores[dimension] = response
        
        # Calculate fit score
        fit_score = self._calculate_culture_fit_score(cultural_scores, target_culture)
        
        # Generate insights
        cultural_insights = {
            "overall_fit_score": fit_score,
            "fit_level": "High" if fit_score > 75 else "Medium" if fit_score > 50 else "Low",
            "value_alignment": self._assess_value_alignment(cultural_scores, target_culture),
            "potential_challenges": self._identify_cultural_challenges(cultural_scores, target_culture),
            "adaptation_recommendations": self._generate_adaptation_recommendations(cultural_scores, target_culture),
            "cultural_dimensions": cultural_scores,
            "target_culture": target_culture
        }
        
        return cultural_insights

    async def _assess_team_compatibility(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Assess team compatibility and role preferences"""
        team_scores = {
            "belbin_roles": {},
            "collaboration_style": {},
            "conflict_resolution": {},
            "communication_preference": {}
        }
        
        # Calculate Belbin team role preferences
        belbin_weights = {
            "plant": 0,      # Creative, imaginative, generates ideas
            "resource_investigator": 0,  # Outgoing, explores opportunities
            "coordinator": 0,    # Mature, confident, clarifies goals
            "shaper": 0,        # Challenging, dynamic, thrives on pressure
            "monitor_evaluator": 0,  # Sober, strategic, sees all options
            "teamworker": 0,    # Co-operative, mild, perceptive, diplomatic
            "implementer": 0,   # Disciplined, reliable, efficient
            "completer_finisher": 0,  # Painstaking, conscientious, perfectionist
            "specialist": 0     # Single-minded, dedicated, provides knowledge
        }
        
        # Process responses (simplified logic for demonstration)
        for question_id, response in responses.items():
            if "team" in question_id.lower():
                # Map responses to Belbin roles based on question content
                pass  # Implementation would map specific responses to role preferences
        
        # Generate team role recommendations
        preferred_roles = sorted(belbin_weights.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "preferred_team_roles": [{"role": role, "score": score, "description": self._get_belbin_description(role)} 
                                   for role, score in preferred_roles],
            "collaboration_style": self._determine_collaboration_style(responses),
            "team_dynamics_prediction": self._predict_team_dynamics(responses),
            "optimal_team_composition": self._suggest_team_composition(preferred_roles)
        }

    async def _assess_leadership_potential(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Assess leadership potential and style"""
        leadership_dimensions = {
            "visionary": 0,
            "coaching": 0,
            "affiliative": 0,
            "democratic": 0,
            "pacesetting": 0,
            "commanding": 0
        }
        
        # Calculate leadership scores based on responses
        # (Implementation would analyze responses for leadership indicators)
        
        overall_potential = np.mean(list(leadership_dimensions.values()))
        
        return {
            "leadership_potential_score": round(overall_potential, 1),
            "leadership_styles": leadership_dimensions,
            "dominant_style": max(leadership_dimensions.items(), key=lambda x: x[1])[0],
            "development_recommendations": self._generate_leadership_development_plan(leadership_dimensions),
            "situational_leadership": self._assess_situational_leadership(leadership_dimensions)
        }

    async def _assess_emotional_intelligence(self, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Assess emotional intelligence across four domains"""
        eq_domains = {
            "self_awareness": 0,
            "self_regulation": 0,
            "social_awareness": 0,
            "relationship_management": 0
        }
        
        # Process EQ responses
        for question_id, response in responses.items():
            if question_id.startswith("eq_"):
                question_data = next((q for q in COMPREHENSIVE_QUESTIONS["emotional_intelligence"] if q["id"] == question_id), None)
                if question_data and isinstance(response, int):
                    if 0 <= response < len(question_data["options"]):
                        weights = question_data["options"][response]["weight"]
                        for domain, weight in weights.items():
                            if domain in eq_domains:
                                eq_domains[domain] += weight
        
        overall_eq = np.mean(list(eq_domains.values()))
        
        return {
            "overall_eq_score": round(overall_eq, 1),
            "domain_scores": eq_domains,
            "eq_strengths": [domain for domain, score in eq_domains.items() if score > overall_eq],
            "development_areas": [domain for domain, score in eq_domains.items() if score < overall_eq],
            "workplace_implications": self._generate_eq_workplace_insights(eq_domains),
            "development_plan": self._create_eq_development_plan(eq_domains)
        }

    def _generate_overall_insights(self, profile: PersonalityProfile) -> Dict[str, Any]:
        """Generate comprehensive insights combining all assessments"""
        insights = {
            "personality_overview": "",
            "key_strengths": [],
            "potential_challenges": [],
            "ideal_work_environment": {},
            "career_recommendations": [],
            "development_priorities": [],
            "team_fit_analysis": {}
        }
        
        # Combine insights from different assessments
        if profile.mbti_profile:
            insights["personality_overview"] += f"MBTI Type: {profile.mbti_profile['type']}. "
        
        if profile.big_five_profile:
            big_five_strengths = profile.big_five_profile.get("strengths", [])
            insights["key_strengths"].extend(big_five_strengths)
        
        if profile.cultural_fit:
            fit_level = profile.cultural_fit.get("fit_level", "Unknown")
            insights["team_fit_analysis"]["cultural_fit"] = fit_level
        
        return insights

    def _generate_recommendations(self, profile: PersonalityProfile) -> List[str]:
        """Generate actionable recommendations based on complete profile"""
        recommendations = []
        
        # MBTI-based recommendations
        if profile.mbti_profile:
            mbti_type = profile.mbti_profile.get("type")
            recommendations.extend(self._get_mbti_recommendations(mbti_type))
        
        # Cultural fit recommendations
        if profile.cultural_fit:
            fit_score = profile.cultural_fit.get("overall_fit_score", 0)
            if fit_score < 60:
                recommendations.append("Consider cultural onboarding program to improve organizational fit")
        
        # Leadership development recommendations
        if profile.leadership_assessment:
            potential = profile.leadership_assessment.get("leadership_potential_score", 0)
            if potential > 70:
                recommendations.append("Consider for leadership development track")
        
        return recommendations

    # Helper methods (abbreviated for space - full implementation would include all)
    def _get_mbti_recommendations(self, mbti_type: str) -> List[str]:
        recommendations_map = {
            "INTJ": ["Provide autonomy and strategic projects", "Allow time for deep thinking"],
            "ENFP": ["Offer variety and creative challenges", "Provide mentoring opportunities"],
            # ... other types
        }
        return recommendations_map.get(mbti_type, [])

    def _calculate_culture_fit_score(self, cultural_scores: Dict, target_culture: Dict) -> float:
        """Calculate cultural fit score based on alignment"""
        # Simplified calculation - real implementation would be more sophisticated
        return np.random.uniform(60, 95)  # Placeholder

    def _get_belbin_description(self, role: str) -> str:
        descriptions = {
            "plant": "Creative problem solver who generates ideas",
            "coordinator": "Natural leader who coordinates team efforts",
            # ... other roles
        }
        return descriptions.get(role, "Team contributor")

    def _calculate_percentile(self, score: float, dimension: str) -> float:
        """Calculate percentile ranking for Big Five traits"""
        # Placeholder - real implementation would use normative data
        return np.random.uniform(10, 90)

    def _get_trait_level(self, score: float) -> str:
        """Determine trait level (Low, Medium, High)"""
        if score < 2.5:
            return "Low"
        elif score > 3.5:
            return "High"
        else:
            return "Medium"

# Initialize the assessment engine
assessment_engine = EnhancedPersonalityEngine()

# API Endpoints
@router.post("/comprehensive-assessment")
async def conduct_comprehensive_assessment(assessment: ComprehensiveAssessment):
    """Conduct comprehensive personality assessment"""
    try:
        profile = await assessment_engine.comprehensive_assessment(assessment)
        
        # Save to database/file
        await save_personality_profile(profile)
        
        return {
            "success": True,
            "candidate_id": assessment.candidate_id,
            "profile": profile.dict(),
            "message": "Comprehensive assessment completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Comprehensive assessment failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cultural-fit/{candidate_id}")
async def get_cultural_fit_analysis(candidate_id: int, company_culture: str = "innovative_startup"):
    """Get detailed cultural fit analysis for a candidate"""
    try:
        # Load candidate profile
        profile = await load_personality_profile(candidate_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Candidate profile not found")
        
        # Generate cultural fit report
        cultural_fit = profile.get("cultural_fit", {})
        
        return {
            "candidate_id": candidate_id,
            "cultural_fit_analysis": cultural_fit,
            "company_culture": company_culture,
            "recommendations": profile.get("recommendations", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/team-compatibility/{candidate_id}")
async def get_team_compatibility(candidate_id: int, team_profiles: Optional[List[int]] = None):
    """Get team compatibility analysis"""
    try:
        candidate_profile = await load_personality_profile(candidate_id)
        if not candidate_profile:
            raise HTTPException(status_code=404, detail="Candidate profile not found")
        
        compatibility_analysis = {
            "candidate_id": candidate_id,
            "team_roles": candidate_profile.get("team_compatibility", {}).get("preferred_team_roles", []),
            "collaboration_style": candidate_profile.get("team_compatibility", {}).get("collaboration_style", {}),
            "compatibility_scores": {},
            "team_dynamics_prediction": {}
        }
        
        if team_profiles:
            # Calculate compatibility with existing team members
            for team_member_id in team_profiles:
                member_profile = await load_personality_profile(team_member_id)
                if member_profile:
                    compatibility_score = calculate_compatibility_score(candidate_profile, member_profile)
                    compatibility_analysis["compatibility_scores"][team_member_id] = compatibility_score
        
        return compatibility_analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessment-questions/{assessment_type}")
async def get_assessment_questions(assessment_type: AssessmentType):
    """Get questions for specific assessment type"""
    try:
        questions = COMPREHENSIVE_QUESTIONS.get(assessment_type.value, [])
        return {
            "assessment_type": assessment_type,
            "questions": questions,
            "estimated_time": len(questions) * 2,  # 2 minutes per question
            "instructions": get_assessment_instructions(assessment_type)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/personality-insights")
async def get_personality_analytics():
    """Get comprehensive personality analytics across all candidates"""
    try:
        all_profiles = await load_all_personality_profiles()
        
        analytics = {
            "total_assessed": len(all_profiles),
            "mbti_distribution": calculate_mbti_distribution(all_profiles),
            "big_five_averages": calculate_big_five_averages(all_profiles),
            "cultural_fit_stats": calculate_cultural_fit_stats(all_profiles),
            "leadership_potential_distribution": calculate_leadership_distribution(all_profiles),
            "team_role_preferences": calculate_team_role_distribution(all_profiles),
            "insights": generate_organizational_insights(all_profiles)
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions (placeholder implementations)
async def save_personality_profile(profile: PersonalityProfile):
    """Save personality profile to storage"""
    # Implementation would save to database
    pass

async def load_personality_profile(candidate_id: int) -> Optional[Dict[str, Any]]:
    """Load personality profile from storage"""
    # Implementation would load from database
    return {}

async def load_all_personality_profiles() -> List[Dict[str, Any]]:
    """Load all personality profiles"""
    # Implementation would load from database
    return []

def calculate_compatibility_score(profile1: Dict, profile2: Dict) -> float:
    """Calculate compatibility score between two personality profiles"""
    # Implementation would calculate compatibility
    return np.random.uniform(0.5, 0.95)

def get_assessment_instructions(assessment_type: AssessmentType) -> str:
    """Get instructions for specific assessment type"""
    instructions_map = {
        AssessmentType.MBTI: "Answer based on your natural preferences and tendencies.",
        AssessmentType.BIG_FIVE: "Rate how much you agree with each statement.",
        AssessmentType.CULTURAL_FIT: "Consider your ideal work environment and values.",
        # ... other types
    }
    return instructions_map.get(assessment_type, "Answer honestly and authentically.")

def calculate_mbti_distribution(profiles: List[Dict]) -> Dict[str, int]:
    """Calculate MBTI distribution across profiles"""
    # Implementation would calculate actual distribution
    return {}

def calculate_big_five_averages(profiles: List[Dict]) -> Dict[str, float]:
    """Calculate Big Five averages across profiles"""
    # Implementation would calculate actual averages
    return {}

def calculate_cultural_fit_stats(profiles: List[Dict]) -> Dict[str, Any]:
    """Calculate cultural fit statistics"""
    # Implementation would calculate actual stats
    return {}

def calculate_leadership_distribution(profiles: List[Dict]) -> Dict[str, Any]:
    """Calculate leadership potential distribution"""
    # Implementation would calculate actual distribution
    return {}

def calculate_team_role_distribution(profiles: List[Dict]) -> Dict[str, Any]:
    """Calculate team role preferences distribution"""
    # Implementation would calculate actual distribution
    return {}

def generate_organizational_insights(profiles: List[Dict]) -> List[str]:
    """Generate insights about the organization's personality composition"""
    # Implementation would generate actual insights
    return ["Diverse personality types provide balanced perspectives"]
