import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../utils/analytics';

/**
 * Component to track page views for analytics
 * Should be placed inside RouterProvider
 */
export const PageViewTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname + location.search);
  }, [location]);

  return null;
};

