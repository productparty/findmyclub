// Get environment variables with fallbacks
const env = {
  API_URL: import.meta.env.VITE_API_URL,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_URL: import.meta.env.VITE_APP_URL
};

// Default values for development
const defaults = {
  API_URL: 'http://localhost:8000',
  APP_URL: 'http://localhost:5173'
};

// Format API URL to ensure it has no trailing slash
const formatApiUrl = (url: string | undefined): string => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Export configuration object with fallbacks
export const config = {
  API_URL: formatApiUrl(env.API_URL || defaults.API_URL),
  SUPABASE_URL: env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || '',
  APP_URL: env.APP_URL || defaults.APP_URL
};

// Configuration loaded from environment variables

export default config;
