import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary';
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

// Environment configuration validated at build time

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
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
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
      { path: "dashboard", element: <ProtectedRoute><RouteErrorBoundary><Dashboard /></RouteErrorBoundary></ProtectedRoute> },
      { path: "find-club", element: <RouteErrorBoundary><FindClubUpdated /></RouteErrorBoundary> },
      { path: "recommend-club", element: <RouteErrorBoundary><RecommendClubUpdated /></RouteErrorBoundary> },
      { path: "favorites", element: <ProtectedRoute><RouteErrorBoundary><Favorites /></RouteErrorBoundary></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><RouteErrorBoundary><GolferProfileUpdated /></RouteErrorBoundary></ProtectedRoute> },
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
