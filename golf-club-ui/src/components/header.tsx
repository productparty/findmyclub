import React, { forwardRef, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = forwardRef<HTMLDivElement>((props, ref) => {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = session ? [
    { label: 'Home', path: '/dashboard' },
    { label: 'Find Club', path: '/find-club' },
    { label: 'Recommend Club', path: '/recommend-club' },
    { label: 'Favorites', path: '/favorites' },
    { label: 'Profile', path: '/profile' },
  ] : [
    { label: 'Sign Up', path: '/create-account' },
    { label: 'Login', path: '/login' },
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem 
          button 
          key={item.path} 
          component={Link} 
          to={item.path}
          onClick={handleDrawerToggle}
        >
          <ListItemText primary={item.label} />
        </ListItem>
      ))}
      {session && (
        <ListItem button onClick={() => { handleLogout(); handleDrawerToggle(); }}>
          <ListItemText primary="Logout" />
        </ListItem>
      )}
    </List>
  );

  return (
    <AppBar ref={ref} position="static" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component={Link} 
          to={session ? '/dashboard' : '/'} 
          sx={{ 
            textDecoration: 'none', 
            color: 'inherit',
            flexGrow: 0,
            marginRight: 2
          }}
        >
          Find My Club
        </Typography>
        
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true // Better open performance on mobile.
              }}
              sx={{
                '& .MuiDrawer-paper': { 
                  width: 240,
                  bgcolor: 'primary.main',
                  color: 'white'
                },
              }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {menuItems.map((item) => (
              <Button 
                key={item.path}
                color="inherit" 
                component={Link} 
                to={item.path}
              >
                {item.label}
              </Button>
            ))}
            {session && (
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default Header;
