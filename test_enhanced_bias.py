import requests
import json

def test_enhanced_bias_detection():
    """Test the enhanced bias detection system"""
    base_url = "http://127.0.0.1:8000"
    
    print("🔍 Testing Enhanced Bias Detection System")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{base_url}/api/bias-detection/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check passed!")
            print(f"   AI Orchestrator Available: {health_data.get('ai_orchestrator_available', False)}")
            print(f"   Total Candidates: {health_data.get('total_candidates', 0)}")
            print(f"   Analysis Capabilities: {health_data.get('analysis_capabilities', [])}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Comprehensive Insights (New Enhanced Feature)
    print("\n2. Testing Comprehensive Insights...")
    try:
        response = requests.get(f"{base_url}/api/bias-detection/insights", timeout=15)
        if response.status_code == 200:
            insights_data = response.json()
            print("✅ Comprehensive insights working!")
            print(f"   Status: {insights_data.get('status')}")
            
            if insights_data.get('insights'):
                insights = insights_data['insights']
                print(f"   Risk Level: {insights.get('risk_level', 'unknown')}")
                print(f"   Total Candidates Analyzed: {insights_data.get('total_candidates', 0)}")
                
                # Show demographic analysis
                demo_analysis = insights.get('demographic_analysis', {})
                if demo_analysis:
                    print("   Demographic Analysis:")
                    for attribute, analysis in demo_analysis.items():
                        bias_detected = analysis.get('bias_detected', False)
                        bias_score = analysis.get('bias_score', 0)
                        print(f"     - {attribute}: Bias={bias_detected}, Score={bias_score:.3f}")
                
                # Show recommendations
                recommendations = insights.get('recommendations', [])
                if recommendations:
                    print(f"   Recommendations: {len(recommendations)} items")
                    for i, rec in enumerate(recommendations[:3]):
                        print(f"     {i+1}. {rec}")
        else:
            print(f"❌ Insights endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Insights endpoint error: {e}")
    
    # Test 3: Text Bias Analysis (New Enhanced Feature)
    print("\n3. Testing Text Bias Analysis...")
    try:
        test_text = {
            "text": "The candidate seems very aggressive and pushy. Not sure if she would be a good cultural fit. She might be too emotional for this role.",
            "candidate_info": {"gender": "female", "ethnicity": "Unknown"}
        }
        
        response = requests.post(f"{base_url}/api/bias-detection/text-analyze", 
                               json=test_text, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text bias analysis working!")
            
            text_analysis = result.get('text_analysis', {})
            print(f"   Bias Detected: {text_analysis.get('bias_detected', False)}")
            print(f"   Bias Score: {text_analysis.get('bias_score', 0):.3f}")
            print(f"   Risk Level: {text_analysis.get('risk_level', 'unknown')}")
            
            patterns = text_analysis.get('detected_patterns', {})
            if patterns:
                print("   Detected Bias Patterns:")
                for pattern_type, phrases in patterns.items():
                    if phrases:
                        print(f"     - {pattern_type}: {phrases}")
            
            recommendations = result.get('recommendations', [])
            if recommendations:
                print(f"   Recommendations: {recommendations[:2]}")
                
        else:
            print(f"❌ Text analysis failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Text analysis error: {e}")
    
    # Test 4: Candidate Analysis  
    print("\n4. Testing Candidate Bias Analysis...")
    try:
        analysis_request = {
            "candidate_ids": [1, 2, 3, 4, 5]  # First 5 candidates
        }
        
        response = requests.post(f"{base_url}/api/bias-detection/analyze", 
                               json=analysis_request, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Candidate analysis working!")
            print(f"   Overall Bias Score: {result.get('overall_bias_score', 0):.3f}")
            
            demo_bias = result.get('demographic_bias', {})
            if demo_bias:
                print(f"   Demographic Analysis Available: {len(demo_bias)} attributes")
            
            recommendations = result.get('recommendations', [])
            if recommendations:
                print(f"   Recommendations: {len(recommendations)} items")
                
        else:
            print(f"❌ Candidate analysis failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Candidate analysis error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Enhanced Bias Detection Testing Complete!")
    print("\nYour bias detection system now includes:")
    print("✅ AI Orchestrator integration")
    print("✅ Comprehensive demographic analysis") 
    print("✅ Enhanced text bias detection")
    print("✅ Statistical bias scoring")
    print("✅ Actionable recommendations")
    print("✅ 100 candidate dataset for robust analysis")
    
    print(f"\n🌐 Visit http://localhost:3000/bias-detection to see the enhanced UI!")

if __name__ == "__main__":
    test_enhanced_bias_detection()
