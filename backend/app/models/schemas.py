from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class EthnicityEnum(str, Enum):
    WHITE = "white"
    BLACK = "black"
    HISPANIC = "hispanic"
    ASIAN = "asian"
    NATIVE_AMERICAN = "native_american"
    PACIFIC_ISLANDER = "pacific_islander"
    MIXED = "mixed"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class CandidateBase(BaseModel):
    """Base candidate model"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    position_applied: str = Field(..., min_length=1, max_length=200)
    experience_years: int = Field(..., ge=0, le=50)
    education_level: str = Field(..., min_length=1, max_length=100)
    skills: List[str] = Field(default_factory=list)
    
    # Demographic information (optional for bias analysis)
    gender: Optional[GenderEnum] = None
    ethnicity: Optional[EthnicityEnum] = None
    age: Optional[int] = Field(None, ge=18, le=100)

class CandidateCreate(CandidateBase):
    """Create candidate model"""
    pass

class CandidateUpdate(BaseModel):
    """Update candidate model"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    position_applied: Optional[str] = Field(None, min_length=1, max_length=200)
    experience_years: Optional[int] = Field(None, ge=0, le=50)
    education_level: Optional[str] = Field(None, min_length=1, max_length=100)
    skills: Optional[List[str]] = None
    gender: Optional[GenderEnum] = None
    ethnicity: Optional[EthnicityEnum] = None
    age: Optional[int] = Field(None, ge=18, le=100)

class Candidate(CandidateBase):
    """Complete candidate model with DB fields"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool = True
    
    # Hiring process fields
    resume_score: Optional[float] = Field(None, ge=0, le=100)
    interview_score: Optional[float] = Field(None, ge=0, le=100)
    technical_score: Optional[float] = Field(None, ge=0, le=100)
    final_score: Optional[float] = Field(None, ge=0, le=100)
    hiring_decision: Optional[str] = None
    bias_score: Optional[float] = Field(None, ge=0, le=1)
    fairness_metrics: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class BiasAnalysisRequest(BaseModel):
    """Request model for bias analysis"""
    candidate_ids: List[int]
    position: Optional[str] = None
    department: Optional[str] = None

class BiasAnalysisResult(BaseModel):
    """Result model for bias analysis"""
    overall_bias_score: float = Field(..., ge=0, le=1)
    demographic_bias: Dict[str, float]
    fairness_metrics: Dict[str, float]
    recommendations: List[str]
    flagged_decisions: List[int]  # Candidate IDs with potential bias

class FairnessMetrics(BaseModel):
    """Fairness metrics model"""
    demographic_parity: float
    equalized_odds: float
    calibration: float
    statistical_parity: float
