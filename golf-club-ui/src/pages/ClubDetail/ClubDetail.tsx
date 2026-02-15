import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageLayout from '../../components/PageLayout';
import { InteractiveMap } from '../../components/InteractiveMap';
import { config } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { analytics } from '../../utils/analytics';
import type { Club } from '../../types/Club';
import { Marker, Popup } from 'react-leaflet';
import { createCustomMarker, isValidCoordinate } from '../../utils/mapUtils';
import { useWeather } from '../../hooks/useWeather';
import { getWeatherInfo } from '../../utils/weather';
import ReviewSection from '../../components/ReviewSection';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

export const ClubDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { session } = useAuth();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);

    // Fetch weather data
    const { weather, isLoading: weatherLoading } = useWeather(
        club?.latitude ? Number(club.latitude) : null,
        club?.longitude ? Number(club.longitude) : null
    );

    const getWeatherIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'clear_day': return <WbSunnyIcon />;
            case 'partly_cloudy_day': return <CloudIcon />; // Approximation
            case 'cloudy': return <CloudIcon />;
            case 'foggy': return <CloudIcon sx={{ opacity: 0.5 }} />;
            case 'rainy_light':
            case 'rainy':
            case 'rainy_heavy': return <OpacityIcon />;
            case 'weather_snowy':
            case 'weather_snowy_heavy': return <AcUnitIcon />;
            case 'thunderstorm': return <ThunderstormIcon />;
            default: return <QuestionMarkIcon />;
        }
    };

    useEffect(() => {
        const fetchClubDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError(null);

                // First try the API endpoint
                const response = await fetch(
                    `${config.API_URL}/api/clubs/${id}`,
                    {
                        headers: session?.access_token ? {
                            'Authorization': `Bearer ${session.access_token}`
                        } : {}
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch club details');
                }

                const data = await response.json();

                // If we don't have coordinates, try to get them from zip code
                if ((!data.latitude || !data.longitude) && data.zip_code) {
                    try {
                        const zipResponse = await fetch(`https://api.zippopotam.us/us/${data.zip_code}`);
                        const zipData = await zipResponse.json();

                        if (zipData.places && zipData.places.length > 0) {
                            data.latitude = Number(zipData.places[0].latitude);
                            data.longitude = Number(zipData.places[0].longitude);
                        }
                    } catch (error) {
                        console.error(`Failed to get coordinates for zip code ${data.zip_code}:`, error);
                    }
                }

                setClub(data);

                // Track club view
                if (id) {
                    analytics.clubViewed(id);
                }

                // Set map center immediately if we have valid coordinates
                if (isValidCoordinate(data.latitude, data.longitude)) {
                    setMapCenter([Number(data.latitude), Number(data.longitude)]);
                }
            } catch (err) {
                console.error('Error fetching club details:', err);
                const { getErrorMessage } = await import('../../utils/errorHandling');
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchClubDetails();
    }, [id, session]);

    if (loading) {
        return (
            <PageLayout title="Loading...">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    if (error || !club) {
        return (
            <PageLayout title="Error">
                <Box sx={{ p: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 3 }}
                    >
                        Back to Search
                    </Button>
                    <Alert severity="error">
                        {error || 'Failed to load club details'}
                    </Alert>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout title={club.club_name}>
            <Box sx={{ p: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3 }}
                >
                    Back to Search
                </Button>

                <Typography variant="h4" gutterBottom>{club.club_name}</Typography>

                <Box sx={{ mb: 4, height: '400px' }}>
                    <InteractiveMap
                        clubs={isValidCoordinate(club.latitude, club.longitude) ? [club] : []}
                        center={mapCenter}
                        radius={0}
                        onMarkerClick={() => { }}
                        initialZoom={15}
                        key={`club-detail-map-${club?.id}-${mapCenter[0]}-${mapCenter[1]}`}
                    >
                        {isValidCoordinate(club.latitude, club.longitude) && (
                            <Marker
                                position={[Number(club.latitude!), Number(club.longitude!)]}
                                icon={createCustomMarker(1)}
                            >
                                <Popup>{club.club_name}</Popup>
                            </Marker>
                        )}
                    </InteractiveMap>
                </Box>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Club Details</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Typography><strong>Address:</strong> {club.address}</Typography>
                        <Typography><strong>City:</strong> {club.city}</Typography>
                        <Typography><strong>State:</strong> {club.state}</Typography>
                        <Typography><strong>Zip Code:</strong> {club.zip_code}</Typography>
                        <Typography><strong>Price Tier:</strong> {club.price_tier}</Typography>
                        <Typography><strong>Difficulty:</strong> {club.difficulty}</Typography>
                        <Typography><strong>Number of Holes:</strong> {club.number_of_holes}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Amenities</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {club.driving_range && <Typography>✓ Driving Range</Typography>}
                        {club.putting_green && <Typography>✓ Putting Green</Typography>}
                        {club.chipping_green && <Typography>✓ Chipping Green</Typography>}
                        {club.practice_bunker && <Typography>✓ Practice Bunker</Typography>}
                        {club.restaurant && <Typography>✓ Restaurant</Typography>}
                        {club.lodging_on_site && <Typography>✓ Lodging On-Site</Typography>}
                        {club.motor_cart && <Typography>✓ Motor Cart</Typography>}
                        {club.pull_cart && <Typography>✓ Pull Cart</Typography>}
                        {club.golf_clubs_rental && <Typography>✓ Club Rental</Typography>}
                        {club.club_fitting && <Typography>✓ Club Fitting</Typography>}
                        {club.golf_lessons && <Typography>✓ Golf Lessons</Typography>}
                    </Box>
                </Paper>

                {/* Weather Section */}
                {!weatherLoading && weather.length > 0 && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>3-Day Forecast</Typography>
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                            {weather.map((day, index) => {
                                const info = getWeatherInfo(Number(day.description)); // description is code string?
                                // utils/weather.ts says description: response.daily.weathercode[index].toString()
                                // So we convert back to number for getWeatherInfo(code: number)
                                return (
                                    <Box key={index} sx={{
                                        minWidth: 120,
                                        p: 2,
                                        border: '1px solid #eee',
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
                                        </Typography>
                                        <Box sx={{ my: 1, color: 'text.secondary' }}>
                                            {getWeatherIconComponent(info.icon)}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {info.description}
                                        </Typography>
                                        <Typography variant="h6">
                                            {Math.round(day.maxTemp)}° <Typography component="span" variant="body2" color="text.secondary">/ {Math.round(day.minTemp)}°</Typography>
                                        </Typography>
                                        <Typography variant="caption" display="block" color="primary">
                                            {day.precipitation}% Rain
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                )}


                {/* Reviews Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <ReviewSection clubId={id!} />
                </Paper>
            </Box>
        </PageLayout >
    );
};

export default ClubDetail;
