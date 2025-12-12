import { useCallback } from 'react';
import { GeocodeResponseSchema } from '../schemas/club';

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Cache for geocoding results to avoid duplicate API calls
const geocodeCache = new Map<string, Coordinates>();

/**
 * Hook for geocoding zip codes to coordinates
 * Implements batching and caching for performance
 */
export const useGeocode = () => {
  /**
   * Geocode a single zip code
   */
  const geocodeZip = useCallback(async (zipCode: string): Promise<Coordinates | null> => {
    // Check cache first
    if (geocodeCache.has(zipCode)) {
      return geocodeCache.get(zipCode) || null;
    }

    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const validated = GeocodeResponseSchema.parse(data);
      
      if (validated.places && validated.places.length > 0) {
        const coords = {
          latitude: Number(validated.places[0].latitude),
          longitude: Number(validated.places[0].longitude),
        };
        
        // Cache the result
        geocodeCache.set(zipCode, coords);
        return coords;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to geocode zip code ${zipCode}:`, error);
      return null;
    }
  }, []);

  /**
   * Batch geocode multiple zip codes in parallel
   * Processes in batches of 5 to avoid rate limiting
   */
  const geocodeBatch = useCallback(async (
    zipCodes: string[],
    batchSize: number = 5
  ): Promise<Map<string, Coordinates>> => {
    const results = new Map<string, Coordinates>();
    const uniqueZipCodes = Array.from(new Set(zipCodes));
    
    // Process in batches
    for (let i = 0; i < uniqueZipCodes.length; i += batchSize) {
      const batch = uniqueZipCodes.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (zipCode) => {
          const coords = await geocodeZip(zipCode);
          if (coords) {
            return { zipCode, coords };
          }
          return null;
        })
      );
      
      batchResults.forEach((result) => {
        if (result) {
          results.set(result.zipCode, result.coords);
        }
      });
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < uniqueZipCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return results;
  }, [geocodeZip]);

  /**
   * Extract coordinates from club data, using geocoding if needed
   */
  const getClubCoordinates = useCallback(async (
    club: any
  ): Promise<{ latitude: number | null; longitude: number | null }> => {
    let latitude: number | null = null;
    let longitude: number | null = null;
    
    // Try existing coordinates first
    if (club.latitude !== undefined && club.longitude !== undefined) {
      latitude = typeof club.latitude === 'string' ? parseFloat(club.latitude) : club.latitude;
      longitude = typeof club.longitude === 'string' ? parseFloat(club.longitude) : club.longitude;
    } else if (club.lat !== undefined && club.lng !== undefined) {
      latitude = typeof club.lat === 'string' ? parseFloat(club.lat) : club.lat;
      longitude = typeof club.lng === 'string' ? parseFloat(club.lng) : club.lng;
    } else if (club.coordinates && Array.isArray(club.coordinates) && club.coordinates.length === 2) {
      longitude = typeof club.coordinates[0] === 'string' ? parseFloat(club.coordinates[0]) : club.coordinates[0];
      latitude = typeof club.coordinates[1] === 'string' ? parseFloat(club.coordinates[1]) : club.coordinates[1];
    }
    
    // Validate coordinates
    if (
      latitude !== null && 
      longitude !== null &&
      !isNaN(latitude) && 
      !isNaN(longitude) &&
      Math.abs(latitude) <= 90 && 
      Math.abs(longitude) <= 180
    ) {
      return { latitude, longitude };
    }
    
    // Try geocoding if zip code available
    if (club.zip_code) {
      const coords = await geocodeZip(club.zip_code);
      if (coords) {
        return coords;
      }
    }
    
    return { latitude: null, longitude: null };
  }, [geocodeZip]);

  return {
    geocodeZip,
    geocodeBatch,
    getClubCoordinates,
  };
};

