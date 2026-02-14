import { createTheme } from '@mui/material/styles';

// Color palette for Find My Club
const colors = {
  primary: '#2E8B57', // Sea Green - main brand color (used in header)
  primaryDark: '#2E5A27', // Dark green - for accents and matches
  secondary: '#1976d2', // Blue - for secondary actions
  // Weather icon colors
  weather: {
    sunny: '#FFB300',
    cloudy: '#78909C',
    rain: '#42A5F5',
    snow: '#90CAF9',
    thunderstorm: '#5C6BC0',
  },
};

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
    },
    secondary: {
      main: colors.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents all-caps buttons
          transition: 'all 0.2s ease-in-out',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
  },
});

// Export colors for use in components
export { colors };
export default theme;
