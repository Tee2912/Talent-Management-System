"""
Test script for AI Copilot Integration
Tests LangChain, Langfuse, and n8n integration
"""

import asyncio
import os
import sys
import json
from typing import Dict, Any

# Add the backend path to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.ai_orchestrator import AIOrchestrator
from backend.services.n8n_client import N8NWorkflowClient

async def test_ai_orchestrator():
    """Test AI Orchestrator functionality"""
    print("🤖 Testing AI Orchestrator...")
    
    # Initialize orchestrator
    orchestrator = AIOrchestrator(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        langfuse_secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        langfuse_public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        n8n_webhook_url=os.getenv("N8N_WEBHOOK_URL"),
        n8n_api_key=os.getenv("N8N_API_KEY")
    )
    
    # Test 1: General intelligence query
    print("\n📝 Test 1: General Intelligence Query")
    try:
        response = await orchestrator.general_intelligence_query(
            "What are the best practices for bias-free hiring?",
            "general"
        )
        print("✅ General query successful")
        print(f"Response: {response.get('summary', 'No summary')[:100]}...")
    except Exception as e:
        print(f"❌ General query failed: {e}")
    
    # Test 2: Candidate analysis
    print("\n👤 Test 2: Candidate Analysis")
    try:
        response = await orchestrator.analyze_candidate_intelligence(
            candidate_id=1,
            query="Analyze this candidate's technical skills and cultural fit"
        )
        print("✅ Candidate analysis successful")
        print(f"Analysis: {response.get('summary', 'No summary')[:100]}...")
    except Exception as e:
        print(f"❌ Candidate analysis failed: {e}")
    
    # Test 3: Resume analysis
    print("\n📄 Test 3: Resume Analysis")
    try:
        sample_resume = """
        John Doe
        Senior Software Engineer
        
        Experience:
        - 5 years Python development
        - React and Node.js expertise
        - Led team of 3 developers
        
        Skills: Python, React, Node.js, AWS, Docker
        Education: BS Computer Science
        """
        
        job_desc = {
            "title": "Senior Python Developer",
            "requirements": ["Python", "React", "Leadership experience"],
            "experience": "5+ years"
        }
        
        response = await orchestrator.analyze_resume_intelligence(sample_resume, job_desc)
        print("✅ Resume analysis successful")
        print(f"Score: {response.get('overall_score', 'N/A')}")
    except Exception as e:
        print(f"❌ Resume analysis failed: {e}")
    
    # Test 4: Bias detection
    print("\n🛡️ Test 4: Bias Detection")
    try:
        bias_text = "This candidate seems young and energetic, perfect cultural fit for our team."
        response = await orchestrator.detect_real_time_bias(bias_text, "evaluation")
        print("✅ Bias detection successful")
        print(f"Bias detected: {response.get('bias_detected', 'Unknown')}")
        print(f"Risk level: {response.get('risk_level', 'Unknown')}")
    except Exception as e:
        print(f"❌ Bias detection failed: {e}")
    
    # Test 5: AI insights
    print("\n📊 Test 5: AI System Insights")
    try:
        insights = orchestrator.get_ai_insights()
        print("✅ AI insights successful")
        print(f"LangChain available: {insights['system_status']['langchain_available']}")
        print(f"LLM configured: {insights['system_status']['llm_configured']}")
        print(f"Langfuse available: {insights['system_status']['langfuse_available']}")
        print(f"n8n available: {insights['system_status']['n8n_available']}")
    except Exception as e:
        print(f"❌ AI insights failed: {e}")

async def test_n8n_client():
    """Test n8n workflow client"""
    print("\n🔄 Testing n8n Workflow Client...")
    
    client = N8NWorkflowClient(
        webhook_url=os.getenv("N8N_WEBHOOK_URL"),
        api_key=os.getenv("N8N_API_KEY")
    )
    
    # Test 1: Available workflows
    print("\n📋 Test 1: Available Workflows")
    try:
        workflows = client.get_available_workflows()
        print("✅ Workflow list retrieved")
        print(f"Available workflows: {len(workflows)}")
        for workflow in workflows:
            print(f"  - {workflow['name']}: {workflow['description']}")
    except Exception as e:
        print(f"❌ Workflow list failed: {e}")
    
    # Test 2: Trigger candidate screening workflow
    print("\n🔍 Test 2: Candidate Screening Workflow")
    try:
        test_candidate = {
            "id": 123,
            "name": "Jane Smith",
            "resume_text": "Experienced Python developer with 5 years...",
            "job_id": 1,
            "priority": "normal"
        }
        
        response = await client.trigger_candidate_screening(test_candidate)
        print("✅ Candidate screening workflow triggered")
        print(f"Workflow ID: {response.get('workflow_id', 'N/A')}")
        print(f"Status: {response.get('status', 'Unknown')}")
        print(f"Mock mode: {response.get('mock_mode', False)}")
    except Exception as e:
        print(f"❌ Candidate screening workflow failed: {e}")
    
    # Test 3: Trigger interview scheduling workflow
    print("\n📅 Test 3: Interview Scheduling Workflow")
    try:
        test_interview = {
            "candidate_id": 123,
            "candidate_email": "jane.smith@email.com",
            "interviewer_ids": [1, 2],
            "interview_type": "technical",
            "duration": 60
        }
        
        response = await client.trigger_interview_scheduling(test_interview)
        print("✅ Interview scheduling workflow triggered")
        print(f"Workflow ID: {response.get('workflow_id', 'N/A')}")
        print(f"Status: {response.get('status', 'Unknown')}")
    except Exception as e:
        print(f"❌ Interview scheduling workflow failed: {e}")

async def test_integration():
    """Test full integration"""
    print("\n🔗 Testing Full Integration...")
    
    orchestrator = AIOrchestrator(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        langfuse_secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
        langfuse_public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
        n8n_webhook_url=os.getenv("N8N_WEBHOOK_URL"),
        n8n_api_key=os.getenv("N8N_API_KEY")
    )
    
    # Test workflow automation with AI enhancement
    print("\n⚙️ Test: Workflow Automation with AI Enhancement")
    try:
        context = {
            "candidate_id": 123,
            "resume_text": "Python developer with React experience...",
            "job_description": {
                "title": "Full Stack Developer",
                "requirements": ["Python", "React", "5+ years experience"]
            }
        }
        
        response = await orchestrator.trigger_workflow_automation(
            "candidate_screening", 
            context
        )
        print("✅ AI-enhanced workflow automation successful")
        print(f"Success: {response.get('success', False)}")
        print(f"AI Enhanced: {response.get('ai_enhanced', False)}")
        print(f"Workflow ID: {response.get('workflow_id', 'N/A')}")
    except Exception as e:
        print(f"❌ AI-enhanced workflow automation failed: {e}")
    
    # Test workflow insights
    print("\n📈 Test: Workflow Insights")
    try:
        insights = await orchestrator.get_workflow_insights()
        print("✅ Workflow insights retrieved")
        print(f"Automation enabled: {insights.get('automation_enabled', False)}")
        if insights.get('workflow_details'):
            print(f"Available workflows: {len(insights['workflow_details'])}")
    except Exception as e:
        print(f"❌ Workflow insights failed: {e}")

def check_environment():
    """Check environment configuration"""
    print("🔧 Checking Environment Configuration...")
    
    required_vars = [
        "OPENAI_API_KEY",
        "LANGFUSE_SECRET_KEY", 
        "LANGFUSE_PUBLIC_KEY"
    ]
    
    optional_vars = [
        "N8N_WEBHOOK_URL",
        "N8N_API_KEY"
    ]
    
    print("\nRequired environment variables:")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * 10}...{value[-4:] if len(value) > 10 else value}")
        else:
            print(f"❌ {var}: Not set")
    
    print("\nOptional environment variables:")
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * 10}...{value[-10:] if len(value) > 15 else value}")
        else:
            print(f"⚠️ {var}: Not set (will use mock mode)")

async def main():
    """Main test function"""
    print("🚀 HireIQ Pro AI Copilot Integration Test")
    print("=" * 50)
    
    # Check environment
    check_environment()
    
    # Run tests
    await test_ai_orchestrator()
    await test_n8n_client()
    await test_integration()
    
    print("\n" + "=" * 50)
    print("🎉 AI Copilot Integration Test Complete!")
    print("\nNext steps:")
    print("1. Set up your API keys in .env file")
    print("2. Start the backend server: uvicorn app.main:app --reload")
    print("3. Start the frontend: npm start")
    print("4. Test the AI Copilot in the web interface")

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))
    
    asyncio.run(main())
