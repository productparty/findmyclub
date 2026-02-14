import React, { forwardRef, memo, useCallback } from 'react';
import { Card, CardContent, Typography, Chip, Box, Grid, SxProps, Theme, useTheme } from '@mui/material';
import GolfCourseIcon from '@mui/icons-material/GolfCourse';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import './ClubCard.css';
import type { Club } from '../types/Club';
import { useWeather } from '../hooks/useWeather';
import { colors } from '../theme';

interface ClubCardProps {
  club: Club;
  showScore?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (clubId: string) => void;
  showToggle?: boolean;
  index: number;
  sx?: SxProps<Theme>;
  onClick?: () => void;
}

const FeatureChip: React.FC<{ label: string; isMatch?: boolean }> = ({ label, isMatch = false }) => (
  <Chip 
    label={label}
    size="small"
    sx={{ 
      borderColor: isMatch ? colors.primaryDark : 'grey.300',
      color: isMatch ? colors.primaryDark : 'text.secondary',
      backgroundColor: isMatch ? `${colors.primaryDark}10` : 'transparent',
      '& .MuiChip-label': {
        fontWeight: isMatch ? 'bold' : 'normal',
      }
    }}
    variant="outlined"
  />
);

const getWeatherIcon = (weatherCode: number) => {
  switch (weatherCode) {
    case 0: // Clear sky
      return <WbSunnyIcon sx={{ color: colors.weather.sunny }} />;
    case 1:
    case 2:
    case 3: // Cloudy
      return <CloudIcon sx={{ color: colors.weather.cloudy }} />;
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65: // Rain
      return <UmbrellaIcon sx={{ color: colors.weather.rain }} />;
    case 71:
    case 73:
    case 75: // Snow
      return <AcUnitIcon sx={{ color: colors.weather.snow }} />;
    case 95: // Thunderstorm
      return <ThunderstormIcon sx={{ color: colors.weather.thunderstorm }} />;
    default:
      return <CloudIcon sx={{ color: colors.weather.cloudy }} />;
  }
};

const ClubCard = memo(forwardRef<HTMLDivElement, ClubCardProps>(({
  club,
  showScore,
  isFavorite,
  onToggleFavorite,
  showToggle,
  index,
  sx,
  onClick
}, ref) => {
  const { weather } = useWeather(club.latitude, club.longitude);
  
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(club.id);
  }, [club.id, onToggleFavorite]);
  
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <Card 
      ref={ref}
      sx={{ mb: 2, position: 'relative', ...sx }}
      onClick={handleClick}
    >
      <CardContent>
        <Typography variant="h6" component="div">
          #{index + 1} - {club.club_name}
        </Typography>
        <Typography variant="body2" align="left">{club.address}</Typography>
        <Typography variant="body2" align="left">{club.city}, {club.state} {club.zip_code}</Typography>
        <Typography variant="body2" align="left">
          Distance: {typeof club.distance_miles === 'number' ? club.distance_miles.toFixed(1) : 'N/A'} miles
        </Typography>

        {showToggle && onToggleFavorite && (
          <IconButton
            onClick={handleToggleFavorite}
            className="heart-button"
            sx={{
              padding: '8px',
              ml: { sm: 2 },
              mb: { xs: 1, sm: 0 },
              width: 'fit-content',
              minWidth: 'auto',
              '& .MuiSvgIcon-root': { 
                fontSize: '24px',
                display: 'block'
              }
            }}
          >
            {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
        )}

        {/* Club Attributes Section */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Price: {club.price_tier}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GolfCourseIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Difficulty: {club.difficulty}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">Holes: {club.number_of_holes}</Typography>
              </Box>
            </Grid>

            {/* Features Grid */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>Features:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {club.driving_range && <FeatureChip label="Driving Range" />}
                {club.putting_green && <FeatureChip label="Putting Green" />}
                {club.practice_bunker && <FeatureChip label="Practice Bunker" />}
                {club.golf_lessons && <FeatureChip label="Lessons" />}
                {club.club_fitting && <FeatureChip label="Club Fitting" />}
                {club.restaurant && <FeatureChip label="Restaurant" />}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Weather Section */}
        {weather.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
              Three Day Weather Forecast:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {weather.slice(0, 3).map((day) => (
                <Box key={day.date} sx={{ textAlign: 'center', minWidth: '80px' }}>
                  <Typography variant="caption" display="block">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Typography>
                  <Box className="weather-icon-container">
                    {getWeatherIcon(parseInt(day.description))}
                  </Box>
                  <Typography variant="caption" display="block">
                    {Math.round(day.maxTemp)}°F
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {typeof club.score === 'number' && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2, 
              color: club.score >= 80 ? colors.primaryDark : 'primary.main',
              fontWeight: 'medium'
            }}
          >
            Match: {club.score.toFixed(1)}%
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}));

ClubCard.displayName = 'ClubCard';

export default ClubCard;
