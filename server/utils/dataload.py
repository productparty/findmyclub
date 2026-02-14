import os
from pathlib import Path
from dotenv import load_dotenv
import requests
import pandas as pd
from supabase import create_client
from datetime import datetime
import time

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Configuration from environment
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
API_KEY = os.getenv("GOLF_API_KEY")

# Validate required variables
if not all([SUPABASE_URL, SUPABASE_KEY, API_KEY]):
    raise ValueError(
        "Missing required environment variables: "
        "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GOLF_API_KEY must be set"
    )

API_BASE = 'https://www.golfapi.io/api/v2.3'
API_ENDPOINTS = {
    'clubs': '/clubs',
    'club_detail': '/clubs/{club_id}',
    'courses': '/courses',
    'course_detail': '/courses/{course_id}',
    'coordinates': '/coordinates/{course_id}'
}

# Initialize Supabase client and logging list
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
results = []

# Headers now use Bearer token as the documentation specifies
headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Accept': 'application/json'
}

def log_result(status, message, data=None):
    results.append({
        'timestamp': datetime.now().isoformat(),
        'endpoint': API_BASE,
        'status': status,
        'message': message,
        'data': str(data)[:500]  # truncate long data
    })

def export_to_excel():
    df = pd.DataFrame(results)
    filename = f"api_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    with pd.ExcelWriter(filename) as writer:
        df.to_excel(writer, sheet_name='API Audit', index=False)
        
        # Optionally, add a sheet with raw JSON responses if desired.
        # Here we add a sheet for clubs if available.
        clubs_logs = [r for r in results if r['status'] == 'success' and '/clubs' in r['message']]
        if clubs_logs:
            clubs_df = pd.DataFrame(clubs_logs)
            clubs_df.to_excel(writer, sheet_name='Clubs Logs', index=False)
    
    print(f"Results exported to {filename}")

def fetch_paginated(endpoint_key, params=None):
    page = 1
    all_data = []
    
    while True:
        try:
            query_params = {
                'page': page,
                'per_page': 200
            }
            if params:
                query_params.update(params)
            response = requests.get(
                f'{API_BASE}{API_ENDPOINTS[endpoint_key]}',
                headers=headers,
                params=query_params,
                timeout=30
            )
            
            if response.status_code != 200:
                log_result('error', f'{endpoint_key} status {response.status_code}', {
                    'response': response.text
                })
                break

            data = response.json()
            # Handle both clubs and courses responses
            items = data.get('clubs') or data.get('courses')
            if not items:
                break

            all_data.extend(items)
            log_result('success', f'Fetched {endpoint_key} page {page}', data)
            page += 1

        except Exception as e:
            log_result('error', f'Exception: {str(e)}', {'endpoint': endpoint_key})
            break
            
    return all_data

def fetch_and_store_courses():
    # Fetch all clubs with their courses in one go
    clubs = fetch_paginated('clubs', {
        'country': 'usa',
        'measureUnit': 'mi',
        'per_page': 200  # Max allowed by API
    })
    
    course_data = []
    for club in clubs:
        # Store all relevant club info with each course
        course_data.extend([{
            'course_id': course.get('courseID'),
            'course_name': course.get('courseName'),
            'num_holes': course.get('numHoles'),
            'has_gps': course.get('hasGPS'),
            'club_id': club.get('clubID'),  # API's club ID
            'club_name': club.get('clubName'),
            'club_city': club.get('city'),
            'club_state': club.get('state'),
            'club_country': club.get('country'),
            'club_address': club.get('address'),
            'club_lat': club.get('latitude'),
            'club_lng': club.get('longitude')
        } for course in club.get('courses', [])])

    # Batch insert all courses with their club info
    if course_data:
        response = supabase.table('golfcourse').insert(course_data, upsert=True, on_conflict='course_id').execute()
        log_result('success', f'Inserted/updated {len(course_data)} courses', response)
    else:
        log_result('warning', 'No courses found in API response')

def test_api():
    try:
        params = {
            'city': 'pebble',
            'country': 'usa',
            'lat': '36.569',
            'lng': '-121.949',
            'measureUnit': 'km'
        }
        response = requests.get(
            f"{API_BASE}{API_ENDPOINTS['clubs']}",
            headers=headers,
            params=params,
            timeout=10
        )
        print(f"/clubs response: {response.status_code}")
        print(f"/clubs response content: {response.text[:200]}...")
        if response.status_code == 200:
            log_result('success', '/clubs API connection test', response.json())
        else:
            log_result('error', f'/clubs status {response.status_code}', {'response': response.text})
    except Exception as e:
        print(f"Connection error: {str(e)}")
        log_result('error', f'Exception: {str(e)}')

def fetch_michigan_courses():
    # First get all Michigan courses
    courses = fetch_paginated('courses', {
        'state': 'MI',
        'country': 'usa',
        'measureUnit': 'mi',
        'per_page': 200
    })
    
    course_data = []
    for course in courses:
        # Get detailed course info
        try:
            course_detail_response = requests.get(
                f"{API_BASE}/courses/{course.get('courseID')}",
                headers=headers,
                timeout=30
            )
            
            if course_detail_response.status_code == 200:
                course_detail = course_detail_response.json()
                
                # Combine basic and detailed course data
                course_entry = {
                    # Basic course and club info
                    'course_id': course.get('courseID'),
                    'course_name': course.get('courseName'),
                    'num_holes': course.get('numHoles'),
                    'has_gps': course.get('hasGPS'),
                    'club_id': course.get('clubID'),
                    'club_name': course.get('clubName'),
                    'address': course.get('address'),
                    'city': course.get('city'),
                    'state': course.get('state'),
                    'zip_code': course.get('postalCode'),
                    'country': course.get('country'),
                    'latitude': course.get('latitude'),
                    'longitude': course.get('longitude'),
                    
                    # Additional details from course/{id} endpoint
                    'website': course_detail.get('website'),
                    'phone': course_detail.get('telephone'),
                    'measure_unit': course_detail.get('measure'),
                    'num_coordinates': course_detail.get('numCoordinates'),
                    'pars_men': str(course_detail.get('parsMen')),
                    'pars_women': str(course_detail.get('parsWomen')),
                    'indexes_men': str(course_detail.get('indexesMen')),
                    'indexes_women': str(course_detail.get('indexesWomen')),
                }
                
                # Add tee information
                tees = course_detail.get('tees', [])
                if tees:
                    # Create separate columns for each tee's data
                    for i, tee in enumerate(tees):
                        prefix = f'tee_{i+1}'
                        course_entry.update({
                            f'{prefix}_name': tee.get('teeName'),
                            f'{prefix}_color': tee.get('teeColor'),
                            f'{prefix}_rating_men': tee.get('courseRatingMen'),
                            f'{prefix}_slope_men': tee.get('slopeMen'),
                            f'{prefix}_rating_women': tee.get('courseRatingWomen'),
                            f'{prefix}_slope_women': tee.get('slopeWomen'),
                            # Add individual hole lengths
                            **{f'{prefix}_length_{j+1}': tee.get(f'length{j+1}') 
                               for j in range(18) if tee.get(f'length{j+1}')}
                        })
                
                course_data.append(course_entry)
                print(f"Processed course: {course.get('courseName')}")
            else:
                print(f"Failed to get details for course {course.get('courseName')}: {course_detail_response.status_code}")
                
        except Exception as e:
            print(f"Error processing course {course.get('courseName')}: {str(e)}")
            continue
    
    # Create DataFrame and export to Excel
    if course_data:
        df = pd.DataFrame(course_data)
        filename = f"michigan_courses_detailed_{datetime.now().strftime('%Y%m%d')}.xlsx"
        df.to_excel(filename, index=False)
        print(f"Exported {len(course_data)} courses to {filename}")
    else:
        print("No courses found for Michigan")

def test_fetch_one_michigan_course():
    print("\nTesting /courses endpoint for Michigan...")
    print(f"Using API key: {API_KEY[:8]}...")  # Print first 8 chars of key
    
    # Use consistent headers
    auth_headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Accept': 'application/json'
    }
    
    print("\nTesting API access...")
    test_response = requests.get(
        f"{API_BASE}/clubs",
        headers=auth_headers,  # Use same headers
        params={'per_page': 1},  # Minimal request
        timeout=30
    )
    
    print(f"Initial test response: {test_response.status_code}")
    print(f"Response: {test_response.text[:200]}")
    
    if test_response.status_code == 401:
        print("\nAPI authentication failed. Please verify your API key is correct and active.")
        return
        
    # Wait a second before next request
    time.sleep(1)
    
    # Now try Michigan courses
    michigan_response = requests.get(
        f"{API_BASE}/courses",
        headers=auth_headers,  # Use same headers
        params={
            'state': 'MI',  # Try MI instead of Michigan
            'country': 'USA',
            'measureUnit': 'mi',
            'per_page': 1
        },
        timeout=30
    )
    
    print(f"\nMichigan search response: {michigan_response.status_code}")
    print(f"Content: {michigan_response.text[:200]}")

if __name__ == "__main__":
    # Test with one course first
    test_fetch_one_michigan_course()
    
    # If the test looks good, uncomment this to fetch all courses
    # fetch_michigan_courses()