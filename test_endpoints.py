#!/usr/bin/env python3
"""
Test script to check all missing endpoints and find 422 errors
"""
import requests
import json

def test_endpoint(method, url, data=None, expected_status=200):
    """Test an endpoint and report results"""
    try:
        print(f"\n🔍 Testing {method} {url}")
        
        if method.upper() == 'GET':
            response = requests.get(url, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print("✅ Success")
            try:
                result = response.json()
                print("Response preview:", json.dumps(result, indent=2)[:200] + "..." if len(str(result)) > 200 else json.dumps(result, indent=2))
            except:
                print("Response text:", response.text[:200])
        else:
            print(f"❌ Error (expected {expected_status})")
            print("Response:", response.text[:500])
            
        return response.status_code
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def main():
    base_url = "http://localhost:8000"
    
    print("🚀 Testing all bias detection endpoints for 422 errors...")
    
    # Test the endpoints that frontend expects
    test_endpoint("GET", f"{base_url}/api/bias-detection/health")
    test_endpoint("GET", f"{base_url}/api/candidates")
    test_endpoint("GET", f"{base_url}/api/bias-detection/insights")
    
    # Test analyze endpoint with different payloads to find 422 source
    print(f"\n🔍 Testing analyze endpoint with various payloads...")
    
    # Test 1: Empty candidate_ids (this might cause 422)
    test_endpoint("POST", f"{base_url}/api/bias-detection/analyze", {"candidate_ids": []})
    
    # Test 2: Valid candidate_ids 
    test_endpoint("POST", f"{base_url}/api/bias-detection/analyze", {"candidate_ids": [1, 2, 3]})
    
    # Test 3: With protected_attribute (what BiasDetectionDemo sends)
    test_endpoint("POST", f"{base_url}/api/bias-detection/analyze", {
        "protected_attribute": "gender",
        "candidates": []
    })
    
    # Test 4: Text analyze endpoint
    test_endpoint("POST", f"{base_url}/api/bias-detection/text-analyze", {
        "text": "This candidate seems aggressive and pushy.",
        "candidate_info": {"gender": "female"}
    })
    
    # Test 5: The v1 endpoints too
    test_endpoint("POST", f"{base_url}/api/v1/bias/analyze", {"candidate_ids": []})
    
    print(f"\n✅ Endpoint testing completed!")

if __name__ == "__main__":
    main()
