import json
import os

# Check if candidates.json exists and count candidates
candidates_file = "candidates.json"

if os.path.exists(candidates_file):
    with open(candidates_file, 'r') as f:
        candidates = json.load(f)
    print(f"Found {len(candidates)} candidates in {candidates_file}")
    
    # Show first candidate as example
    if candidates:
        print("\nFirst candidate:")
        print(json.dumps(candidates[0], indent=2))
else:
    print(f"No {candidates_file} file found!")
    
# Also test the API endpoint
try:
    import urllib.request
    import urllib.error
    
    print("\nTesting API endpoint...")
    url = "http://127.0.0.1:8000/api/v1/candidates"
    
    with urllib.request.urlopen(url) as response:
        status = response.getcode()
        content = response.read().decode('utf-8')
        
        print(f"API Status: {status}")
        
        if status == 200:
            api_candidates = json.loads(content)
            print(f"API returned {len(api_candidates)} candidates")
        else:
            print(f"API Error: {content}")
            
except Exception as e:
    print(f"Error testing API: {e}")
