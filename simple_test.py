#!/usr/bin/env python3
"""
Simple test to check insights API response
"""

import json
import requests
import time

def test_insights_api():
    try:
        print("Testing insights API endpoint...")
        response = requests.get("http://localhost:8000/api/bias-detection/insights", timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ API Response (pretty printed):")
            print(json.dumps(data, indent=2))
            
            # Check specifically for the fields the frontend needs
            if 'insights' in data and 'summary' in data['insights']:
                summary = data['insights']['summary']
                print(f"\n🔍 Summary Fields:")
                for key, value in summary.items():
                    print(f"  {key}: {value} (type: {type(value).__name__})")
                
                # Check for the specific field causing NaN
                if 'overall_hiring_rate' in summary:
                    rate = summary['overall_hiring_rate']
                    print(f"\n✅ overall_hiring_rate found: {rate}")
                    if str(rate).lower() == 'nan' or rate != rate:  # NaN check
                        print("⚠️ overall_hiring_rate is NaN!")
                    else:
                        print(f"✅ overall_hiring_rate is valid: {rate * 100:.1f}%")
                else:
                    print("❌ overall_hiring_rate not found in summary!")
            
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the server running?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_insights_api()
