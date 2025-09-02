"""
Test script for bias detection functionality
"""

import json
import sys
import os

# Add the parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.ai_orchestrator import AIOrchestrator
from backend.app.models.bias_detection import BiasDetector

def test_bias_detection():
    """Test bias detection with mock data"""
    
    # Load the candidates data
    try:
        with open('candidates.json', 'r') as f:
            candidates = json.load(f)
        print(f"✅ Loaded {len(candidates)} candidates from candidates.json")
    except FileNotFoundError:
        print("❌ candidates.json not found")
        return False
    except Exception as e:
        print(f"❌ Error loading candidates: {e}")
        return False
    
    # Test traditional bias detector
    print("\n🔍 Testing Traditional Bias Detector...")
    try:
        bias_detector = BiasDetector()
        result = bias_detector.detect_bias(candidates)
        print(f"✅ Traditional bias detection completed")
        print(f"   - Bias score: {result.get('bias_score', 'N/A')}")
        print(f"   - Bias detected: {result.get('bias_detected', 'N/A')}")
        print(f"   - Flagged candidates: {len(result.get('flagged_candidates', []))}")
    except Exception as e:
        print(f"❌ Traditional bias detector error: {e}")
    
    # Test AI Orchestrator bias detection
    print("\n🤖 Testing AI Orchestrator Bias Detection...")
    try:
        ai_orchestrator = AIOrchestrator()
        
        # Test demographic bias analysis
        demo_result = ai_orchestrator.bias_detector.analyze_demographic_bias(candidates, 'gender')
        print(f"✅ Demographic bias analysis (gender) completed")
        print(f"   - Bias detected: {demo_result.get('bias_detected', 'N/A')}")
        print(f"   - Bias score: {demo_result.get('bias_score', 'N/A')}")
        print(f"   - Confidence: {demo_result.get('confidence', 'N/A')}")
        
        # Test with ethnicity
        eth_result = ai_orchestrator.bias_detector.analyze_demographic_bias(candidates, 'ethnicity')
        print(f"✅ Demographic bias analysis (ethnicity) completed")
        print(f"   - Bias detected: {eth_result.get('bias_detected', 'N/A')}")
        print(f"   - Bias score: {eth_result.get('bias_score', 'N/A')}")
        
        # Test score bias analysis
        score_result = ai_orchestrator.bias_detector.analyze_score_bias(candidates, 'gender')
        print(f"✅ Score bias analysis completed")
        print(f"   - Bias detected: {score_result.get('bias_detected', 'N/A')}")
        print(f"   - Bias score: {score_result.get('bias_score', 'N/A')}")
        print(f"   - Available score types: {score_result.get('available_score_types', [])}")
        
        # Test text bias analysis
        sample_text = "The candidate seems very aggressive and pushy. Not sure if she would be a good cultural fit."
        text_result = ai_orchestrator.bias_detector._analyze_text_bias(sample_text, {'gender': 'female'})
        print(f"✅ Text bias analysis completed")
        print(f"   - Bias detected: {text_result.get('bias_detected', 'N/A')}")
        print(f"   - Bias score: {text_result.get('bias_score', 'N/A')}")
        print(f"   - Detected patterns: {list(text_result.get('detected_patterns', {}).keys())}")
        
        # Test comprehensive bias insights
        insights = ai_orchestrator.get_bias_insights(candidates)
        print(f"✅ Comprehensive bias insights generated")
        print(f"   - Summary available: {bool(insights.get('summary'))}")
        print(f"   - Recommendations count: {len(insights.get('recommendations', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ AI Orchestrator error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_data_quality():
    """Test the quality and structure of our mock data"""
    
    try:
        with open('candidates.json', 'r') as f:
            candidates = json.load(f)
        
        print(f"\n📊 Data Quality Analysis:")
        print(f"   - Total candidates: {len(candidates)}")
        
        # Check required fields
        required_fields = ['gender', 'ethnicity', 'hiring_decision', 'final_score']
        missing_fields = []
        
        for field in required_fields:
            if field not in candidates[0]:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"   ❌ Missing required fields: {missing_fields}")
        else:
            print(f"   ✅ All required fields present")
        
        # Check data distribution
        genders = {}
        ethnicities = {}
        decisions = {}
        
        for candidate in candidates:
            gender = candidate.get('gender', 'unknown')
            ethnicity = candidate.get('ethnicity', 'unknown')
            decision = candidate.get('hiring_decision', 'unknown')
            
            genders[gender] = genders.get(gender, 0) + 1
            ethnicities[ethnicity] = ethnicities.get(ethnicity, 0) + 1
            decisions[decision] = decisions.get(decision, 0) + 1
        
        print(f"   - Gender distribution: {genders}")
        print(f"   - Ethnicity distribution: {ethnicities}")
        print(f"   - Decision distribution: {decisions}")
        
        # Calculate hiring rates
        total_hired = decisions.get('hired', 0)
        total_candidates = len(candidates)
        hiring_rate = total_hired / total_candidates if total_candidates > 0 else 0
        
        print(f"   - Overall hiring rate: {hiring_rate:.2%}")
        
        return True
        
    except Exception as e:
        print(f"❌ Data quality check error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Bias Detection Tests...")
    
    # Test data quality first
    data_ok = test_data_quality()
    
    if data_ok:
        # Test bias detection functionality
        bias_ok = test_bias_detection()
        
        if bias_ok:
            print("\n✅ All tests passed! Bias detection is working properly.")
        else:
            print("\n❌ Bias detection tests failed.")
    else:
        print("\n❌ Data quality tests failed.")
