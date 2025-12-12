// Re-export types from Zod schemas
export type { Club, ClubsResponse, GeocodeResponse } from '../schemas/club';

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