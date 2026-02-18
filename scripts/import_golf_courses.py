import requests
import json
import sys

API_URL = "http://localhost:8000/api/admin/import-osm"

def import_courses():
    print("--- Golf Course Importer ---")
    print("This script triggers the backend to fetch golf courses from OpenStreetMap.")
    
    print("1. Import by Region Name (e.g., 'Michigan', 'Detroit')")
    print("2. Import by Coordinates")
    
    choice = input("Enter choice (1 or 2): ").strip()

    if choice == "1":
        region = input("Enter Region Name: ").strip()
        if not region:
            print("Region name is required.")
            return
        payload = {"region": region}
    else:
        try:
            lat = float(input("Enter Latitude (e.g., 36.57 for Pebble Beach): "))
            lng = float(input("Enter Longitude (e.g., -121.95): "))
            radius = int(input("Enter Radius in miles (default 10): ") or 10)
            payload = {
                "lat": lat,
                "lng": lng,
                "radius_miles": radius
            }
        except ValueError:
            print("Invalid input. Please enter numbers.")
            return

    print(f"\nSending request to {API_URL}...")
    try:
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Success!")
            print(f"Message: {data.get('message')}")
            print(f"Courses Imported: {data.get('imported_count')}")
        else:
            print(f"\n❌ Error {response.status_code}:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to the server.")
        print("Make sure your backend is running: 'python -m uvicorn app:app --reload' in the server/ directory.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    import_courses()
