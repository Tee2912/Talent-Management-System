from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import random
from pathlib import Path

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    candidate_id: int

class ChatResponse(BaseModel):
    response: str
    recommendation: Optional[str] = None
    confidence: float

def load_candidates():
    """Load candidates from JSON file"""
    candidates_file = Path(__file__).parent.parent / "candidates.json"
    try:
        with open(candidates_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def analyze_candidate_suitability(candidate: dict, query: str) -> dict:
    """Analyze candidate suitability based on their profile and query"""
    
    # Calculate basic scores
    resume_score = candidate.get('resumeScore', 0)
    interview_score = candidate.get('interview_score', 0)
    experience = candidate.get('experience', 0)
    skills = candidate.get('skills', [])
    
    # Calculate overall score
    if interview_score > 0:
        overall_score = (resume_score + interview_score) / 2
    else:
        overall_score = resume_score
    
    # Determine recommendation based on score and experience
    if overall_score >= 80 and experience >= 3:
        recommendation = "hire"
        confidence = min(0.95, overall_score / 100 + 0.1)
    elif overall_score >= 70 and experience >= 2:
        recommendation = "interview"
        confidence = min(0.85, overall_score / 100)
    elif overall_score >= 60:
        recommendation = "interview"
        confidence = min(0.75, overall_score / 100 - 0.1)
    else:
        recommendation = "not_hire"
        confidence = max(0.6, (100 - overall_score) / 100)
    
    return {
        "overall_score": overall_score,
        "recommendation": recommendation,
        "confidence": confidence,
        "experience": experience,
        "skills": skills
    }

def generate_ai_response(candidate: dict, query: str, analysis: dict) -> str:
    """Generate AI response based on candidate analysis and query"""
    
    name = candidate.get('name', 'Unknown')
    position = candidate.get('position', 'Unknown')
    education = candidate.get('education', 'Not specified')
    experience = analysis['experience']
    skills = analysis['skills']
    overall_score = analysis['overall_score']
    recommendation = analysis['recommendation']
    
    query_lower = query.lower()
    
    # Generate response based on query type
    if any(word in query_lower for word in ['suitable', 'hire', 'recommend', 'decision']):
        if recommendation == "hire":
            return f"""Based on my comprehensive analysis, **{name}** is an excellent candidate for the {position} role. 

**Key Strengths:**
• Strong overall performance score: {overall_score:.1f}/100
• {experience} years of relevant experience
• Solid educational background: {education}
• Relevant technical skills: {', '.join(skills[:3])}

**Recommendation: HIRE** ✅
This candidate demonstrates the technical competency and experience needed to excel in this role. Their profile suggests they can contribute immediately to your team."""

        elif recommendation == "interview":
            return f"""**{name}** shows potential for the {position} role, but I recommend further evaluation through interviews.

**Current Assessment:**
• Overall score: {overall_score:.1f}/100
• Experience: {experience} years
• Education: {education}
• Key skills: {', '.join(skills[:3])}

**Recommendation: PROCEED TO INTERVIEW** 🤔
Focus the interview on assessing their practical experience with {skills[-2:] if len(skills) >= 2 else skills} and their problem-solving abilities. This will help determine if they're ready for the role or need additional development."""

        else:
            return f"""After analyzing **{name}**'s profile, I have concerns about their current fit for the {position} role.

**Areas of Concern:**
• Overall score: {overall_score:.1f}/100 (below threshold)
• Limited experience: {experience} years
• Skill gaps in key areas required for the role

**Recommendation: NOT RECOMMENDED** ❌
I suggest looking for candidates with stronger backgrounds in {', '.join(skills[:2])} and more relevant experience. Consider this candidate for junior roles or after additional training."""

    elif any(word in query_lower for word in ['skills', 'technical', 'abilities', 'competencies']):
        skill_assessment = "strong" if len(skills) >= 5 else "adequate" if len(skills) >= 3 else "limited"
        return f"""**{name}**'s Technical Skills Assessment:

**Core Competencies:**
{chr(10).join([f'• {skill}' for skill in skills])}

**Skills Analysis:**
• Skill diversity: {skill_assessment} ({len(skills)} documented skills)
• Technical depth: {'High' if overall_score > 75 else 'Medium' if overall_score > 60 else 'Developing'}
• Role alignment: {'Excellent' if len(skills) >= 5 else 'Good' if len(skills) >= 3 else 'Needs improvement'}

The candidate's technical skill set {'aligns well' if len(skills) >= 4 else 'partially aligns'} with typical {position} requirements."""

    elif any(word in query_lower for word in ['experience', 'background', 'work history', 'career']):
        exp_level = "Senior" if experience >= 5 else "Mid-level" if experience >= 2 else "Junior"
        return f"""**{name}**'s Professional Background:

**Experience Overview:**
• Years of experience: {experience} years ({exp_level} level)
• Educational background: {education}
• Career trajectory: {'Strong progression' if overall_score > 70 else 'Steady development'}

**Experience Assessment:**
{f'With {experience} years of experience, this candidate has the depth needed for senior responsibilities and complex projects.' if experience >= 5 else f'With {experience} years of experience, this candidate is well-suited for {"mid-level responsibilities with growth potential" if experience >= 2 else "entry to mid-level roles with proper mentoring"}.'} Their background in {education} provides a solid foundation for the technical requirements of the role."""

    elif any(word in query_lower for word in ['concerns', 'weaknesses', 'risks', 'problems', 'issues']):
        concerns = []
        if experience < 2:
            concerns.append("Limited professional experience (under 2 years)")
        if overall_score < 70:
            concerns.append(f"Below-average assessment score ({overall_score:.1f}/100)")
        if len(skills) < 4:
            concerns.append("Limited skill diversity documented")
        if not candidate.get('interview_score'):
            concerns.append("No interview assessment completed yet")
        
        if concerns:
            return f"""**Potential Concerns for {name}:**

**Risk Areas Identified:**
{chr(10).join([f'• {concern}' for concern in concerns])}

**Mitigation Strategies:**
• Conduct thorough technical interviews to validate skills
• Consider structured onboarding program if hired
• Assess cultural fit and learning agility
• Verify practical experience through portfolio review

These concerns should be carefully evaluated during the selection process."""
        else:
            return f"**{name}** presents a strong profile with minimal concerns. They appear to be a well-qualified candidate with {experience} years of experience and a solid skill set."

    elif any(word in query_lower for word in ['personality', 'culture', 'fit', 'team']):
        personality = candidate.get('personality_type', 'Not assessed')
        return f"""**{name}**'s Cultural and Team Fit Assessment:

**Personality Profile:** {personality}
**Team Integration Potential:** {'High' if overall_score > 75 else 'Medium' if overall_score > 60 else 'Requires evaluation'}

{f'Based on their {personality} personality type, this candidate typically brings strong analytical and collaborative abilities to teams.' if personality != 'Not assessed' else 'A personality assessment would provide valuable insights into their work style and team dynamics.'} 

Their experience level suggests they can {'mentor junior team members and lead technical initiatives' if experience >= 5 else 'work effectively within established team structures' if experience >= 2 else 'benefit from strong mentorship and structured team integration'}."""

    else:
        # Default comprehensive overview
        return f"""**Comprehensive Analysis for {name}:**

**Role:** {position}
**Overall Assessment Score:** {overall_score:.1f}/100
**Experience:** {experience} years
**Education:** {education}

**Key Strengths:**
• {', '.join(skills[:3]) if skills else 'Skills assessment needed'}
• {'Strong' if overall_score > 75 else 'Adequate' if overall_score > 60 else 'Developing'} technical foundation
• {'Senior' if experience >= 5 else 'Mid' if experience >= 2 else 'Entry'}-level experience

**Bottom Line:** {f'Strong candidate - recommend moving forward' if recommendation == 'hire' else f'Potential candidate - needs interview evaluation' if recommendation == 'interview' else 'Below current requirements - consider other candidates'}

Feel free to ask specific questions about their skills, experience, suitability, or any concerns you might have!"""

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(message: ChatMessage):
    """Process chat message and return AI response about candidate suitability"""
    
    try:
        candidates = load_candidates()
        
        # Find the candidate
        candidate = next((c for c in candidates if c.get('id') == message.candidate_id), None)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Analyze candidate
        analysis = analyze_candidate_suitability(candidate, message.message)
        
        # Generate AI response
        ai_response = generate_ai_response(candidate, message.message, analysis)
        
        return ChatResponse(
            response=ai_response,
            recommendation=analysis['recommendation'],
            confidence=analysis['confidence']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")

@router.get("/candidates/{candidate_id}/analysis")
async def get_candidate_analysis(candidate_id: int):
    """Get detailed analysis for a specific candidate"""
    
    try:
        candidates = load_candidates()
        candidate = next((c for c in candidates if c.get('id') == candidate_id), None)
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        analysis = analyze_candidate_suitability(candidate, "comprehensive analysis")
        
        return {
            "candidate_id": candidate_id,
            "candidate_name": candidate.get('name'),
            "position": candidate.get('position'),
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing candidate: {str(e)}")
