from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import candidates, analytics, bias_detection, personality, chat, interviews
from app.config import settings

app = FastAPI(
    title="Fair Hiring System API",
    description="API for bias detection and fair hiring processes",
    version="1.0.0"
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
app.include_router(bias_detection.router, prefix="/api/v1/bias", tags=["bias-detection"])
app.include_router(personality.router, prefix="/api/v1/personality", tags=["personality"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["ai-chat"])
app.include_router(interviews.router, prefix="/api/v1/interviews", tags=["interviews"])

@app.get("/")
async def root():
    return {"message": "Fair Hiring System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
