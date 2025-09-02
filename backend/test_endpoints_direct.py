#!/usr/bin/env python3
"""Simple test script to check API endpoints"""

import requests
import json

def test_endpoint(url, description):
    print(f"\n=== Testing {description} ===")
    print(f"URL: {url}")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Response type: {type(data)}")
                if isinstance(data, list):
                    print(f"Number of items: {len(data)}")
                    if data:
                        print(f"First item keys: {list(data[0].keys()) if isinstance(data[0], dict) else 'Not a dict'}")
                else:
                    print(f"Response: {data}")
            except Exception as e:
                print(f"Error parsing JSON: {e}")
                print(f"Raw response: {response.text[:200]}...")
        else:
            print(f"Error response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    base_url = "http://127.0.0.1:8000"
    
    # Test various endpoints
    test_endpoint(f"{base_url}/", "Root endpoint")
    test_endpoint(f"{base_url}/api/v1/candidates", "Candidates endpoint")
    test_endpoint(f"{base_url}/api/v1/analytics/summary", "Analytics summary")
    test_endpoint(f"{base_url}/docs", "API Documentation")
    
    # Test with explicit no trailing slash
    test_endpoint(f"{base_url}/api/v1/candidates/", "Candidates with trailing slash")
