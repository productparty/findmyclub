// components/ClubDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, IconButton, Button, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useMap } from '../hooks/useMap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { InteractiveMap } from './InteractiveMap';
import type { Club } from '../types/Club';
    lng?: number;
    match_percentage?: number;
}

export const ClubDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useAuth();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    const isFavorite = favorites.includes(id || '');

    const fetchFavorites = async () => {
        if (!session?.user?.id) return;
        
        const { data, error } = await supabase
            .from('favorites')
            .select('golfclub_id')
            .eq('profile_id', session.user.id);
            
        if (error) {
            console.error('Error fetching favorites:', error);
            return;
        }
        
        setFavorites(data.map((fav: { golfclub_id: string }) => fav.golfclub_id));
    };

    const handleToggleFavorite = async (clubId: string) => {
        if (!session?.user?.id) return;

        const isFavorite = favorites.includes(clubId);
        
        if (isFavorite) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('profile_id', session.user.id)
                .eq('golfclub_id', clubId);
                
            if (error) {
                console.error('Error removing favorite:', error);
                return;
            }
            
            setFavorites(prev => prev.filter(id => id !== clubId));
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert([{ 
                    profile_id: session.user.id,
                    golfclub_id: clubId
                }]);
                
            if (error) {
                console.error('Error adding favorite:', error);
                return;
            }
            
            setFavorites(prev => [...prev, clubId]);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, [session?.user?.id]);

    const { mapContainer, setMapContainer } = useMap({
        center: club ? [club.lat || 0, club.lng || 0] : [0, 0],
        radius: 0  // Set to 0 since we want to focus on a single club
    });

    useEffect(() => {
        const fetchClub = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('golfclub')
                    .select(`
                        global_id,
                        club_name,
                        address,
                        city,
                        state,
                        zip_code,
                        price_tier,
                        difficulty,
                        number_of_holes,
                        club_membership,
                        driving_range,
                        putting_green,
                        chipping_green,
                        practice_bunker,
                        restaurant,
                        lodging_on_site,
                        motor_cart,
                        pull_cart,
                        golf_clubs_rental,
                        club_fitting,
                        golf_lessons,
                        latitude,
                        longitude
                    `)
                    .eq('global_id', id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Club not found');
                
                if (!data.latitude || !data.longitude) {
                    // Try to fetch coordinates from zip code
                    if (data.zip_code) {
                        try {
                            const zipResponse = await fetch(`https://api.zippopotam.us/us/${data.zip_code}`);
                            const zipData = await zipResponse.json();
                            
                            if (zipData.places && zipData.places.length > 0) {
                                data.latitude = Number(zipData.places[0].latitude);
                                data.longitude = Number(zipData.places[0].longitude);
                            } else {
                                throw new Error('Club coordinates not available');
                            }
                        } catch (error) {
                            console.error(`ClubDetailPage - Failed to get coordinates for zip code ${data.zip_code}:`, error);
                            throw new Error('Club coordinates not available');
                        }
                    } else {
                        throw new Error('Club coordinates not available');
                    }
                }
                
                setClub({
                    id: data.global_id,
                    ...data,
                    lat: data.latitude,
                    lng: data.longitude
                });
            } catch (err: any) {
                setError(err.message);
                console.error('Error fetching club:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchClub();
    }, [id]);

    const handleBack = () => {
        const previousPath = location.state?.from || '/recommend-club';
        navigate(previousPath, { 
            state: { preserveSearch: true }
        });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!club) return <Typography>Club not found</Typography>;

    return (
        <Box sx={{ 
            p: 3, 
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'left'
        }}>
            <Box sx={{ 
                mb: 3,
                display: 'flex',
                justifyContent: 'flex-start'
            }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                >
                    Back to Results
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">{club.club_name}</Typography>
                {session && (
                    <IconButton 
                        onClick={() => handleToggleFavorite(club.id)} 
                        size="large"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                )}
            </Box>

            <Box sx={{ height: '400px', mb: 3, borderRadius: 1 }}>
                <InteractiveMap
                    clubs={[club]}
                    center={[club.lat || 0, club.lng || 0]}
                    radius={0}
                    initialZoom={15}  // Increased zoom level for better detail
                    onMarkerClick={() => {}}
                />
            </Box>

            <Box sx={{ display: 'grid', gap: 3, textAlign: 'left' }}>
                <Box>
                    <Typography variant="h6" align="left" gutterBottom>Location</Typography>
                    <Typography align="left">{club.address}</Typography>
                    <Typography align="left">{club.city}, {club.state} {club.zip_code}</Typography>
                </Box>

                <Box>
                    <Typography variant="h6" align="left" gutterBottom>Details</Typography>
                    <Typography>Price Tier: {club.price_tier}</Typography>
                    <Typography>Difficulty: {club.difficulty}</Typography>
                    <Typography>Number of Holes: {club.number_of_holes}</Typography>
                    {club.club_membership && (
                        <Typography>Membership: {club.club_membership}</Typography>
                    )}
                </Box>

                <Box>
                    <Typography variant="h6" align="left" gutterBottom>Amenities & Facilities</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        {club.driving_range && <Typography>• Driving Range</Typography>}
                        {club.putting_green && <Typography>• Putting Green</Typography>}
                        {club.practice_bunker && <Typography>• Practice Bunker</Typography>}
                        {club.restaurant && <Typography>• Restaurant</Typography>}
                        {club.lodging_on_site && <Typography>• Lodging Available</Typography>}
                    </Box>
                </Box>

                <Box>
                    <Typography variant="h6" align="left" gutterBottom>Equipment & Services</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        {club.motor_cart && <Typography>• Motor Cart</Typography>}
                        {club.pull_cart && <Typography>• Pull Cart</Typography>}
                        {club.golf_clubs_rental && <Typography>• Club Rental</Typography>}
                        {club.club_fitting && <Typography>• Club Fitting</Typography>}
                        {club.golf_lessons && <Typography>• Golf Lessons</Typography>}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
