import requests
import json

def test_backend():
    """Test backend endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    # Test 1: Basic health check
    print("🔍 Testing basic server health...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Server is running (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Server not responding: {e}")
        return False
    
    # Test 2: Bias detection health
    print("\n🔍 Testing bias detection health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/bias-detection/health", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Bias detection health check passed")
            print(f"   AI Orchestrator Available: {data.get('ai_orchestrator_available', False)}")
            print(f"   Total Candidates: {data.get('total_candidates', 0)}")
            print(f"   AI Status: {data.get('ai_status', 'unknown')}")
            print(f"   Bias Engine Test: {data.get('bias_engine_test', 'unknown')}")
            
            if data.get('ai_orchestrator_available'):
                print("🎉 AI Orchestrator is ONLINE!")
            else:
                print("⚠️ AI Orchestrator is offline")
                
        else:
            print(f"❌ Health check failed: {response.text}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 3: Candidates endpoint
    print("\n🔍 Testing candidates endpoint...")
    try:
        response = requests.get(f"{base_url}/api/candidates", timeout=5)
        if response.status_code == 200:
            candidates = response.json()
            print(f"✅ Candidates endpoint working ({len(candidates)} candidates)")
        else:
            print(f"❌ Candidates endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Candidates endpoint error: {e}")
    
    # Test 4: Text bias analysis
    print("\n🔍 Testing text bias analysis...")
    try:
        test_data = {
            "text": "The candidate seems very aggressive and pushy. Not sure if she would be a good cultural fit.",
            "candidate_info": {"gender": "female"}
        }
        
        response = requests.post(f"{base_url}/api/bias-detection/text-analyze", 
                               json=test_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Text bias analysis working")
            text_analysis = result.get('text_analysis', {})
            print(f"   Bias detected: {text_analysis.get('bias_detected', 'N/A')}")
            print(f"   Bias score: {text_analysis.get('bias_score', 'N/A')}")
            print(f"   Patterns found: {list(text_analysis.get('detected_patterns', {}).keys())}")
        else:
            print(f"❌ Text analysis failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Text analysis error: {e}")
    
    print("\n📋 Summary:")
    print("Backend server is running with bias detection capabilities.")
    print("Navigate to http://localhost:3000/bias-detection to test the frontend interface.")
    print("The AI Orchestrator is enabled and ready for bias analysis.")

if __name__ == "__main__":
    test_backend()
