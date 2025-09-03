"""
Simple FastAPI App for AI Copilot Demo
Runs in mock mode by default, no external dependencies required
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
    from typing import Optional, List, Dict, Any
    import uvicorn
    import json
    import asyncio
    from datetime import datetime
    
    print("✅ FastAPI dependencies available")
    FASTAPI_AVAILABLE = True
except ImportError as e:
    print(f"❌ FastAPI not available: {e}")
    print("Please install dependencies: pip install fastapi uvicorn")
    FASTAPI_AVAILABLE = False

# Mock AI Service for when dependencies are missing
class SimpleMockAI:
    def __init__(self):
        self.responses = {
            "hello": "Hello! I'm your AI Assistant for HireIQ Pro. I can help you with intelligent candidate analysis, bias detection, predictive hiring insights, workflow automation, and candidate conversations. What would you like to explore?",
            "candidate": "Based on my analysis of Sarah Johnson:\n\n✅ **Technical Skills**: Strong proficiency in React, TypeScript, Node.js\n✅ **Experience Level**: 8 years of relevant experience\n✅ **Achievement Record**: Demonstrated success in previous roles\n✅ **Cultural Indicators**: Shows alignment with team values\n\nRecommended next steps:\n• Schedule technical deep-dive interview\n• Check references for leadership examples\n• Assess project management capabilities",
            "bias": "I've analyzed the text for potential bias indicators:\n\n**Bias Assessment: High**\n\n⚠️ Multiple bias indicators detected. Immediate review recommended.\n\n**Recommendations:**\n• Use objective, skill-based language\n• Focus on job-relevant qualifications\n• Avoid subjective descriptors\n\n**Revised Language Suggestions:**\nConsider rephrasing to focus on specific achievements and measurable skills.",
            "automation": "I've successfully triggered the Candidate Screening workflow!\n\n**Workflow Details:**\n• Workflow ID: WF-CANDIDATE_SCREENING-1234\n• Status: Initiated\n• Estimated completion: 15-30 minutes\n• AI Enhancement: Active\n\n**Automated Steps:**\n• Resume analysis\n• Skill extraction\n• Bias check\n• Initial scoring\n• Recruiter notification\n\n**Next Actions:**\n• Monitor progress in workflow dashboard\n• Review results when complete\n• Manual intervention available if needed"
        }
    
    def get_response(self, query: str) -> str:
        query_lower = query.lower()
        if "hello" in query_lower or "help" in query_lower:
            return self.responses["hello"]
        elif "candidate" in query_lower or "sarah" in query_lower or "analyze" in query_lower:
            return self.responses["candidate"]
        elif "bias" in query_lower or "young" in query_lower or "energetic" in query_lower:
            return self.responses["bias"]
        elif "automate" in query_lower or "workflow" in query_lower or "screening" in query_lower:
            return self.responses["automation"]
        else:
            return f"I understand you're asking about: '{query}'\n\nI can help with:\n• Candidate analysis and recommendations\n• Bias detection and fair hiring practices\n• Interview question generation\n• Hiring success predictions\n• Workflow automation setup\n\nCould you be more specific about what aspect you'd like help with?"

if FASTAPI_AVAILABLE:
    # Create FastAPI app
    app = FastAPI(title="HireIQ Pro AI Copilot", version="1.0.0")
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify actual origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize mock AI
    mock_ai = SimpleMockAI()
    
    # Pydantic models
    class ChatRequest(BaseModel):
        query: str
        context: Optional[str] = "general"
        candidate_id: Optional[str] = None
        job_id: Optional[int] = None
    
    class ChatResponse(BaseModel):
        response: str
        confidence: float = 0.85
        source: str = "AI Mock Assistant"
        context_used: str = "mock_mode"
        recommendations: List[Dict[str, Any]] = []
        mock_mode: bool = True
    
    @app.get("/")
    async def root():
        return {
            "message": "HireIQ Pro AI Copilot API",
            "status": "running",
            "mode": "mock",
            "version": "1.0.0",
            "endpoints": {
                "chat": "/api/v1/ai-copilot/chat",
                "insights": "/api/v1/ai-copilot/ai-insights/dashboard",
                "health": "/health"
            }
        }
    
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "mode": "mock",
            "dependencies": {
                "fastapi": "available",
                "mock_ai": "active"
            }
        }
    
    @app.post("/api/v1/ai-copilot/chat", response_model=ChatResponse)
    async def chat_with_ai(request: ChatRequest):
        """Chat with AI Copilot (Mock Mode)"""
        try:
            # Simulate AI thinking time
            await asyncio.sleep(1)
            
            # Get mock response
            ai_response = mock_ai.get_response(request.query)
            
            # Generate mock recommendations
            recommendations = [
                {
                    "type": "general",
                    "title": "Continue Conversation",
                    "description": "Ask follow-up questions or try different scenarios",
                    "confidence": 0.8,
                    "action_items": ["Ask about specific candidates", "Test bias detection", "Explore automation"],
                    "priority": "medium"
                }
            ]
            
            return ChatResponse(
                response=ai_response,
                confidence=0.85,
                source="AI Mock Assistant",
                context_used=request.context or "general",
                recommendations=recommendations,
                mock_mode=True
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")
    
    @app.get("/api/v1/ai-copilot/ai-insights/dashboard")
    async def get_ai_insights():
        """Get AI insights dashboard (Mock Mode)"""
        return {
            "success": True,
            "ai_insights": {
                "hiring_velocity": {
                    "current_rate": "2.3x faster",
                    "ai_contribution": "65% automation",
                    "trend": "increasing"
                },
                "quality_metrics": {
                    "candidate_match_accuracy": 94.5,
                    "bias_reduction": "78% improvement",
                    "interview_efficiency": "45% time saved"
                },
                "predictive_analytics": {
                    "next_quarter_hiring_needs": 12,
                    "success_probability_average": 87.2,
                    "retention_prediction": "92% likely to stay 2+ years"
                },
                "recommendations": [
                    "Focus on senior-level positions for Q4",
                    "Expand technical screening for data science roles",
                    "Implement bias training for interview panels",
                    "Automate reference checks for faster processing"
                ],
                "alerts": [
                    {
                        "type": "success",
                        "message": "Sarah Johnson analysis complete - 95% match",
                        "priority": "high",
                        "action": "Schedule technical interview"
                    },
                    {
                        "type": "warning",
                        "message": "Potential bias detected in 3 job descriptions",
                        "priority": "medium",
                        "action": "Review and update language"
                    },
                    {
                        "type": "info",
                        "message": "Workflow automation saved 12 hours this week",
                        "priority": "low",
                        "action": "Review efficiency metrics"
                    }
                ]
            },
            "mock_mode": True
        }

def run_server():
    """Run the AI Copilot server"""
    if not FASTAPI_AVAILABLE:
        print("❌ Cannot start server - FastAPI dependencies missing")
        print("Please install: pip install fastapi uvicorn")
        return
    
    print("🚀 Starting HireIQ Pro AI Copilot Server (Mock Mode)")
    print("📍 Server will be available at: http://localhost:8000")
    print("📍 API Documentation: http://localhost:8000/docs")
    print("📍 Health Check: http://localhost:8000/health")
    print("🎭 Mock Mode: Realistic AI responses without API keys")
    print("\n" + "="*60)
    
    try:
        uvicorn.run(
            "simple_ai_server:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        print("\nTry running manually: uvicorn simple_ai_server:app --reload --host 0.0.0.0 --port 8000")

if __name__ == "__main__":
    print("🤖 HireIQ Pro AI Copilot - Simple Server")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Test mode - just verify imports and mock AI
        print("🧪 Running in test mode...")
        mock_ai = SimpleMockAI()
        test_queries = [
            "Hello, can you help me?",
            "Can you analyze Sarah Johnson?", 
            "Check this for bias: young energetic",
            "Help me automate screening"
        ]
        
        for query in test_queries:
            print(f"\n👤 User: {query}")
            response = mock_ai.get_response(query)
            print(f"🤖 AI: {response[:100]}...")
        
        print("\n✅ Mock AI system working correctly!")
    else:
        # Normal mode - start server
        run_server()
