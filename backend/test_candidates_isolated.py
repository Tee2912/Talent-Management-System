#!/usr/bin/env python3
"""Minimal test to isolate the candidates router issue"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

print("=== Testing candidates router in isolation ===")

try:
    # Import just the candidates router
    from app.api.candidates import router as candidates_router
    print("✅ Successfully imported candidates router")
    
    # Create a minimal FastAPI app
    test_app = FastAPI(title="Test App")
    
    # Add CORS
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include the candidates router
    test_app.include_router(candidates_router, prefix="/api/v1/candidates", tags=["candidates"])
    
    print("✅ Successfully included candidates router")
    
    # Check routes
    print("\n=== Routes in test app ===")
    for route in test_app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            print(f"{route.methods} {route.path}")
    
    # Test the endpoints by calling them directly
    print("\n=== Testing get_candidates function directly ===")
    from app.api.candidates import get_candidates, load_candidates
    
    # Test load_candidates
    candidates = load_candidates()
    print(f"load_candidates() returned {len(candidates)} candidates")
    
    if candidates:
        print(f"First candidate keys: {list(candidates[0].keys())}")
    
    print("✅ Direct function calls work")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

if __name__ == "__main__":
    print("\n=== Starting test server ===")
    import uvicorn
    uvicorn.run(test_app, host="127.0.0.1", port=8001)
