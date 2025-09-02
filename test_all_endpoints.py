#!/usr/bin/env python3
"""
Comprehensive API endpoint testing script
Tests all the endpoints that were causing 404 and 422 errors
"""
import requests
import json
import time

def test_endpoint(method, url, data=None, params=None, expected_status=200):
    """Test an endpoint and report results"""
    try:
        print(f"\n🔍 Testing {method} {url}")
        if params:
            print(f"   Params: {params}")
        
        if method.upper() == 'GET':
            response = requests.get(url, params=params, timeout=10)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, params=params, timeout=10)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print("   ✅ Success")
            try:
                result = response.json()
                # Show first few lines of response
                response_str = json.dumps(result, indent=2)
                if len(response_str) > 300:
                    print(f"   Response: {response_str[:300]}...")
                else:
                    print(f"   Response: {response_str}")
            except:
                print(f"   Response: {response.text[:200]}")
        else:
            print(f"   ❌ Error (expected {expected_status})")
            print(f"   Response: {response.text[:300]}")
            
        return response.status_code
        
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return None

def main():
    base_url = "http://localhost:8000"
    
    print("🚀 COMPREHENSIVE API ENDPOINT TESTING")
    print("=" * 50)
    
    # Give server time to start
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    # Test the endpoints that were causing errors
    
    print(f"\n📋 TESTING ORIGINALLY FAILING ENDPOINTS:")
    print("-" * 40)
    
    # 1. Test /candidates (was 404)
    test_endpoint("GET", f"{base_url}/candidates")
    
    # 2. Test /api/v1/interviews (was 307 redirect)
    test_endpoint("GET", f"{base_url}/api/v1/interviews")
    
    # 3. Test /api/v1/interviews/templates (was 422)
    test_endpoint("GET", f"{base_url}/api/v1/interviews/templates")
    
    # 4. Test /api/v1/feedback/history (was 404)
    test_endpoint("GET", f"{base_url}/api/v1/feedback/history", params={"limit": 20})
    
    print(f"\n📋 TESTING ADDITIONAL CRITICAL ENDPOINTS:")
    print("-" * 40)
    
    # Test other important endpoints
    test_endpoint("GET", f"{base_url}/api/v1/candidates")
    test_endpoint("GET", f"{base_url}/api/bias-detection/health")
    test_endpoint("GET", f"{base_url}/api/v1/interviews/templates/")  # With trailing slash
    test_endpoint("GET", f"{base_url}/api/v1/feedback/templates")
    
    print(f"\n📋 TESTING API ROOT AND HEALTH:")
    print("-" * 40)
    
    # Test root endpoint
    test_endpoint("GET", f"{base_url}/")
    
    print(f"\n🎯 TESTING COMPLETED!")
    print("=" * 50)
    print("All endpoints should now be working without 404/422 errors.")

if __name__ == "__main__":
    main()
