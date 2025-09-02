"""
Simple test for bias detection API endpoints
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/bias-detection/health", timeout=5)
        print(f"Health Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"   AI Orchestrator: {'Available' if data.get('ai_orchestrator_available') else 'Not Available'}")
            print(f"   Total Candidates: {data.get('total_candidates', 0)}")
            print(f"   Capabilities: {', '.join(data.get('analysis_capabilities', []))}")
            return True
        else:
            print(f"❌ Health check failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_candidates_endpoint():
    """Test if candidates endpoint is working"""
    try:
        response = requests.get(f"{BASE_URL}/api/candidates", timeout=5)
        print(f"Candidates Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Candidates endpoint working")
            print(f"   Total candidates returned: {len(data)}")
            if data:
                sample = data[0]
                print(f"   Sample candidate: {sample.get('first_name', 'N/A')} {sample.get('last_name', 'N/A')}")
                print(f"   Has gender field: {'gender' in sample}")
                print(f"   Has hiring_decision field: {'hiring_decision' in sample}")
            return True
        else:
            print(f"❌ Candidates endpoint failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Candidates endpoint error: {e}")
        return False

def test_bias_analysis():
    """Test bias analysis endpoint"""
    try:
        # Get candidates first
        candidates_response = requests.get(f"{BASE_URL}/api/candidates", timeout=5)
        if candidates_response.status_code != 200:
            print("❌ Cannot get candidates for bias analysis")
            return False
        
        candidates = candidates_response.json()
        
        payload = {
            "protected_attribute": "gender",
            "candidates": candidates
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bias-detection/analyze", 
            json=payload,
            timeout=10
        )
        
        print(f"Bias Analysis Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Bias analysis completed")
            print(f"   Bias detected: {data.get('bias_detected', 'N/A')}")
            print(f"   Bias score: {data.get('bias_score', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
            return True
        else:
            print(f"❌ Bias analysis failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Bias analysis error: {e}")
        return False

def test_text_analysis():
    """Test text bias analysis endpoint"""
    try:
        payload = {
            "text": "The candidate seems very aggressive and pushy. Not sure if she would be a good cultural fit.",
            "candidate_info": {"gender": "female"}
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bias-detection/text-analyze", 
            json=payload,
            timeout=10
        )
        
        print(f"Text Analysis Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            text_analysis = data.get('text_analysis', {})
            print(f"✅ Text bias analysis completed")
            print(f"   Bias detected: {text_analysis.get('bias_detected', 'N/A')}")
            print(f"   Bias score: {text_analysis.get('bias_score', 'N/A')}")
            print(f"   Detected patterns: {list(text_analysis.get('detected_patterns', {}).keys())}")
            return True
        else:
            print(f"❌ Text analysis failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Text analysis error: {e}")
        return False

def test_insights():
    """Test bias insights endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/bias-detection/insights", timeout=10)
        
        print(f"Insights Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Bias insights generated")
            print(f"   Insights available: {bool(data.get('insights'))}")
            print(f"   Total candidates analyzed: {data.get('total_candidates_analyzed', 'N/A')}")
            return True
        else:
            print(f"❌ Insights generation failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Insights generation error: {e}")
        return False

def main():
    print("🚀 Testing Bias Detection API Endpoints")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    print("Waiting for server to be ready...")
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health),
        ("Candidates Endpoint", test_candidates_endpoint),
        ("Bias Analysis", test_bias_analysis),
        ("Text Analysis", test_text_analysis),
        ("Bias Insights", test_insights)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            failed += 1
        print("-" * 30)
    
    print(f"\n📊 Test Results:")
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   Total: {passed + failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Bias detection API is working correctly.")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Check the server logs for more details.")

if __name__ == "__main__":
    main()
