import { useQueryClient } from '@tanstack/react-query';
import { clubsApi } from '../api/clubs';
import { useGeocode } from './useGeocode';

/**
 * Hook for prefetching club data
 * Improves perceived performance by loading data before user needs it
 */
export const useClubPrefetch = () => {
  const queryClient = useQueryClient();
  const { geocodeBatch } = useGeocode();

  /**
   * Prefetch club detail data
   * Call when user hovers over a club card or scrolls near it
   */
  const prefetchClubDetail = async (clubId: string, token?: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['club', clubId],
      queryFn: async () => {
        const club = await clubsApi.getClubById(clubId, token);
        
        // Prefetch coordinates if missing
        if ((!club.latitude || !club.longitude) && club.zip_code) {
          const coords = await geocodeBatch([club.zip_code]);
          const coord = coords.get(club.zip_code);
          if (coord) {
            return {
              ...club,
              latitude: coord.latitude,
              longitude: coord.longitude,
            };
          }
        }
        
        return club;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes for detail pages
    });
  };

  /**
   * Prefetch search results for a zip code
   * Useful for prefetching common searches
   */
  const prefetchSearch = async (
    zipCode: string,
    radius: string,
    token?: string
  ) => {
    await queryClient.prefetchQuery({
      queryKey: ['clubs', 'search', zipCode, radius],
      queryFn: () => clubsApi.searchClubs({ zip_code: zipCode, radius }, token),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  return {
    prefetchClubDetail,
    prefetchSearch,
  };
};

