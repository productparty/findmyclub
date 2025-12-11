import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

interface GolferProfile {
  id: string;
  preferred_price_range: string;
  preferred_difficulty: string;
}

export const useGolferProfile = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<GolferProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) {
        setError('Not authenticated');
        return;
      }
      
      try {
        if (!config.API_URL) {
          throw new Error('API URL is not configured');
        }

        const apiUrl = `${config.API_URL}/api/get-golfer-profile`;

        const response = await fetch(apiUrl, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Origin': import.meta.env.VITE_APP_URL
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
        console.error('Error fetching profile:', errorMessage);
        setError(errorMessage);
        setProfile(null);
      }
    };

    if (config.API_URL && session) {
      fetchProfile();
    }
  }, [session]);

  return { profile, error };
}; 