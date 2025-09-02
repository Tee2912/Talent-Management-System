#!/usr/bin/env python3
"""Debug script to test candidates path resolution"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

print("=== Path Debug Information ===")
print(f"Current working directory: {os.getcwd()}")
print(f"Script location: {__file__}")
print(f"Backend directory: {backend_dir}")

# Test the path resolution logic from candidates.py
file_location = __file__
print(f"\nTesting path resolution:")
print(f"__file__: {file_location}")
print(f"dirname(__file__): {os.path.dirname(file_location)}")
print(f"dirname(dirname(__file__)): {os.path.dirname(os.path.dirname(file_location))}")
print(f"dirname(dirname(dirname(__file__))): {os.path.dirname(os.path.dirname(os.path.dirname(file_location)))}")

# Simulate the path from candidates.py
candidates_py_location = os.path.join(backend_dir, "app", "api", "candidates.py")
print(f"\nSimulating from candidates.py location: {candidates_py_location}")
print(f"dirname(candidates.py): {os.path.dirname(candidates_py_location)}")
print(f"dirname(dirname(candidates.py)): {os.path.dirname(os.path.dirname(candidates_py_location))}")
print(f"dirname(dirname(dirname(candidates.py))): {os.path.dirname(os.path.dirname(os.path.dirname(candidates_py_location)))}")

# Test the actual DATA_FILE path
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(candidates_py_location))), "candidates.json")
print(f"\nCalculated DATA_FILE path: {DATA_FILE}")
print(f"DATA_FILE exists: {os.path.exists(DATA_FILE)}")

if os.path.exists(DATA_FILE):
    print(f"DATA_FILE size: {os.path.getsize(DATA_FILE)} bytes")
    try:
        import json
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            print(f"Number of candidates in file: {len(data)}")
            if data:
                print(f"First candidate ID: {data[0].get('id', 'N/A')}")
    except Exception as e:
        print(f"Error reading file: {e}")

# Also test the expected location
expected_file = os.path.join(backend_dir, "candidates.json")
print(f"\nExpected file location: {expected_file}")
print(f"Expected file exists: {os.path.exists(expected_file)}")
