import { supabase } from '../lib/supabase';
import { GolferProfileSchema } from '../schemas/profile';
import type { GolferProfile } from '../schemas/profile';

/**
 * API functions for golfer profile operations
 * Wraps Supabase calls with Zod validation
 */
export const profileApi = {
  /**
   * Get golfer profile by user ID
   */
  async getProfile(userId: string): Promise<GolferProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist yet
        return null;
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Validate with Zod
    return GolferProfileSchema.parse(data);
  },

  /**
   * Create a new golfer profile
   */
  async createProfile(profile: Partial<GolferProfile>): Promise<GolferProfile> {
    // Validate input
    const validated = GolferProfileSchema.partial().parse(profile);

    const { data, error } = await supabase
      .from('profiles')
      .insert([validated])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return GolferProfileSchema.parse(data);
  },

  /**
   * Update golfer profile
   */
  async updateProfile(userId: string, updates: Partial<GolferProfile>): Promise<GolferProfile> {
    // Validate input
    const validated = GolferProfileSchema.partial().parse(updates);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          ...validated,
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return GolferProfileSchema.parse(data);
  },
};

