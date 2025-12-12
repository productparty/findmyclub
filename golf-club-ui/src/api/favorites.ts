import { supabase } from '../lib/supabase';
import { ClubSchema } from '../schemas/club';
import type { Club, FavoriteClub } from '../types/Club';

/**
 * API functions for favorites operations
 * Wraps Supabase calls with Zod validation
 */
export const favoritesApi = {
  /**
   * Get all favorite club IDs for a user
   */
  async getFavoriteIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('golfclub_id')
      .eq('profile_id', userId);

    if (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }

    return data.map((fav: { golfclub_id: string }) => fav.golfclub_id);
  },

  /**
   * Get full favorite club details for a user
   */
  async getFavoriteClubs(userId: string): Promise<FavoriteClub[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, golfclub_id, golfclub:golfclub_id(*)')
      .eq('profile_id', userId);

    if (error) {
      throw new Error(`Failed to fetch favorite clubs: ${error.message}`);
    }

    // Transform and validate the data
    const clubs = data.map((item: any) => {
      const clubData = {
        id: item.golfclub_id,
        ...item.golfclub,
      };
      
      // Validate with Zod
      const validatedClub = ClubSchema.parse(clubData);
      
      return {
        ...validatedClub,
        golfclub_id: item.golfclub_id,
        match_percentage: 100, // Default for favorites
      } as FavoriteClub;
    });

    return clubs;
  },

  /**
   * Add a club to favorites
   */
  async addFavorite(userId: string, clubId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert([
        {
          profile_id: userId,
          golfclub_id: clubId,
        },
      ]);

    if (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
  },

  /**
   * Remove a club from favorites
   */
  async removeFavorite(userId: string, clubId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', userId)
      .eq('golfclub_id', clubId);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }
  },

  /**
   * Check if a club is favorited
   */
  async isFavorite(userId: string, clubId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('profile_id', userId)
      .eq('golfclub_id', clubId)
      .limit(1);

    if (error) {
      throw new Error(`Failed to check favorite: ${error.message}`);
    }

    return (data?.length ?? 0) > 0;
  },
};

