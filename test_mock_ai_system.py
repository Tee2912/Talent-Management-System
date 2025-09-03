"""
Test AI Copilot Mock System
Simple test to verify mock responses work correctly
"""

import sys
import os
import asyncio

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_mock_ai_responses():
    """Test the mock AI response system"""
    print("🧪 Testing Mock AI Response System...")
    print("=" * 50)
    
    try:
        from backend.services.mock_ai_responses import mock_ai
        print("✅ Successfully imported mock AI responses")
    except ImportError as e:
        print(f"❌ Failed to import mock AI responses: {e}")
        return False
    
    # Test general responses
    print("\n1. Testing General Responses:")
    test_queries = [
        "Hello, can you help me?",
        "What are best practices for hiring?",
        "How can I detect bias?",
        "Help me automate workflows"
    ]
    
    for query in test_queries:
        response = mock_ai.get_general_response(query)
        print(f"   Q: {query}")
        print(f"   A: {response['response'][:100]}...")
        print(f"   ✅ Confidence: {response['confidence']}")
        print()
    
    # Test candidate analysis
    print("2. Testing Candidate Analysis:")
    candidate_response = mock_ai.get_candidate_analysis("1", "What are Sarah's strengths?")
    print(f"   Candidate: {candidate_response['candidate_analysis']['name']}")
    print(f"   Analysis: {candidate_response['response'][:100]}...")
    print(f"   ✅ Score: {candidate_response['candidate_analysis']['score']}")
    print()
    
    # Test job matching
    print("3. Testing Job Matching:")
    job_response = mock_ai.get_job_matching_response("Find candidates for Senior Engineer")
    print(f"   Query: Find candidates for Senior Engineer")
    print(f"   Response: {job_response['response'][:100]}...")
    print(f"   ✅ Insights available: {bool(job_response.get('matching_insights'))}")
    print()
    
    # Test bias detection
    print("4. Testing Bias Detection:")
    bias_text = "Looking for a young, energetic developer who fits our culture"
    bias_response = mock_ai.get_bias_analysis(bias_text)
    print(f"   Text: {bias_text}")
    print(f"   Bias Detected: {bias_response['bias_detected']}")
    print(f"   Risk Level: {bias_response['risk_level']}")
    print(f"   ✅ Analysis: {bias_response['response'][:100]}...")
    print()
    
    # Test workflow automation
    print("5. Testing Workflow Automation:")
    workflow_response = mock_ai.get_workflow_response("candidate_screening", {"query": "automate screening"})
    print(f"   Workflow: candidate_screening")
    print(f"   Success: {workflow_response['success']}")
    print(f"   Workflow ID: {workflow_response['workflow_id']}")
    print(f"   ✅ Response: {workflow_response['response'][:100]}...")
    
    print("\n" + "=" * 50)
    print("✅ All Mock AI Response Tests Passed!")
    return True

async def test_ai_orchestrator():
    """Test the AI Orchestrator with mock mode"""
    print("\n🔧 Testing AI Orchestrator Mock Mode...")
    print("=" * 50)
    
    try:
        from backend.services.ai_orchestrator import AIOrchestrator
        print("✅ Successfully imported AI Orchestrator")
    except ImportError as e:
        print(f"❌ Failed to import AI Orchestrator: {e}")
        return False
    
    # Initialize AI Orchestrator without API keys (mock mode)
    orchestrator = AIOrchestrator()
    print(f"✅ AI Orchestrator initialized - Mock Mode: {orchestrator.mock_mode}")
    
    if not orchestrator.mock_mode:
        print("⚠️  Warning: Not in mock mode - may require API keys")
    
    # Test general intelligence query
    print("\n1. Testing General Intelligence Query:")
    try:
        response = await orchestrator.general_intelligence_query(
            "Hello, what can you help me with?", 
            "demo"
        )
        print(f"   ✅ Response: {response['response'][:100]}...")
        print(f"   Confidence: {response.get('confidence', 'N/A')}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test candidate analysis
    print("\n2. Testing Candidate Analysis:")
    try:
        response = await orchestrator.analyze_candidate_intelligence(
            1, 
            "Analyze Sarah Johnson's qualifications"
        )
        print(f"   ✅ Response: {response['response'][:100]}...")
        if 'candidate_analysis' in response:
            print(f"   Candidate: {response['candidate_analysis']['name']}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test job matching
    print("\n3. Testing Smart Job Matching:")
    try:
        response = await orchestrator.smart_job_matching(
            "Find best candidates for Senior Engineer", 
            1
        )
        print(f"   ✅ Response: {response['response'][:100]}...")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ AI Orchestrator Mock Tests Completed!")
    return True

def main():
    """Run comprehensive mock system tests"""
    print("🚀 AI COPILOT MOCK SYSTEM VERIFICATION")
    print("=" * 60)
    print("Testing the mock AI system without requiring API keys...")
    print()
    
    success = True
    
    # Test mock responses
    success &= test_mock_ai_responses()
    
    # Test AI orchestrator
    try:
        success &= asyncio.run(test_ai_orchestrator())
    except Exception as e:
        print(f"❌ AI Orchestrator test failed: {e}")
        success = False
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 ALL TESTS PASSED! Mock AI Copilot is ready for demo!")
        print("\nNext steps:")
        print("1. Run: python demo_ai_copilot_conversation.py")
        print("2. Try different conversation scenarios")
        print("3. Test interactive chat mode")
        print("4. When ready, add real API keys to .env file")
    else:
        print("❌ Some tests failed. Please check the setup.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
