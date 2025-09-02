#!/usr/bin/env python3
"""
Test script to check API response for NaN values
"""
import requests
import json
import sys

def test_api_endpoints():
    base_url = "http://localhost:8000"
    
    # Test insights endpoint
    try:
        print("Testing insights endpoint...")
        response = requests.get(f"{base_url}/api/bias-detection/insights")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response JSON:")
            print(json.dumps(data, indent=2))
            
            # Check for NaN values in the response
            def check_for_nan(obj, path=""):
                if isinstance(obj, dict):
                    for key, value in obj.items():
                        check_for_nan(value, f"{path}.{key}" if path else key)
                elif isinstance(obj, list):
                    for i, item in enumerate(obj):
                        check_for_nan(item, f"{path}[{i}]")
                elif isinstance(obj, float):
                    if str(obj).lower() == 'nan':
                        print(f"⚠️ Found NaN at: {path}")
                elif isinstance(obj, str):
                    if obj.lower() == 'nan':
                        print(f"⚠️ Found NaN string at: {path}")
            
            print("\n🔍 Checking for NaN values...")
            check_for_nan(data)
            print("✅ NaN check completed")
            
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing insights: {e}")
    
    # Test analyze endpoint
    try:
        print("\n" + "="*50)
        print("Testing analyze endpoint...")
        response = requests.post(f"{base_url}/api/bias-detection/analyze", 
                               json={"protected_attribute": "gender"})
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response JSON:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing analyze: {e}")

if __name__ == "__main__":
    test_api_endpoints()
