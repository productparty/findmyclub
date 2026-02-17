import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary';
import { Box, CircularProgress } from '@mui/material';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import { FavoritesProvider } from './context/FavoritesContext';

// Import pages
import { HelmetProvider } from 'react-helmet-async';

// Import pages lazy
const Dashboard = lazy(() => import('./pages/Home/Dashboard'));
const FindClubUpdated = lazy(() => import('./pages/FindClub/FindClubUpdated'));
const Favorites = lazy(() => import('./pages/Favorites/Favorites'));
const GolferProfileUpdated = lazy(() => import('./pages/GolferProfile/GolferProfileUpdated'));
// Lazy load Login page
const Login = lazy(() => import('./pages/LoginTemp/Login'));
const SignUp = lazy(() => import('./pages/CreateAccount/CreateAccount'));
const CreateAccountSubmitted = lazy(() => import('./pages/CreateAccount/CreateAccountSubmitted'));
const AuthCallback = lazy(() => import('./pages/Auth/Callback'));
const RecommendClubUpdated = lazy(() => import('./pages/RecommendClub/RecommendClubUpdated'));
const ClubDetail = lazy(() => import('./pages/ClubDetail/ClubDetail'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));
const LandingPage = lazy(() => import('./pages/Home/LandingPage'));
const PasswordResetRequest = lazy(() => import('./pages/PasswordReset/PasswordResetRequest'));
const PasswordResetConfirm = lazy(() => import('./pages/PasswordReset/PasswordResetConfirm'));
// ProtectedRoute is a component, not a page, so keep it eager or lazy? usually eager is fine for components
// But imports were: import { ProtectedRoute } from ...
import { ProtectedRoute } from './components/ProtectedRoute';
const CreateAccountSuccessful = lazy(() => import('./pages/CreateAccount/CreateAccountSuccessful'));

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

import { default as theme } from './theme';

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
          <HelmetProvider>
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
          </HelmetProvider>
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
