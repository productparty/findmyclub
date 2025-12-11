import { config } from '../config';

// Export a configured API URL that will throw if not set
export const getApiUrl = () => {
  if (!config.API_URL) {
    throw new Error('API_URL is not configured');
  }
  return config.API_URL;
}; 