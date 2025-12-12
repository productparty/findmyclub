import { useState, useCallback } from 'react';
import { clubsApi } from '../api/clubs';
import { useGeocode } from './useGeocode';
import type { Club } from '../types/Club';

interface SearchFilters {
  zipCode: string;
  radius: string;
  preferred_price_range?: string;
  preferred_difficulty?: string;
  number_of_holes?: string;
  club_membership?: string;
  [key: string]: string | boolean | undefined;
}

interface UseClubSearchOptions {
  token?: string;
  onSuccess?: (clubs: Club[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for searching clubs with filters
 * Handles API calls, geocoding, and data transformation
 */
export const useClubSearch = (options: UseClubSearchOptions = {}) => {
  const { token, onSuccess, onError } = options;
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getClubCoordinates, geocodeBatch } = useGeocode();

  /**
   * Transform clubs data and add coordinates where missing
   */
  const transformClubs = useCallback(async (clubsData: Club[]): Promise<Club[]> => {
    // First, identify clubs that need geocoding
    const clubsNeedingGeocoding = clubsData.filter(
      (club) =>
        (!club.latitude || !club.longitude) &&
        club.zip_code
    );

    // Batch geocode if needed
    if (clubsNeedingGeocoding.length > 0) {
      const zipCodes = clubsNeedingGeocoding.map((c) => c.zip_code);
      const geocodeResults = await geocodeBatch(zipCodes);
      
      // Apply geocoded coordinates
      clubsData = clubsData.map((club) => {
        if (!club.latitude || !club.longitude) {
          const coords = geocodeResults.get(club.zip_code);
          if (coords) {
            return {
              ...club,
              latitude: coords.latitude,
              longitude: coords.longitude,
            };
          }
        }
        return club;
      });
    }

    // Ensure all clubs have valid coordinate types
    return clubsData.map((club) => ({
      ...club,
      latitude: club.latitude ?? null,
      longitude: club.longitude ?? null,
    }));
  }, [geocodeBatch]);

  /**
   * Search for clubs
   */
  const searchClubs = useCallback(async (filters: SearchFilters) => {
    if (!filters.zipCode) {
      setError('Please enter a zip code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build API filters
      const apiFilters: Record<string, string> = {
        zip_code: filters.zipCode,
        radius: filters.radius,
      };

      if (filters.preferred_price_range) {
        apiFilters.price_tier = filters.preferred_price_range;
      }
      if (filters.preferred_difficulty) {
        apiFilters.difficulty = filters.preferred_difficulty;
      }
      if (filters.number_of_holes) {
        apiFilters.number_of_holes = String(filters.number_of_holes);
      }
      if (filters.club_membership) {
        apiFilters.club_membership = String(filters.club_membership);
      }

      // Add boolean filters
      const booleanFilters = [
        'driving_range',
        'putting_green',
        'chipping_green',
        'practice_bunker',
        'restaurant',
        'lodging_on_site',
        'motor_cart',
        'pull_cart',
        'golf_clubs_rental',
        'club_fitting',
        'golf_lessons',
      ];

      booleanFilters.forEach((filter) => {
        if (filters[filter] === true) {
          apiFilters[filter] = 'true';
        }
      });

      // Fetch clubs from API
      const fetchedClubs = await clubsApi.searchClubs(apiFilters, token);
      
      // Transform and add coordinates
      const transformedClubs = await transformClubs(fetchedClubs);
      
      setClubs(transformedClubs);
      onSuccess?.(transformedClubs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search clubs');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [token, transformClubs, onSuccess, onError]);

  /**
   * Get recommendations
   */
  const getRecommendations = useCallback(async (zipCode: string, radius: string) => {
    if (!zipCode) {
      setError('Please enter a zip code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedClubs = await clubsApi.getRecommendations(zipCode, radius, token);
      const transformedClubs = await transformClubs(fetchedClubs);
      
      setClubs(transformedClubs);
      onSuccess?.(transformedClubs);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get recommendations');
      setError(error.message);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [token, transformClubs, onSuccess, onError]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setClubs([]);
    setError(null);
  }, []);

  return {
    clubs,
    isLoading,
    error,
    searchClubs,
    getRecommendations,
    clearResults,
  };
};

