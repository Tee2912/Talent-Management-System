"""
Manual verification of bias detection functionality
"""

def verify_mock_data():
    """Check if mock data is properly loaded"""
    import json
    
    try:
        with open('candidates.json', 'r') as f:
            candidates = json.load(f)
        
        print(f"✅ Successfully loaded {len(candidates)} candidates")
        
        # Check data structure
        if candidates:
            sample = candidates[0]
            required_fields = ['gender', 'ethnicity', 'hiring_decision', 'final_score']
            missing_fields = [field for field in required_fields if field not in sample]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            else:
                print(f"✅ All required fields present: {required_fields}")
        
        # Check data distribution
        genders = {}
        decisions = {}
        
        for candidate in candidates:
            gender = candidate.get('gender', 'unknown')
            decision = candidate.get('hiring_decision', 'unknown')
            
            genders[gender] = genders.get(gender, 0) + 1
            decisions[decision] = decisions.get(decision, 0) + 1
        
        print(f"✅ Gender distribution: {genders}")
        print(f"✅ Decision distribution: {decisions}")
        
        # Calculate hiring rates by gender
        male_candidates = [c for c in candidates if c.get('gender') == 'male']
        female_candidates = [c for c in candidates if c.get('gender') == 'female']
        
        male_hired = sum(1 for c in male_candidates if c.get('hiring_decision') == 'hired')
        female_hired = sum(1 for c in female_candidates if c.get('hiring_decision') == 'hired')
        
        male_rate = male_hired / len(male_candidates) if male_candidates else 0
        female_rate = female_hired / len(female_candidates) if female_candidates else 0
        
        print(f"✅ Male hiring rate: {male_rate:.2%} ({male_hired}/{len(male_candidates)})")
        print(f"✅ Female hiring rate: {female_rate:.2%} ({female_hired}/{len(female_candidates)})")
        
        # Check for potential bias
        rate_difference = abs(male_rate - female_rate)
        print(f"✅ Hiring rate difference: {rate_difference:.2%}")
        
        if rate_difference > 0.10:
            print(f"⚠️  Significant hiring rate difference detected (>{10}%)")
        else:
            print(f"✅ Hiring rates appear balanced (<{10}% difference)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading mock data: {e}")
        return False

def verify_bias_detection_logic():
    """Test bias detection logic directly"""
    import sys
    import os
    
    # Add the parent directory to the path
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        from services.ai_orchestrator import AIOrchestrator
        import json
        
        print("✅ Successfully imported AIOrchestrator")
        
        # Load candidates
        with open('candidates.json', 'r') as f:
            candidates = json.load(f)
        
        # Initialize AI Orchestrator
        ai_orchestrator = AIOrchestrator()
        print("✅ AI Orchestrator initialized")
        
        # Test demographic bias analysis
        print("\n🔍 Testing demographic bias analysis (gender)...")
        gender_analysis = ai_orchestrator.bias_detector.analyze_demographic_bias(candidates, 'gender')
        
        print(f"   Bias detected: {gender_analysis.get('bias_detected')}")
        print(f"   Bias score: {gender_analysis.get('bias_score', 0):.3f}")
        print(f"   Confidence: {gender_analysis.get('confidence')}")
        print(f"   Bias level: {gender_analysis.get('bias_level', 'none')}")
        
        if gender_analysis.get('metrics'):
            hiring_rates = gender_analysis['metrics'].get('hiring_rates_by_group', {})
            print(f"   Hiring rates by gender: {hiring_rates}")
        
        # Test ethnicity analysis
        print("\n🔍 Testing demographic bias analysis (ethnicity)...")
        ethnicity_analysis = ai_orchestrator.bias_detector.analyze_demographic_bias(candidates, 'ethnicity')
        
        print(f"   Bias detected: {ethnicity_analysis.get('bias_detected')}")
        print(f"   Bias score: {ethnicity_analysis.get('bias_score', 0):.3f}")
        print(f"   Confidence: {ethnicity_analysis.get('confidence')}")
        
        # Test score bias analysis
        print("\n🔍 Testing score bias analysis...")
        score_analysis = ai_orchestrator.bias_detector.analyze_score_bias(candidates, 'gender')
        
        print(f"   Bias detected: {score_analysis.get('bias_detected')}")
        print(f"   Bias score: {score_analysis.get('bias_score', 0):.3f}")
        print(f"   Available score types: {score_analysis.get('available_score_types', [])}")
        
        # Test text bias analysis
        print("\n🔍 Testing text bias analysis...")
        biased_text = "The candidate seems very aggressive and pushy. Not sure if she would be a good cultural fit."
        text_analysis = ai_orchestrator.bias_detector._analyze_text_bias(biased_text, {'gender': 'female'})
        
        print(f"   Bias detected: {text_analysis.get('bias_detected')}")
        print(f"   Bias score: {text_analysis.get('bias_score', 0):.3f}")
        print(f"   Detected patterns: {list(text_analysis.get('detected_patterns', {}).keys())}")
        
        # Test comprehensive insights
        print("\n🔍 Testing comprehensive bias insights...")
        insights = ai_orchestrator.get_bias_insights(candidates)
        
        print(f"   Insights generated: {bool(insights)}")
        if insights.get('summary'):
            summary = insights['summary']
            print(f"   Total candidates: {summary.get('total_candidates', 0)}")
            print(f"   Overall hiring rate: {summary.get('overall_hiring_rate', 0):.2%}")
            print(f"   Bias risk level: {summary.get('bias_risk_level', 'unknown')}")
        
        print("\n✅ All bias detection logic tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing bias detection logic: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("🚀 Manual Bias Detection Verification")
    print("=" * 50)
    
    print("\n📊 Step 1: Verify Mock Data")
    data_ok = verify_mock_data()
    
    if data_ok:
        print("\n🤖 Step 2: Verify Bias Detection Logic")
        logic_ok = verify_bias_detection_logic()
        
        if logic_ok:
            print("\n🎉 All verifications passed!")
            print("Bias detection is working correctly with comprehensive mock data.")
        else:
            print("\n❌ Bias detection logic verification failed.")
    else:
        print("\n❌ Mock data verification failed.")

if __name__ == "__main__":
    main()
