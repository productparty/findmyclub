import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoritesApi } from '../api/favorites';
import { useAuth } from './AuthContext';
import { analytics } from '../utils/analytics';
import type { FavoriteClub, Club } from '../types/Club';

interface FavoritesContextType {
  favorites: string[];
  favoriteClubs: FavoriteClub[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (clubId: string) => Promise<void>;
  isFavorite: (clubId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteClubs, setFavoriteClubs] = useState<FavoriteClub[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!session?.user?.id) {
      setFavorites([]);
      setFavoriteClubs([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get favorite IDs using API layer
      const favoriteIds = await favoritesApi.getFavoriteIds(session.user.id);
      setFavorites(favoriteIds);
      
      if (favoriteIds.length === 0) {
        setFavoriteClubs([]);
        setIsLoading(false);
        return;
      }

      // Get full club details using API layer
      const clubs = await favoritesApi.getFavoriteClubs(session.user.id);
      
      // Ensure coordinates for clubs that don't have them
      const clubsWithCoordinates = await Promise.all(
        clubs.map(async (club) => {
          // Skip if club already has valid coordinates
          const lat = (club as Club).latitude ?? null;
          const lng = (club as Club).longitude ?? null;
          
          if (
            lat && 
            lng && 
            !isNaN(Number(lat)) && 
            !isNaN(Number(lng)) &&
            Math.abs(Number(lat)) <= 90 && 
            Math.abs(Number(lng)) <= 180
          ) {
            return club;
          }
          
          // Try to get coordinates from zip code
          const zipCode = (club as Club).zip_code;
          if (zipCode) {
            try {
              const zipResponse = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
              const zipData = await zipResponse.json();
              
              if (zipData.places && zipData.places.length > 0) {
                const latitude = Number(zipData.places[0].latitude);
                const longitude = Number(zipData.places[0].longitude);
                
                return {
                  ...club,
                  latitude,
                  longitude,
                } as FavoriteClub;
              }
            } catch (err) {
              console.error(`Failed to get coordinates for zip code ${zipCode}:`, err);
            }
          }
          
          return club;
        })
      );
      
      setFavoriteClubs(clubsWithCoordinates);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (clubId: string) => {
    if (!session?.user?.id) return;

    const isFav = favorites.includes(clubId);
    const previousFavorites = [...favorites];
    const previousFavoriteClubs = [...favoriteClubs];
    
    // Optimistic update - update UI immediately
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== clubId));
      setFavoriteClubs(prev => prev.filter(club => (club as Club).id !== clubId));
    } else {
      setFavorites(prev => [...prev, clubId]);
    }

    try {
      if (isFav) {
        // Remove from favorites using API layer
        await favoritesApi.removeFavorite(session.user.id, clubId);
        analytics.favoriteRemoved(clubId);
      } else {
        // Add to favorites using API layer
        await favoritesApi.addFavorite(session.user.id, clubId);
        analytics.favoriteAdded(clubId);
        
        // Fetch the full club details for the newly added favorite
        await fetchFavorites();
      }
    } catch (err) {
      // Rollback optimistic update on error
      setFavorites(previousFavorites);
      setFavoriteClubs(previousFavoriteClubs);
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      analytics.error('favorite_toggle_failed', { club_id: clubId });
    }
  };

  const isFavorite = (clubId: string) => {
    return favorites.includes(clubId);
  };

  // Fetch favorites when user session changes
  useEffect(() => {
    fetchFavorites();
  }, [session?.user?.id]);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      favoriteClubs, 
      isLoading, 
      error, 
      fetchFavorites, 
      toggleFavorite, 
      isFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
