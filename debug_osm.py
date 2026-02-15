import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

lat = 36.5698
lng = -121.9510
radius_meters = 16093 # 10 miles

overpass_query = f"""
[out:json][timeout:25];
(
  way["leisure"="golf_course"](around:{radius_meters},{lat},{lng});
  relation["leisure"="golf_course"](around:{radius_meters},{lat},{lng});
);
out center tags;
"""

print(f"Query:\n{overpass_query}")

try:
    response = requests.get(OVERPASS_URL, params={'data': overpass_query})
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(f"Error Response: {response.text}")
    else:
        data = response.json()
        print(f"Elements: {len(data.get('elements', []))}")
        if len(data.get('elements', [])) > 0:
            print(f"Sample: {data['elements'][0]}")
except Exception as e:
    print(f"Exception: {e}")
