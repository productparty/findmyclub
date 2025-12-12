import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Grid, Alert, CircularProgress } from '@mui/material';
import ClubCard from '../../components/ClubCard';
import PageLayout from '../../components/PageLayout';
import { InteractiveMap } from '../../components/InteractiveMap';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import type { FavoriteClub } from '../../types/Club';
import { useFavorites } from '../../hooks/useFavorites';
import { Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';

interface GolfClubData {
  id: string;
  club_name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price_tier: string;
  difficulty: string;
  number_of_holes: string;
}

interface FavoriteResponse {
  golfclub_id: string;
  golfclub: GolfClubData;
}

const isValidCoordinate = (lat: number, lng: number): boolean =>
  !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const isValidGolfClub = (club: unknown): club is FavoriteClub => {
  if (!club || typeof club !== 'object') return false;
  const c = club as any;
  return (
    typeof c.id === 'string' &&
    typeof c.club_name === 'string' &&
    (typeof c.latitude === 'number' || c.latitude === null) &&
    (typeof c.longitude === 'number' || c.longitude === null)
  );
};

const calculateMapBounds = (clubs: any[]) => {
  const validClubs = clubs.filter(club => 
    club.latitude && club.longitude && 
    !isNaN(Number(club.latitude)) && !isNaN(Number(club.longitude)) &&
    Math.abs(Number(club.latitude)) <= 90 && Math.abs(Number(club.longitude)) <= 180
  );
  
  if (validClubs.length === 0) return { center: [39.8283, -98.5795], zoom: 4 };
  
  if (validClubs.length === 1) {
    return { 
      center: [Number(validClubs[0].latitude), Number(validClubs[0].longitude)], 
      zoom: 10 
    };
  }
  
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  
  validClubs.forEach(club => {
    const lat = Number(club.latitude);
    const lng = Number(club.longitude);
    
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });
  
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoom = 10;
  if (maxDiff > 10) zoom = 3;
  else if (maxDiff > 5) zoom = 4;
  else if (maxDiff > 3) zoom = 5;
  else if (maxDiff > 1) zoom = 6;
  else if (maxDiff > 0.5) zoom = 7;
  else if (maxDiff > 0.1) zoom = 8;
  else if (maxDiff > 0.05) zoom = 9;
  
  return { center: [centerLat, centerLng], zoom };
};

const Favorites: React.FC = () => {
  const { favoriteClubs, isLoading, error, toggleFavorite, isFavorite } = useFavorites();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(5);
  const navigate = useNavigate();

  const getCurrentPageFavorites = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return favoriteClubs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [favoriteClubs, currentPage]);
  
  const totalPages = Math.ceil(favoriteClubs.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  useEffect(() => {
    if (favoriteClubs.length > 0) {
      const { center, zoom } = calculateMapBounds(getCurrentPageFavorites);
      setMapCenter(center as [number, number]);
      setMapZoom(zoom);
    }
  }, [favoriteClubs, currentPage, getCurrentPageFavorites]);

  const handleClubClick = (clubId: string) => {
    if (!clubId) {
      console.error('Invalid club ID:', clubId);
      return;
    }
    navigate(`/clubs/${clubId}`);
  };

  return (
    <PageLayout title="Favorite Clubs">
      <Box sx={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <LoadingSkeleton count={5} />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : favoriteClubs.length > 0 ? (
          <>
            <Box sx={{ height: '400px', mb: 3, borderRadius: 1 }}>
              <InteractiveMap
                clubs={[]}
                center={mapCenter}
                radius={0}
                onMarkerClick={handleClubClick}
                showNumbers={true}
                initialZoom={mapZoom}
                key={`favorites-map-${JSON.stringify(mapCenter)}-${currentPage}-${mapZoom}`}
              >
                {getCurrentPageFavorites
                  .filter(club => 
                    club.latitude && club.longitude && 
                    !isNaN(club.latitude) && !isNaN(club.longitude) &&
                    Math.abs(club.latitude) <= 90 && Math.abs(club.longitude) <= 180
                  )
                  .map((club, index) => {
                    return (
                      <Marker
                        key={club.golfclub_id || club.id}
                        position={[Number(club.latitude), Number(club.longitude)]}
                        icon={divIcon({
                          className: 'custom-marker',
                          html: `<div style="
                            background-color: #1976d2;
                            color: white;
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                          ">${index + 1}</div>`,
                        })}
                        eventHandlers={{
                          click: () => handleClubClick(club.golfclub_id || club.id)
                        }}
                      />
                    );
                  })}
              </InteractiveMap>
            </Box>

            <Grid container spacing={2}>
              {getCurrentPageFavorites.map((club, index) => (
                <Grid item xs={12} key={club.golfclub_id}>
                  <Box
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 1,
                      boxShadow: 1,
                      padding: 2,
                      position: 'relative',
                    }}
                  >
                    <ClubCard
                      club={club}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(club.golfclub_id || club.id)}
                      showToggle={true}
                      index={(currentPage - 1) * ITEMS_PER_PAGE + index}
                      showScore={false}
                      onClick={() => {
                        handleClubClick(club.golfclub_id || club.id);
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={favoriteClubs.length}
              />
            )}
          </>
        ) : (
          <Alert severity="info">You haven't added any clubs to your favorites yet.</Alert>
        )}
      </Box>
    </PageLayout>
  );
};

export default Favorites;
