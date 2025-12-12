import { track } from '@vercel/analytics';

/**
 * Analytics utilities for tracking user interactions
 * No PII is tracked - only anonymous events
 */

export const analytics = {
  /**
   * Track page view
   */
  pageView: (path: string) => {
    if (typeof window !== 'undefined') {
      track('page_view', { path });
    }
  },

  /**
   * Track favorite added
   */
  favoriteAdded: (clubId: string) => {
    track('favorite_added', { club_id: clubId });
  },

  /**
   * Track favorite removed
   */
  favoriteRemoved: (clubId: string) => {
    track('favorite_removed', { club_id: clubId });
  },

  /**
   * Track club search
   */
  clubSearch: (filters: Record<string, string | number>) => {
    track('club_search', filters);
  },

  /**
   * Track club view
   */
  clubViewed: (clubId: string) => {
    track('club_viewed', { club_id: clubId });
  },

  /**
   * Track error (client-side only, no stack traces)
   */
  error: (errorType: string, context?: Record<string, string>) => {
    track('error', { error_type: errorType, ...context });
  },
};

