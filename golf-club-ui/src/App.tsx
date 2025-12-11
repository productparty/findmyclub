import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Box, Typography, CircularProgress } from '@mui/material';
import { RouterProvider, createBrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { lazy, Suspense } from 'react';
import { config } from './config';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import { FavoritesProvider } from './context/FavoritesContext';

// Import pages
import Dashboard from './pages/Home/Dashboard';
import FindClubUpdated from './pages/FindClub/FindClubUpdated';
import Favorites from './pages/Favorites/Favorites';
import GolferProfileUpdated from './pages/GolferProfile/GolferProfileUpdated';
import Login from './pages/login/Login';
import SignUp from './pages/CreateAccount/CreateAccount';
import CreateAccountSubmitted from './pages/CreateAccount/CreateAccountSubmitted';
import AuthCallback from './pages/Auth/Callback';
import RecommendClubUpdated from './pages/RecommendClub/RecommendClubUpdated';
import ClubDetail from './pages/ClubDetail/ClubDetail';
import NotFound from './pages/NotFound/NotFound';
import LandingPage from './pages/Home/LandingPage';
import PasswordResetRequest from './pages/PasswordReset/PasswordResetRequest';
import PasswordResetConfirm from './pages/PasswordReset/PasswordResetConfirm';
import { ProtectedRoute } from './components/ProtectedRoute';
import CreateAccountSuccessful from './pages/CreateAccount/CreateAccountSuccessful';

// Log environment info in development or when debugging
if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
  console.log('Environment:', import.meta.env.MODE);
  console.log('API URL:', config.API_URL);
  console.log('App URL:', config.APP_URL);
  console.log('Supabase URL exists:', !!config.SUPABASE_URL);
  console.log('Supabase key exists:', !!config.SUPABASE_ANON_KEY);
}

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = createTheme();

// Define the router with proper layout structure
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "find-club", element: <FindClubUpdated /> },
      { path: "recommend-club", element: <RecommendClubUpdated /> },
      { path: "favorites", element: <ProtectedRoute><Favorites /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><GolferProfileUpdated /></ProtectedRoute> },
      { path: "login", element: <Login /> },
      { path: "create-account", element: <SignUp /> },
      { path: "signup", element: <Navigate to="/create-account" replace /> },
      { path: "create-account-submitted", element: <CreateAccountSubmitted /> },
      { path: "auth/callback", element: <AuthCallback /> },
      { path: "password-reset", element: <PasswordResetRequest /> },
      { path: "password-reset-confirm", element: <PasswordResetConfirm /> },
      { path: "clubs/:id", element: <ClubDetail /> },
      { path: "club-detail/:id", element: <ClubDetail /> },
      { path: "create-account-successful", element: <CreateAccountSuccessful /> },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
              <AuthProvider>
                <FavoritesProvider>
                  <RouterProvider router={router} />
                  <Analytics />
                </FavoritesProvider>
              </AuthProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
