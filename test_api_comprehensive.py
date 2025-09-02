#!/usr/bin/env python3
"""
Comprehensive API Testing Script for HireIQ Pro
Tests all endpoints to identify and fix issues
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    """Test a single endpoint and report results"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🧪 Testing {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == expected_status:
            print(f"   ✅ SUCCESS")
            if response.headers.get('content-type', '').startswith('application/json'):
                result = response.json()
                if isinstance(result, list):
                    print(f"   📊 Response: List with {len(result)} items")
                elif isinstance(result, dict):
                    print(f"   📊 Response: Dict with keys: {list(result.keys())}")
            return True, response
        else:
            print(f"   ❌ FAILED - Expected {expected_status}, got {response.status_code}")
            print(f"   📝 Response: {response.text[:200]}...")
            return False, response
            
    except Exception as e:
        print(f"   💥 ERROR: {str(e)}")
        return False, None

def main():
    """Run comprehensive API tests"""
    print("🚀 Starting HireIQ Pro API Tests")
    print("=" * 50)
    
    # Test basic endpoints
    test_endpoint("GET", "/")
    test_endpoint("GET", "/health")
    
    # Test the problematic endpoints from the logs
    print("\n🔍 Testing Problematic Endpoints:")
    
    # Test candidates endpoints
    test_endpoint("GET", "/api/candidates")  # This was giving 404
    test_endpoint("GET", "/api/v1/candidates")
    test_endpoint("GET", "/candidates")  # This was giving 307
    
    # Test interviews endpoints
    test_endpoint("GET", "/api/v1/interviews")  # This was giving 307
    test_endpoint("GET", "/api/v1/interviews/")  # With trailing slash
    test_endpoint("GET", "/api/v1/interviews/templates")  # This was giving 422
    
    # Test other endpoints
    test_endpoint("GET", "/api/v1/interviews/interviewers")
    test_endpoint("GET", "/api/v1/interviews/analytics/summary")
    
    # Test creating a candidate
    candidate_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "position_applied": "Software Engineer",
        "experience_years": 5,
        "education_level": "Bachelor's Degree",
        "skills": ["Python", "JavaScript", "React"]
    }
    
    success, response = test_endpoint("POST", "/api/v1/candidates", candidate_data, 200)
    candidate_id = None
    if success and response:
        candidate_id = response.json().get('id')
        print(f"   👤 Created candidate with ID: {candidate_id}")
    
    # Test creating an interview if we have a candidate
    if candidate_id:
        interview_data = {
            "candidate_id": candidate_id,
            "candidate_name": "John Doe",
            "position": "Software Engineer",
            "interviewer_ids": [1, 2],
            "scheduled_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "duration": 60,
            "type": "technical",
            "location": "Conference Room A",
            "meeting_link": "https://zoom.us/j/123456789"
        }
        
        test_endpoint("POST", "/api/v1/interviews", interview_data, 200)
    
    print("\n" + "=" * 50)
    print("🏁 API Testing Complete!")

if __name__ == "__main__":
    main()
