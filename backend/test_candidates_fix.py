#!/usr/bin/env python3

import requests
import json

def test_candidates_endpoint():
    """Test the candidates endpoint to verify the 404 fix"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Candidates Endpoint Fix...")
    print("=" * 50)
    
    # Test different URL patterns
    test_urls = [
        "/api/v1/candidates",           # Without trailing slash (was failing)
        "/api/v1/candidates/",          # With trailing slash (was working)
        "/api/v1/candidates/debug",     # Debug endpoint
    ]
    
    for url in test_urls:
        full_url = base_url + url
        print(f"\n🔍 Testing: {full_url}")
        
        try:
            response = requests.get(full_url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"   ✅ SUCCESS: Returned {len(data)} candidates")
                elif isinstance(data, dict):
                    print(f"   ✅ SUCCESS: Returned data with keys: {list(data.keys())}")
                else:
                    print(f"   ✅ SUCCESS: Returned data type: {type(data)}")
            elif response.status_code == 404:
                print(f"   ❌ FAILED: 404 Not Found")
            else:
                print(f"   ⚠️  Unexpected status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ ERROR: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_candidates_endpoint()
