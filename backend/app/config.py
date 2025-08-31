from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    database_url: str = "sqlite:///./fair_hiring.db"
    
    # Security
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: list = ["http://localhost:3000"]
    
    # ML Model settings
    bias_threshold: float = 0.7
    fairness_metrics: list = ["demographic_parity", "equalized_odds", "calibration"]
    
    # Azure OpenAI settings
    azure_openai_endpoint: str = "https://genai-nexus.int.api.corpinter.net/apikey/"
    azure_openai_api_key: str = "your-api-key-here"
    azure_openai_api_version: str = "2023-12-01-preview"
    azure_openai_model: str = "gpt-4o"
    
    # Application
    debug: bool = True
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
