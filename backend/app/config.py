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
    
    # OpenAI settings for AI Copilot
    openai_api_key: Optional[str] = None
    openai_org_id: Optional[str] = None
    
    # Langfuse settings for AI observability
    langfuse_secret_key: Optional[str] = None
    langfuse_public_key: Optional[str] = None
    langfuse_host: str = "https://cloud.langfuse.com"
    
    # n8n workflow automation settings
    n8n_webhook_url: Optional[str] = None
    n8n_api_key: Optional[str] = None
    n8n_base_url: str = "https://app.n8n.cloud"
    
    # Application settings
    debug: bool = True
    log_level: str = "INFO"
    environment: str = "development"
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"
    
    # Cache settings
    redis_url: str = "redis://localhost:6379/0"
    
    # Monitoring
    enable_metrics: bool = True
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields without validation errors

settings = Settings()
