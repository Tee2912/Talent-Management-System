#!/usr/bin/env python3
"""Test the FastAPI routes directly to debug the issue"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    from app.main import app
    print("✅ Successfully imported app")
    
    # Print all routes
    print("\n=== All Registered Routes ===")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"{route.methods} {route.path}")
    
    # Test if candidates router was included
    candidates_routes = [route for route in app.routes if hasattr(route, 'path') and 'candidates' in route.path]
    print(f"\n=== Candidates Routes Found: {len(candidates_routes)} ===")
    for route in candidates_routes:
        if hasattr(route, 'methods'):
            print(f"{route.methods} {route.path}")
    
    # Check for prefix conflicts
    analytics_routes = [route for route in app.routes if hasattr(route, 'path') and 'analytics' in route.path]
    print(f"\n=== Analytics Routes Found: {len(analytics_routes)} ===")
    for route in analytics_routes[:3]:  # Show first 3
        if hasattr(route, 'methods'):
            print(f"{route.methods} {route.path}")

except Exception as e:
    print(f"❌ Error importing app: {e}")
    import traceback
    traceback.print_exc()
