import requests
import json

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def test_area_query(region_name):
    # Try a more specific query for state/city
    overpass_query = f"""
    [out:json][timeout:180];
    area["name"="{region_name}"]->.searchArea;
    (
      way["leisure"="golf_course"](area.searchArea);
      relation["leisure"="golf_course"](area.searchArea);
    );
    out center tags;
    """
    print(f"\n--- Querying for {region_name} ---")
    try:
        response = requests.get(OVERPASS_URL, params={'data': overpass_query})
        if response.status_code == 200:
            data = response.json()
            elements = data.get('elements', [])
            print(f"Found {len(elements)} elements")
            if len(elements) > 0:
                print(json.dumps(elements[0], indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_area_query("Michigan")
