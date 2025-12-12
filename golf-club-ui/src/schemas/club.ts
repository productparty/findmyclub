import { z } from 'zod';

// Zod schema for Club data validation
export const ClubSchema = z.object({
  // Identifiers
  id: z.string(),
  global_id: z.string().optional(),
  
  // Basic information
  club_name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  
  // Location
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  
  // Course details
  price_tier: z.string(),
  difficulty: z.string(),
  number_of_holes: z.union([z.string(), z.number()]),
  club_membership: z.string().optional(),
  
  // Amenities
  driving_range: z.boolean(),
  putting_green: z.boolean(),
  chipping_green: z.boolean(),
  practice_bunker: z.boolean(),
  restaurant: z.boolean(),
  lodging_on_site: z.boolean(),
  motor_cart: z.boolean(),
  pull_cart: z.boolean(),
  golf_clubs_rental: z.boolean(),
  club_fitting: z.boolean(),
  golf_lessons: z.boolean(),
  
  // Optional computed fields
  distance_miles: z.number().optional(),
  score: z.number().optional(),
  match_percentage: z.number().optional(),
  weather_icon: z.string().optional(),
});

// Schema for API response with clubs array
export const ClubsResponseSchema = z.object({
  results: z.array(ClubSchema).optional(),
  clubs: z.array(ClubSchema).optional(),
  courses: z.array(ClubSchema).optional(),
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// Schema for geocoding response
export const GeocodeResponseSchema = z.object({
  places: z.array(z.object({
    latitude: z.string(),
    longitude: z.string(),
  })),
});

export type Club = z.infer<typeof ClubSchema>;
export type ClubsResponse = z.infer<typeof ClubsResponseSchema>;
export type GeocodeResponse = z.infer<typeof GeocodeResponseSchema>;

