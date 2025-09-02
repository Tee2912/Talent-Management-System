#!/usr/bin/env python3
"""
Debug script to test AI orchestrator directly
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import json
import pandas as pd
from backend.services.ai_orchestrator import AIOrchestrator

def test_ai_orchestrator():
    print("🔍 Testing AI Orchestrator directly...")
    
    # Load candidates data
    try:
        with open('backend/candidates.json', 'r') as f:
            candidates_data = json.load(f)
        print(f"✅ Loaded {len(candidates_data)} candidates")
    except Exception as e:
        print(f"❌ Error loading candidates: {e}")
        return
    
    # Initialize AI orchestrator
    try:
        orchestrator = AIOrchestrator()
        print("✅ AI Orchestrator initialized")
    except Exception as e:
        print(f"❌ Error initializing AI orchestrator: {e}")
        return
    
    # Test demographic bias analysis
    try:
        print("\n🔍 Testing demographic bias analysis...")
        result = orchestrator.bias_engine.analyze_demographic_bias(
            candidates_data, 
            'gender'
        )
        
        print("📊 Bias Analysis Result:")
        print(json.dumps(result, indent=2))
        
        # Check for NaN values
        def check_nan_recursive(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    check_nan_recursive(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    check_nan_recursive(item, f"{path}[{i}]")
            elif isinstance(obj, float):
                if str(value).lower() == 'nan':
                    print(f"⚠️ Found NaN at: {path}")
            elif isinstance(obj, str):
                if str(value).lower() == 'nan':
                    print(f"⚠️ Found NaN string at: {path}")
        
        print("\n🔍 Checking for NaN values in result...")
        check_nan_recursive(result)
        
    except Exception as e:
        print(f"❌ Error in bias analysis: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ai_orchestrator()
