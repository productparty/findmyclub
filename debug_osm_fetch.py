import requests
import json

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def test_detroit():
    region = "Detroit"
    print(f"Querying Overpass for: {region}")
    
    overpass_query = f"""
    [out:json][timeout:300];
    area["name"="Michigan"]["admin_level"="4"]->.searchArea;
    (
      way["leisure"="golf_course"](area.searchArea);
      relation["leisure"="golf_course"](area.searchArea);
    );
    out center tags;
    """
    
    try:
        response = requests.get(OVERPASS_URL, params={'data': overpass_query})
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            elements = data.get('elements', [])
            print(f"Elements Found: {len(elements)}")
            if len(elements) > 0:
                print("First Element sample:")
                print(json.dumps(elements[0], indent=2))
        else:
            print("Error response text:")
            print(response.text)
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_detroit()
