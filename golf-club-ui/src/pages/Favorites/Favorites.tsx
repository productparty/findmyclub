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
import { createCustomMarker, filterValidCoordinates, calculateMapCenter, calculateMapZoom } from '../../utils/mapUtils';

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
      const center = calculateMapCenter(getCurrentPageFavorites as any[]);
      const zoom = calculateMapZoom(getCurrentPageFavorites as any[]);
      setMapCenter(center);
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
                {filterValidCoordinates(getCurrentPageFavorites as any[])
                  .map((club, index) => {
                    return (
                      <Marker
                        key={club.golfclub_id || club.id}
                        position={[Number(club.latitude!), Number(club.longitude!)]}
                        icon={createCustomMarker(index + 1)}
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
