import { useQuery } from '@tanstack/react-query';
import { getWeatherForecast } from '../utils/weather';

interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  description: string;
}

/**
 * Hook for fetching weather data with react-query caching
 * Prevents N+1 API calls by caching weather data per location
 */
export const useWeather = (latitude: number | null | undefined, longitude: number | null | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) {
        return null;
      }
      
      const response = await getWeatherForecast(latitude, longitude);
      const formattedWeather: WeatherData[] = response.daily.time.map((time, index) => ({
        date: time,
        maxTemp: response.daily.temperature_2m_max[index],
        minTemp: response.daily.temperature_2m_min[index],
        precipitation: response.daily.precipitation_probability_max[index],
        description: response.daily.weathercode[index].toString(),
      }));
      
      return formattedWeather;
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });

  return {
    weather: data || [],
    isLoading,
    error,
  };
};

