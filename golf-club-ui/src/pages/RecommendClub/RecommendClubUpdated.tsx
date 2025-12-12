import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography, Card, CardContent, Grid, CircularProgress,
  Alert, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import ClubCard from '../../components/ClubCard';
import { useClubSearch } from '../../hooks/useClubSearch';
import { useFavorites } from '../../hooks/useFavorites';
import { InteractiveMap } from '../../components/InteractiveMap';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchState } from '../../hooks/useSearchState';
import './RecommendClub.css';
import { divIcon } from 'leaflet';
import { Marker } from 'react-leaflet';
import type { Club } from '../../types/Club';

const isValidCoordinate = (lat: number, lng: number) => 
  !isNaN(lat) && !isNaN(lng) && 
  lat >= -90 && lat <= 90 && 
  lng >= -180 && lng <= 180;

const RecommendClubUpdated: React.FC = () => {
  const { session } = useAuth();
  const [searchState, setSearchState] = useSearchState('recommendSearch');
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state from saved search
  const [zipCode, setZipCode] = useState(searchState.zipCode);
  const [radius, setRadius] = useState(searchState.radius);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);
  
  // Use new hooks
  const { clubs: courses, isLoading, error, getRecommendations } = useClubSearch({
    token: session?.access_token,
  });
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleSearch = async () => {
    if (!zipCode) {
      return;
    }

    setHasSearched(true);
    await getRecommendations(zipCode, radius);
    
    // Save search state when successful
    if (courses.length > 0) {
      setSearchState({
        zipCode,
        radius,
        results: courses,
        filters: {}
      });
    }
  };

  const getCurrentPageCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return courses.slice(start, start + ITEMS_PER_PAGE);
  }, [courses, currentPage]);
  
  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Navigate to detail with state
  const handleClubClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`, {
      state: { from: location.pathname }
    });
  };

  const createCustomMarker = (number: number) => {
    return divIcon({
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
      ">${number}</div>`,
    });
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
    
    // Calculate bounds
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    validClubs.forEach(club => {
      const lat = Number(club.latitude);
      const lng = Number(club.longitude);
      
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
    
    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate appropriate zoom level
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

  useEffect(() => {
    if (courses.length > 0) {
      const { center, zoom } = calculateMapBounds(getCurrentPageCourses());
      setMapCenter(center as [number, number]);
      setMapZoom(zoom);
    }
  }, [courses, currentPage]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '1rem'
      }}
    >
      <PageLayout 
        title="Recommended Clubs" 
        titleProps={{ 
          sx: { 
            textAlign: 'center', 
            color: 'primary.main',
            justifyContent: 'center'
          } 
        }}
      >
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          Enter your desired zip code and search radius below for club recommendations based on your profile.
        </Typography>
        <Card sx={{ 
          mb: 3, 
          mt: -2,
          mx: { xs: -2, sm: 0 }
        }}>
          <CardContent>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <TextField
                fullWidth
                label="Zip Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                size="small"
                sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Search Radius</InputLabel>
                <Select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  label="Search Radius"
                >
                  <MenuItem value="10">10 miles</MenuItem>
                  <MenuItem value="25">25 miles</MenuItem>
                  <MenuItem value="50">50 miles</MenuItem>
                  <MenuItem value="100">100 miles</MenuItem>
                </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Finding Recommendations...
                  </>
                ) : (
                  'Find Recommendations'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && hasSearched && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading && <LoadingSkeleton count={5} />}

        {hasSearched && courses.length === 0 && !error && !isLoading && (
          <Alert severity="info">
            No recommendations found for this location.
          </Alert>
        )}

        {!isLoading && courses.length > 0 && (
          <>
            {zipCode && radius && (
              <Box sx={{ 
                height: '400px', 
                width: '100%',
                mb: 3, 
                borderRadius: 1
              }}>
                <InteractiveMap
                  clubs={[]}
                  center={[mapCenter[0], mapCenter[1]]}
                  radius={parseInt(radius)}
                  onMarkerClick={handleClubClick}
                  showNumbers={true}
                  initialZoom={mapZoom}
                  key={`map-${currentPage}-${mapZoom}`}
                >
                  {getCurrentPageCourses().filter(c =>
                    c.latitude && c.longitude &&
                    isValidCoordinate(c.latitude, c.longitude)
                  ).map((club, index) => (
                    <Marker
                      key={club.id}
                      position={[club.latitude ?? 0, club.longitude ?? 0]}
                      icon={createCustomMarker(index + 1)}
                      eventHandlers={{
                        click: () => handleClubClick(club.id)
                      }}
                    />
                  ))}
                </InteractiveMap>
              </Box>
            )}

            <Grid container spacing={2}>
              {courses
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((club, index) => (
                  <Grid item xs={12} key={club.id}>
                    <Box
                      sx={{
                        backgroundColor: club.score >= 80 ? 'rgba(46, 90, 39, 0.05)' : 'transparent',
                        borderRadius: 1,
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: club.score >= 80 ? 'rgba(46, 90, 39, 0.08)' : 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <ClubCard 
                        club={club}
                        showScore={true}
                        isFavorite={isFavorite(club.id)}
                        onToggleFavorite={toggleFavorite}
                        showToggle={true}
                        index={index}
                        onClick={() => navigate(`/clubs/${club.id}`)}
                        sx={{
                          cursor: 'pointer',
                          '& .MuiCardHeader-action': {
                            position: { xs: 'static', sm: 'absolute' },
                            right: { xs: 0, sm: 16 },
                            top: { xs: 0, sm: 16 }
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                ))
              }
            </Grid>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={courses.length}
            />
          </>
        )}
      </PageLayout>
    </Box>
  );
};

export default RecommendClubUpdated;
