import urllib.request
import urllib.error
import json

def test_endpoint(url):
    try:
        print(f"Testing: {url}")
        with urllib.request.urlopen(url) as response:
            status = response.getcode()
            content = response.read().decode('utf-8')
            print(f"  Status: {status}")
            if status == 200:
                try:
                    data = json.loads(content)
                    if isinstance(data, list):
                        print(f"  ✅ SUCCESS - List with {len(data)} items")
                    else:
                        print(f"  ✅ SUCCESS - Response keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
                except:
                    print(f"  ✅ SUCCESS - Text response ({len(content)} chars)")
            else:
                print(f"  ❌ Unexpected status: {status}")
    except urllib.error.HTTPError as e:
        print(f"  ❌ HTTP Error {e.code}: {e.reason}")
    except Exception as e:
        print(f"  💥 Error: {e}")
    print()

# Test the problematic endpoints
base_url = "http://127.0.0.1:8000"

print("🚀 Testing HireIQ Pro API Endpoints")
print("=" * 40)

# Basic endpoints
test_endpoint(f"{base_url}/")
test_endpoint(f"{base_url}/health")

# Problematic endpoints from logs
test_endpoint(f"{base_url}/api/candidates")  # 404
test_endpoint(f"{base_url}/api/v1/candidates")  # Should work
test_endpoint(f"{base_url}/candidates")  # 307
test_endpoint(f"{base_url}/api/v1/interviews")  # 307
test_endpoint(f"{base_url}/api/v1/interviews/")  # With trailing slash
test_endpoint(f"{base_url}/api/v1/interviews/templates")  # 422

print("🏁 Testing complete!")
