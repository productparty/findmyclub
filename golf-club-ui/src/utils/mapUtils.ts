import { divIcon } from 'leaflet';
import type { Club } from '../types/Club';

/**
 * Validates if coordinates are within valid ranges
 */
export const isValidCoordinate = (lat: number | null | undefined, lng: number | null | undefined): boolean => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
};

/**
 * Filters clubs to only those with valid coordinates
 */
export const filterValidCoordinates = (clubs: Club[]): Club[] => {
  return clubs.filter(
    (club) =>
      club.latitude &&
      club.longitude &&
      isValidCoordinate(club.latitude, club.longitude)
  );
};

/**
 * Calculates the center point from an array of clubs with valid coordinates
 * Returns default center (US center) if no valid clubs found
 */
export const calculateMapCenter = (
  clubs: Club[],
  defaultCenter: [number, number] = [39.8283, -98.5795]
): [number, number] => {
  const validClubs = filterValidCoordinates(clubs);
  
  if (validClubs.length === 0) {
    return defaultCenter;
  }
  
  if (validClubs.length === 1) {
    return [Number(validClubs[0].latitude), Number(validClubs[0].longitude)];
  }
  
  // Calculate center from bounds
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  
  validClubs.forEach((club) => {
    const lat = Number(club.latitude);
    const lng = Number(club.longitude);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });
  
  return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
};

/**
 * Calculates appropriate zoom level based on coordinate bounds
 */
export const calculateMapZoom = (clubs: Club[]): number => {
  const validClubs = filterValidCoordinates(clubs);
  
  if (validClubs.length === 0) return 4;
  if (validClubs.length === 1) return 10;
  
  // Calculate bounds
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  
  validClubs.forEach((club) => {
    const lat = Number(club.latitude);
    const lng = Number(club.longitude);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });
  
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  
  // Determine zoom based on difference
  if (maxDiff > 10) return 3;
  if (maxDiff > 5) return 4;
  if (maxDiff > 3) return 5;
  if (maxDiff > 1) return 6;
  if (maxDiff > 0.5) return 7;
  if (maxDiff > 0.1) return 8;
  if (maxDiff > 0.05) return 9;
  return 10;
};

/**
 * Creates a custom numbered marker icon for Leaflet maps
 */
export const createCustomMarker = (number: number, color: string = '#1976d2') => {
  return divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
  });
};
