/**
 * Map optimization utilities
 * Handles marker clustering, bounds calculation, and performance optimizations
 */

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Calculate map bounds from an array of coordinates
 */
export const calculateBounds = (coordinates: Coordinate[]): Bounds | null => {
  if (coordinates.length === 0) {
    return null;
  }

  const validCoords = coordinates.filter(
    (coord) =>
      coord.latitude &&
      coord.longitude &&
      !isNaN(coord.latitude) &&
      !isNaN(coord.longitude) &&
      Math.abs(coord.latitude) <= 90 &&
      Math.abs(coord.longitude) <= 180
  );

  if (validCoords.length === 0) {
    return null;
  }

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  validCoords.forEach((coord) => {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  });

  return { minLat, maxLat, minLng, maxLng };
};

/**
 * Calculate map center from bounds
 */
export const calculateCenter = (bounds: Bounds): [number, number] => {
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  return [centerLat, centerLng];
};

/**
 * Calculate appropriate zoom level based on bounds
 */
export const calculateZoom = (bounds: Bounds): number => {
  const latDiff = bounds.maxLat - bounds.minLat;
  const lngDiff = bounds.maxLng - bounds.minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

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
 * Filter coordinates to only include valid ones
 */
export const filterValidCoordinates = (
  items: Array<{ latitude?: number | null; longitude?: number | null }>
): Coordinate[] => {
  return items
    .map((item) => ({
      latitude: item.latitude ?? 0,
      longitude: item.longitude ?? 0,
    }))
    .filter(
      (coord) =>
        coord.latitude &&
        coord.longitude &&
        !isNaN(coord.latitude) &&
        !isNaN(coord.longitude) &&
        Math.abs(coord.latitude) <= 90 &&
        Math.abs(coord.longitude) <= 180
    );
};

/**
 * Debounce function for map updates
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

