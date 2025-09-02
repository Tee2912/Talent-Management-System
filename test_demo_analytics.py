#!/usr/bin/env python3
"""
🚀 Demo Analytics Endpoint Tester
Test all the impressive analytics endpoints for demo readiness
"""

import requests
import json
from datetime import datetime
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint_path, description):
    """Test an endpoint and display results"""
    url = f"{BASE_URL}{endpoint_path}"
    print(f"\n{'='*60}")
    print(f"🧪 Testing: {description}")
    print(f"📍 URL: {url}")
    print(f"{'='*60}")
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS - Status: {response.status_code}")
            print(f"📊 Response size: {len(json.dumps(data))} characters")
            
            # Show key metrics for demo value
            if 'kpis' in data:
                print(f"💼 Executive KPIs: {len(data['kpis'])} metrics")
            if 'trends' in data:
                print(f"📈 Trend datasets: {len(data['trends'])} series")
            if 'interviewer_performance' in data:
                print(f"👥 Interviewer stats: {len(data['interviewer_performance'])} people")
            if 'predictions' in data:
                print(f"🤖 AI predictions: Available with {data['predictions'].get('success_probability', {}).get('accuracy_rate', 0)}% accuracy")
            if 'activity_feed' in data:
                print(f"🔴 Live activities: {len(data['activity_feed'])} recent events")
            if 'alerts' in data:
                print(f"🚨 Active alerts: {len(data['alerts'])} notifications")
                
            # Show sample of impressive data
            print(f"\n📋 Sample Key Metrics:")
            if 'kpis' in data:
                kpis = data['kpis']
                for key, value in list(kpis.items())[:4]:  # Show first 4 KPIs
                    if isinstance(value, (int, float)):
                        print(f"   • {key.replace('_', ' ').title()}: {value:,}")
                    else:
                        print(f"   • {key.replace('_', ' ').title()}: {value}")
            
        else:
            print(f"❌ FAILED - Status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CONNECTION FAILED: {e}")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")

def main():
    """Test all demo analytics endpoints"""
    print("🎯 HireIQ Pro Demo Analytics Endpoint Testing")
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # Test all impressive demo endpoints
    endpoints = [
        ("/api/v1/demo-analytics/executive-dashboard", "Executive Dashboard - C-Level KPIs"),
        ("/api/v1/demo-analytics/performance-analytics", "Performance Analytics - Operational Insights"),
        ("/api/v1/demo-analytics/ai-insights", "AI Insights - Predictions & Recommendations"),
        ("/api/v1/demo-analytics/real-time-metrics", "Real-Time Metrics - Live Data"),
        ("/api/v1/demo-analytics/summary", "Enhanced Summary - Overview"),
        
        # Test existing endpoints for comparison
        ("/api/v1/analytics/summary", "Original Analytics Summary"),
        ("/api/v1/analytics/predictive-metrics", "Advanced Predictive Metrics"),
        ("/api/v1/candidates/", "Candidates Data (for analytics)"),
    ]
    
    success_count = 0
    total_count = len(endpoints)
    
    for endpoint_path, description in endpoints:
        test_endpoint(endpoint_path, description)
        # Simple success check - you could make this more sophisticated
        try:
            response = requests.get(f"{BASE_URL}{endpoint_path}", timeout=5)
            if response.status_code == 200:
                success_count += 1
        except:
            pass
    
    # Final summary
    print(f"\n{'='*60}")
    print(f"🎯 DEMO READINESS SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Successful endpoints: {success_count}/{total_count}")
    print(f"📊 Success rate: {(success_count/total_count)*100:.1f}%")
    
    if success_count == total_count:
        print(f"🚀 DEMO READY! All analytics endpoints are working perfectly!")
        print(f"💡 Start your demo with: {BASE_URL}/api/v1/demo-analytics/executive-dashboard")
    elif success_count >= total_count * 0.8:
        print(f"⚠️  MOSTLY READY - {total_count - success_count} endpoints need attention")
    else:
        print(f"❌ NEEDS WORK - Several endpoints are not responding")
    
    print(f"\n📖 For detailed documentation, see: DEMO_ANALYTICS_SHOWCASE.md")
    return success_count == total_count

if __name__ == "__main__":
    try:
        demo_ready = main()
        sys.exit(0 if demo_ready else 1)
    except KeyboardInterrupt:
        print(f"\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Test script error: {e}")
        sys.exit(1)
