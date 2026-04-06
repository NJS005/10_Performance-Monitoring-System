import json
import urllib.request
import urllib.parse
import urllib.error
import sys

API_KEY = "AIzaSyBCOWW_EA-c54RUkN5QJoGmTPepixFRIRI"

def list_models():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    with open("models2.txt", "w", encoding="utf-8") as f:
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                f.write(json.dumps(data, indent=2))
        except urllib.error.HTTPError as e:
            f.write(f"HTTP Error: {e.code} {e.reason}\n")
            f.write(e.read().decode())
        except Exception as e:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    list_models()
