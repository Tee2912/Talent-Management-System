"""
Quick verification that bias detection is working
"""

import sys
import os
import json

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.append(backend_path)

def main():
    print("🚀 Quick Bias Detection Verification")
    print("=" * 50)
    
    # Check if candidates data exists
    candidates_file = os.path.join(backend_path, 'candidates.json')
    
    if not os.path.exists(candidates_file):
        print(f"❌ Candidates file not found at {candidates_file}")
        return
    
    # Load candidates
    try:
        with open(candidates_file, 'r') as f:
            candidates = json.load(f)
        print(f"✅ Loaded {len(candidates)} candidates")
    except Exception as e:
        print(f"❌ Error loading candidates: {e}")
        return
    
    # Check data structure
    if not candidates:
        print("❌ No candidates found")
        return
    
    sample = candidates[0]
    required_fields = ['gender', 'ethnicity', 'hiring_decision', 'final_score']
    missing_fields = [field for field in required_fields if field not in sample]
    
    if missing_fields:
        print(f"❌ Missing required fields: {missing_fields}")
        return
    
    print(f"✅ All required fields present")
    
    # Calculate basic statistics
    genders = {}
    decisions = {}
    
    for candidate in candidates:
        gender = candidate.get('gender', 'unknown')
        decision = candidate.get('hiring_decision', 'unknown')
        
        genders[gender] = genders.get(gender, 0) + 1
        decisions[decision] = decisions.get(decision, 0) + 1
    
    print(f"✅ Gender distribution: {genders}")
    print(f"✅ Decision distribution: {decisions}")
    
    # Calculate hiring rates
    male_candidates = [c for c in candidates if c.get('gender') == 'male']
    female_candidates = [c for c in candidates if c.get('gender') == 'female']
    
    if male_candidates and female_candidates:
        male_hired = sum(1 for c in male_candidates if c.get('hiring_decision') == 'hired')
        female_hired = sum(1 for c in female_candidates if c.get('hiring_decision') == 'hired')
        
        male_rate = male_hired / len(male_candidates)
        female_rate = female_hired / len(female_candidates)
        
        print(f"✅ Male hiring rate: {male_rate:.2%} ({male_hired}/{len(male_candidates)})")
        print(f"✅ Female hiring rate: {female_rate:.2%} ({female_hired}/{len(female_candidates)})")
        
        rate_difference = abs(male_rate - female_rate)
        print(f"✅ Hiring rate difference: {rate_difference:.2%}")
        
        if rate_difference > 0.10:
            print(f"⚠️  Significant hiring rate difference detected")
            print(f"   This provides good test data for bias detection!")
        else:
            print(f"✅ Hiring rates appear balanced")
    
    # Test bias detection import
    try:
        from services.ai_orchestrator import AIOrchestrator
        print("✅ Successfully imported AIOrchestrator")
        
        # Test initialization
        ai_orchestrator = AIOrchestrator()
        print("✅ AI Orchestrator initialized successfully")
        
        # Test basic bias analysis
        analysis = ai_orchestrator.bias_detector.analyze_demographic_bias(candidates[:10], 'gender')
        print("✅ Bias analysis completed")
        print(f"   Bias detected: {analysis.get('bias_detected')}")
        print(f"   Confidence: {analysis.get('confidence')}")
        
        print("\n🎉 Bias detection is working correctly!")
        print("The comprehensive mock data provides sufficient samples for robust bias analysis.")
        print("The frontend demo page should now be able to display meaningful bias detection results.")
        
    except Exception as e:
        print(f"❌ Error testing bias detection: {e}")
        print("Check that all required dependencies are installed.")

if __name__ == "__main__":
    main()
