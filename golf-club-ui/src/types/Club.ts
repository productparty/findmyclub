// Canonical Club type definition
export interface Club {
  // Identifiers
  id: string;
  global_id?: string;
  
  // Basic information
  club_name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  
  // Location
  latitude?: number;
  longitude?: number;
  
  // Course details
  price_tier: string;
  difficulty: string;
  number_of_holes: string | number;
  club_membership?: string;
  
  // Amenities
  driving_range: boolean;
  putting_green: boolean;
  chipping_green: boolean;
  practice_bunker: boolean;
  restaurant: boolean;
  lodging_on_site: boolean;
  motor_cart: boolean;
  pull_cart: boolean;
  golf_clubs_rental: boolean;
  club_fitting: boolean;
  golf_lessons: boolean;
  
  // Optional computed fields
  distance_miles?: number;
  score?: number;
  match_percentage?: number;
  weather_icon?: string;
}

// Extended types for specific use cases
export interface FavoriteRecord {
  golfclub_id: string;
  profile_id: string;
  golfclub: Club;
}

export interface FavoriteClub extends Club {
  golfclub_id: string;
  match_percentage: number;
} 