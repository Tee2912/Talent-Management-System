from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
import tempfile
import aiofiles
from pathlib import Path
from openai import AzureOpenAI
import PyPDF2
from io import BytesIO
from ..config import settings

router = APIRouter()

class ResumeAnalysisRequest(BaseModel):
    position_title: str
    resume_text: Optional[str] = None

class SkillMatch(BaseModel):
    skill: str
    mentioned: bool
    context: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    overall_score: float
    position_match: str
    matched_skills: List[SkillMatch]
    missing_skills: List[str]
    experience_assessment: str
    education_match: str
    recommendations: List[str]
    detailed_analysis: str
    confidence_score: float

def load_job_descriptions() -> List[Dict[str, Any]]:
    """Load job descriptions from JSON file"""
    job_desc_file = Path(__file__).parent.parent.parent / "job_description_full.json"
    try:
        with open(job_desc_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Job descriptions file not found")

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

def get_job_description_by_title(position_title: str, job_descriptions: List[Dict]) -> Optional[Dict]:
    """Find job description by position title"""
    for job in job_descriptions:
        if job.get("PositionTitle", "").lower() == position_title.lower():
            return job
    return None

async def analyze_resume_with_azure_openai(resume_text: str, job_description: Dict) -> Dict[str, Any]:
    """Analyze resume against job description using Azure OpenAI"""
    
    if not settings.azure_openai_api_key:
        raise HTTPException(status_code=500, detail="Azure OpenAI API key not configured")
    
    try:
        client = AzureOpenAI(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
        )
        
        # Prepare job description context
        job_context = f"""
        Position: {job_description.get('PositionTitle', '')}
        Core Skills: {', '.join(job_description.get('CoreSkills', []))}
        Technical Skills: {job_description.get('TechnicalSkills', {})}
        Minimum Experience: {job_description.get('QualificationExperience', {}).get('MinimumExperienceYears', 'Not specified')} years
        Education Requirements: {job_description.get('QualificationsExperience', {}).get('DegreeRequirements', [])}
        Specific Knowledge & Skills: {job_description.get('SpecificKnowledgeSkill', [])}
        """
        
        system_prompt = """You are an expert resume analyzer and HR consultant. Your task is to analyze a candidate's resume against a specific job description and provide a comprehensive assessment.

Please analyze the resume and provide a JSON response with the following structure:
{
    "overall_score": <float between 0-100>,
    "position_match": "<excellent/good/fair/poor>",
    "matched_skills": [
        {
            "skill": "<skill name>",
            "mentioned": true/false,
            "context": "<where/how it's mentioned in resume>"
        }
    ],
    "missing_skills": ["<list of important skills not found>"],
    "experience_assessment": "<detailed assessment of work experience>",
    "education_match": "<assessment of educational background>",
    "recommendations": ["<list of specific recommendations>"],
    "detailed_analysis": "<comprehensive analysis paragraph>",
    "confidence_score": <float between 0-1>
}

Focus on:
1. Technical skill matches
2. Experience level and relevance
3. Educational background alignment
4. Overall suitability for the role
5. Areas for improvement
"""

        user_prompt = f"""
        Job Description:
        {job_context}
        
        Resume Content:
        {resume_text}
        
        Please analyze this resume against the job requirements and provide a detailed assessment in the specified JSON format.
        """

        response = client.chat.completions.create(
            model=settings.azure_openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Parse the response
        analysis_text = response.choices[0].message.content
        
        # Try to extract JSON from the response
        try:
            # Find JSON content in the response
            start_idx = analysis_text.find('{')
            end_idx = analysis_text.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = analysis_text[start_idx:end_idx]
                analysis_result = json.loads(json_str)
            else:
                # Fallback: create structured response
                analysis_result = {
                    "overall_score": 75.0,
                    "position_match": "good",
                    "matched_skills": [],
                    "missing_skills": [],
                    "experience_assessment": "Assessment pending",
                    "education_match": "Assessment pending",
                    "recommendations": ["Manual review recommended"],
                    "detailed_analysis": analysis_text,
                    "confidence_score": 0.7
                }
        except json.JSONDecodeError:
            # Fallback response
            analysis_result = {
                "overall_score": 75.0,
                "position_match": "good",
                "matched_skills": [],
                "missing_skills": [],
                "experience_assessment": "Assessment pending",
                "education_match": "Assessment pending", 
                "recommendations": ["Manual review recommended"],
                "detailed_analysis": analysis_text,
                "confidence_score": 0.7
            }
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume with Azure OpenAI: {str(e)}")

@router.post("/upload-resume", response_model=ResumeAnalysisResponse)
async def analyze_uploaded_resume(
    position_title: str = Form(...),
    resume_file: UploadFile = File(...)
):
    """Upload and analyze a resume file against a job description"""
    
    # Validate file type
    if resume_file.content_type not in ["application/pdf", "text/plain"]:
        raise HTTPException(status_code=400, detail="Only PDF and text files are supported")
    
    try:
        # Read file content
        content = await resume_file.read()
        
        # Extract text based on file type
        if resume_file.content_type == "application/pdf":
            resume_text = extract_text_from_pdf(content)
        else:
            resume_text = content.decode('utf-8')
        
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="No text content found in the uploaded file")
        
        # Load job descriptions
        job_descriptions = load_job_descriptions()
        
        # Find matching job description
        job_description = get_job_description_by_title(position_title, job_descriptions)
        if not job_description:
            raise HTTPException(status_code=404, detail=f"Job description not found for position: {position_title}")
        
        # Analyze resume with Azure OpenAI
        analysis_result = await analyze_resume_with_azure_openai(resume_text, job_description)
        
        return ResumeAnalysisResponse(**analysis_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@router.post("/analyze-text", response_model=ResumeAnalysisResponse)
async def analyze_resume_text(request: ResumeAnalysisRequest):
    """Analyze resume text against a job description"""
    
    if not request.resume_text:
        raise HTTPException(status_code=400, detail="Resume text is required")
    
    try:
        # Load job descriptions
        job_descriptions = load_job_descriptions()
        
        # Find matching job description
        job_description = get_job_description_by_title(request.position_title, job_descriptions)
        if not job_description:
            raise HTTPException(status_code=404, detail=f"Job description not found for position: {request.position_title}")
        
        # Analyze resume with Azure OpenAI
        analysis_result = await analyze_resume_with_azure_openai(request.resume_text, job_description)
        
        return ResumeAnalysisResponse(**analysis_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")

@router.get("/available-positions")
async def get_available_positions():
    """Get list of available job positions"""
    try:
        job_descriptions = load_job_descriptions()
        positions = [{"title": job.get("PositionTitle", ""), "core_skills": job.get("CoreSkills", [])} 
                    for job in job_descriptions]
        return {"positions": positions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching positions: {str(e)}")

@router.get("/job-description/{position_title}")
async def get_job_description(position_title: str):
    """Get detailed job description for a specific position"""
    try:
        job_descriptions = load_job_descriptions()
        job_description = get_job_description_by_title(position_title, job_descriptions)
        
        if not job_description:
            raise HTTPException(status_code=404, detail=f"Job description not found for position: {position_title}")
        
        return job_description
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching job description: {str(e)}")
