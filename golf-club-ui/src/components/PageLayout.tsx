import React, { useState, useEffect, forwardRef } from 'react';
import { Container, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, SxProps, Theme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ScrollToTop } from './ScrollToTop';
import { Helmet } from 'react-helmet-async';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  titleProps?: SxProps<Theme>;
}

const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(({ children, title, description, titleProps }, ref) => {
  const [showFavorites, setShowFavorites] = useState(false);
  const { session, initialized } = useAuth(); // Get initialized from useAuth
  const [favorites, setFavorites] = useState<Array<{ id: string; club_name: string }>>([]);

  const fetchFavorites = async () => {
    // Check if initialized before accessing session
    if (!initialized || !session?.user?.id) return;

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        golfclub_id,
        golfclub:golfclub_id!inner(club_name)
      `)
      .eq('profile_id', session.user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
      return;
    }

    // Check if data is valid before mapping
    if (data) {
      setFavorites(data.map((item: any) => ({
        id: item.golfclub_id,
        club_name: item.golfclub?.club_name || 'Unknown Club'
      })));
    }
  };

  // Fetch favorites only when the component mounts and when the session changes
  useEffect(() => {
    fetchFavorites();
  }, [session, initialized]);

  return (
    <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Helmet>
        <title>{title} | Find My Club</title>
        <meta name="description" content={description || "Find your perfect golf club."} />
      </Helmet>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{
              color: 'primary.main',
              fontWeight: 'medium',
              mb: 4,
              ...titleProps
            }}
          >
            {title}
          </Typography>
          {children}
        </Paper>
      </Container>

      <Dialog
        open={showFavorites}
        onClose={() => setShowFavorites(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Your Favorite Clubs</DialogTitle>
        <DialogContent>
          <List>
            {favorites.map((favorite) => (
              <ListItem key={favorite.id}>
                <ListItemText primary={favorite.club_name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </Box>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
