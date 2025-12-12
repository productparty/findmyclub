import React, { useState, useEffect } from 'react';
import { 
  Typography, TextField, Button, MenuItem, Select, InputLabel, 
  FormControl, Box, SelectChangeEvent, Alert, Snackbar, 
  CircularProgress, Card, CardContent, FormControlLabel, 
  Grid, Switch, Divider 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/PageLayout';
import { profileApi } from '../../api/profile';

interface GolferProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  handicap_index: number | null;
  preferred_price_range: string | null;
  preferred_difficulty: string | null;
  skill_level: string | null;
  play_frequency: string | null;
  preferred_tees: string | null;
  number_of_holes: string | null;
  club_membership: string | null;
  driving_range: boolean | null;
  putting_green: boolean | null;
  chipping_green: boolean | null;
  practice_bunker: boolean | null;
  restaurant: boolean | null;
  lodging_on_site: boolean | null;
  motor_cart: boolean | null;
  pull_cart: boolean | null;
  golf_clubs_rental: boolean | null;
  club_fitting: boolean | null;
  golf_lessons: boolean | null;
}

const GolferProfileUpdated: React.FC = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GolferProfile>({
    id: session?.user.id || '',
    email: session?.user.email || '',
    first_name: null,
    last_name: null,
    handicap_index: null,
    preferred_price_range: null,
    preferred_difficulty: null,
    skill_level: null,
    play_frequency: null,
    preferred_tees: null,
    number_of_holes: null,
    club_membership: null,
    driving_range: null,
    putting_green: null,
    chipping_green: null,
    practice_bunker: null,
    restaurant: null,
    lodging_on_site: null,
    motor_cart: null,
    pull_cart: null,
    golf_clubs_rental: null,
    club_fitting: null,
    golf_lessons: null,
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user.id) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [session?.user.id]);

    const fetchProfile = async () => {
    setIsLoading(true);
    try {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      let profileData = await profileApi.getProfile(session.user.id);
      
      if (!profileData) {
        // Create profile if it doesn't exist
        profileData = await profileApi.createProfile({
          id: session.user.id,
          email: session.user.email || '',
        });
      }

      setProfile(prev => ({
        ...prev,
        ...profileData!,
        email: session.user.email || prev.email,
      }));
      setError('');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    setIsSubmitting(true);
    try {
      const dataToSave = {
        id: session.user.id,
        email: session.user.email || '',
        first_name: profile.first_name,
        last_name: profile.last_name,
        handicap_index: profile.handicap_index,
        preferred_price_range: profile.preferred_price_range,
        preferred_difficulty: profile.preferred_difficulty?.toLowerCase() || null,
        skill_level: profile.skill_level?.toLowerCase() || null,
        play_frequency: profile.play_frequency?.toLowerCase() || null,
        preferred_tees: profile.preferred_tees ? String(profile.preferred_tees) : null,
        number_of_holes: profile.number_of_holes ? String(profile.number_of_holes) : null,
        club_membership: profile.club_membership ? String(profile.club_membership) : null,
        driving_range: !!profile.driving_range,
        putting_green: !!profile.putting_green,
        chipping_green: !!profile.chipping_green,
        practice_bunker: !!profile.practice_bunker,
        restaurant: !!profile.restaurant,
        lodging_on_site: !!profile.lodging_on_site,
        motor_cart: !!profile.motor_cart,
        pull_cart: !!profile.pull_cart,
        golf_clubs_rental: !!profile.golf_clubs_rental,
        club_fitting: !!profile.club_fitting,
        golf_lessons: !!profile.golf_lessons,
      };

      await profileApi.updateProfile(session.user.id, dataToSave);

      setSuccess('Profile saved successfully!');
      await fetchProfile();
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (field: keyof GolferProfile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'handicap_index' 
      ? Number(event.target.value) || null 
      : event.target.value;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof GolferProfile) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value || null;
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field: keyof GolferProfile) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile(prev => ({ ...prev, [field]: event.target.checked }));
  };

  if (isLoading) {
    return (
      <PageLayout title="My Profile">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }
  return (
    <PageLayout 
      title="My Profile"
      titleProps={{ 
        sx: { 
          textAlign: 'center', 
          color: 'primary.main',
          justifyContent: 'center'
        } 
      }}
    >
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
                      maxWidth: '100%',
                      px: 2,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Email: {profile.email}
        </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="First Name"
            value={profile.first_name || ''}
                    onChange={handleTextChange('first_name')}
          />
                </Grid>
                <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={profile.last_name || ''}
                    onChange={handleTextChange('last_name')}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Skill and Play Style */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Skill and Play Style</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Handicap Index"
            type="number"
            value={profile.handicap_index || ''}
                    onChange={handleTextChange('handicap_index')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Skill Level</InputLabel>
            <Select
                      value={profile.skill_level || ''}
                      onChange={handleSelectChange('skill_level')}
                      label="Skill Level"
                    >
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="intermediate">Intermediate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
            <InputLabel>Preferred Difficulty</InputLabel>
            <Select
              value={profile.preferred_difficulty || ''}
                      onChange={handleSelectChange('preferred_difficulty')}
              label="Preferred Difficulty"
            >
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
            <InputLabel>Play Frequency</InputLabel>
            <Select
              value={profile.play_frequency || ''}
                      onChange={handleSelectChange('play_frequency')}
              label="Play Frequency"
            >
                      <MenuItem value="">Select...</MenuItem>
                      <MenuItem value="rarely">Rarely</MenuItem>
                      <MenuItem value="sometimes">Sometimes</MenuItem>
                      <MenuItem value="often">Often</MenuItem>
                      <MenuItem value="very_often">Very Often</MenuItem>
            </Select>
          </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Course Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Course Preferences</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
            <InputLabel>Number of Holes</InputLabel>
            <Select
              value={profile.number_of_holes || ''}
                      onChange={handleSelectChange('number_of_holes')}
              label="Number of Holes"
            >
                      <MenuItem value="9">9 Holes</MenuItem>
                      <MenuItem value="18">18 Holes</MenuItem>
                      <MenuItem value="any">Any</MenuItem>
            </Select>
          </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
            <InputLabel>Club Membership</InputLabel>
            <Select
              value={profile.club_membership || ''}
                      onChange={handleSelectChange('club_membership')}
              label="Club Membership"
            >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="military">Military</MenuItem>
                      <MenuItem value="municipal">Municipal</MenuItem>
            </Select>
          </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Price Range</InputLabel>
            <Select
                      value={profile.preferred_price_range || ''}
                      onChange={handleSelectChange('preferred_price_range')}
                      label="Price Range"
                    >
                      <MenuItem value="$">$</MenuItem>
                      <MenuItem value="$$">$$</MenuItem>
                      <MenuItem value="$$$">$$$</MenuItem>
            </Select>
          </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Amenities and Facilities</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  { field: 'driving_range', label: 'Driving Range' },
                  { field: 'putting_green', label: 'Putting Green' },
                  { field: 'chipping_green', label: 'Chipping Green' },
                  { field: 'practice_bunker', label: 'Practice Bunker' },
                  { field: 'restaurant', label: 'Restaurant' },
                  { field: 'lodging_on_site', label: 'Lodging On-Site' },
                ].map(({ field, label }) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!profile[field as keyof GolferProfile]}
                          onChange={handleSwitchChange(field as keyof GolferProfile)}
                        />
                      }
                      label={label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Equipment and Services */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Equipment and Services</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  { field: 'motor_cart', label: 'Motor Cart' },
                  { field: 'pull_cart', label: 'Pull Cart' },
                  { field: 'golf_clubs_rental', label: 'Golf Club Rentals' },
                  { field: 'club_fitting', label: 'Club Fitting' },
                  { field: 'golf_lessons', label: 'Golf Lessons' },
                ].map(({ field, label }) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!profile[field as keyof GolferProfile]}
                          onChange={handleSwitchChange(field as keyof GolferProfile)}
                        />
                      }
                      label={label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
              onClick={handleSave}
            disabled={isSubmitting}
          >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Snackbar>

      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
        </Snackbar>
    </PageLayout>
  );
};

export default GolferProfileUpdated;
