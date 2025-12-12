import { apiClient } from './client';
import { ClubsResponseSchema, ClubSchema } from '../schemas/club';
import type { Club } from '../types/Club';

/**
 * API functions for club-related operations
 */
export const clubsApi = {
  /**
   * Search for clubs by filters
   */
  async searchClubs(
    filters: {
      zip_code: string;
      radius: string;
      limit?: string;
      price_tier?: string;
      difficulty?: string;
      number_of_holes?: string;
      club_membership?: string;
      [key: string]: string | undefined;
    },
    token?: string
  ): Promise<Club[]> {
    const params: Record<string, string> = {
      zip_code: filters.zip_code,
      radius: filters.radius,
      limit: filters.limit || '100',
    };

    // Add optional filters
    if (filters.price_tier) params.price_tier = filters.price_tier;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.number_of_holes) params.number_of_holes = filters.number_of_holes;
    if (filters.club_membership) params.club_membership = filters.club_membership;

    // Add boolean filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === 'true') {
        params[key] = 'true';
      }
    });

    const data = await apiClient.get<unknown>(`/api/find_clubs/`, {
      token,
      params,
    });

    const validated = ClubsResponseSchema.parse(data);
    const clubs = validated.results || validated.clubs || validated.courses || [];
    
    return clubs.map((club) => ClubSchema.parse(club));
  },

  /**
   * Get club recommendations
   */
  async getRecommendations(
    zipCode: string,
    radius: string,
    token?: string
  ): Promise<Club[]> {
    const data = await apiClient.get<unknown>(`/api/get_recommendations/`, {
      token,
      params: {
        zip_code: zipCode,
        radius,
        limit: '25',
      },
    });

    const validated = ClubsResponseSchema.parse(data);
    const clubs = validated.results || validated.clubs || validated.courses || [];
    
    return clubs.map((club) => ClubSchema.parse(club));
  },

  /**
   * Get a single club by ID
   */
  async getClubById(clubId: string, token?: string): Promise<Club> {
    const data = await apiClient.get<unknown>(`/api/clubs/${clubId}`, {
      token,
    });

    return ClubSchema.parse(data);
  },
};

