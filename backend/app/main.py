from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import candidates, analytics, bias_detection, personality, interviews, advanced_analytics, notifications, reports, feedback, calendar_integration, resume_analyzer, ai_copilot, enhanced_personality
from app.config import settings

app = FastAPI(
    title="HireIQ Pro - Smart Hiring System API",
    description="AI-powered bias detection and intelligent hiring platform with LangChain, Langfuse, and n8n integration",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(candidates.router, prefix="/api/v1/candidates", tags=["candidates"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(advanced_analytics.router, tags=["advanced-analytics"])
app.include_router(bias_detection.router, prefix="/api/bias-detection", tags=["bias-detection"])
app.include_router(personality.router, prefix="/api/v1/personality", tags=["personality"])
app.include_router(enhanced_personality.router, prefix="/api/personality", tags=["enhanced-personality"])
app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["feedback"])
app.include_router(calendar_integration.router, prefix="/api/v1/calendar", tags=["calendar"])
app.include_router(resume_analyzer.router, prefix="/api/v1/resume", tags=["resume-analyzer"])
app.include_router(ai_copilot.router, prefix="/api/v1/ai-copilot", tags=["ai-copilot", "smart-features"])

@app.get("/")
async def root():
    return {
        "message": "HireIQ Pro - Smart Hiring System API", 
        "version": "2.0.0",
        "features": [
            "AI-Powered Resume Analysis",
            "Real-time Bias Detection", 
            "Intelligent Candidate Matching",
            "Automated Workflow Processing",
            "Predictive Hiring Analytics",
            "Smart Interview Question Generation",
            "LangChain Integration",
            "Langfuse Observability",
            "n8n Workflow Automation"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ai_services": "operational",
        "smart_features": "enabled",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
