// components/InteractiveMap.tsx
import React, { useEffect, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import type { Club } from '../types/Club';
import { calculateBounds, debounce } from '../utils/mapOptimization';
import { createCustomMarker } from '../utils/mapUtils';

interface InteractiveMapProps {
    clubs: Club[];
    center: [number, number];
    radius: number;
    onMapClick?: (lngLat: [number, number]) => void;
    onMarkerClick: (clubId: string) => void;
    showNumbers?: boolean;
    initialZoom?: number;
    children?: React.ReactNode;
}

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a consistent marker style function (uses shared utility)
export const createNumberedMarker = (index: number) => {
  return createCustomMarker(index + 1);
};

export const MapBounds: React.FC<{ clubs: Club[] }> = ({ clubs }) => {
    const map = useMap();

    // Debounce map updates to prevent excessive re-renders
    const updateBounds = useCallback(
        debounce((clubsToFit: Club[]) => {
            if (!clubsToFit.length) return;

            if (clubsToFit.length === 1) {
                // For single club view, zoom in closer
                const club = clubsToFit[0];
                const lat = Number(club.latitude);
                const lng = Number(club.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    map.setView([lat, lng], 15);
                }
                return;
            }

            // Filter valid coordinates
            const validClubs = clubsToFit.filter(club => 
              club.latitude && club.longitude && 
              !isNaN(Number(club.latitude)) && !isNaN(Number(club.longitude)) &&
              Math.abs(Number(club.latitude)) <= 90 && Math.abs(Number(club.longitude)) <= 180
            );

            if (validClubs.length === 0) {
                map.setView([39.8283, -98.5795], 4);
                return;
            }

            // Convert to coordinates for bounds calculation
            const coords = validClubs.map(club => ({
              latitude: Number(club.latitude),
              longitude: Number(club.longitude),
            }));

            const bounds = calculateBounds(coords);
            if (bounds) {
                const latLngBounds = new LatLngBounds(
                    [[bounds.minLat, bounds.minLng], [bounds.maxLat, bounds.maxLng]]
                );
                map.fitBounds(latLngBounds, { padding: [50, 50] });
            } else {
                map.setView([39.8283, -98.5795], 4);
            }
        }, 100),
        [map]
    );

    useEffect(() => {
        updateBounds(clubs);
    }, [clubs, updateBounds]);

    return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  clubs,
  center,
  radius,
  onMarkerClick,
  showNumbers = true,
  initialZoom = 8,
  children
}) => {
  // Memoize valid clubs to prevent unnecessary recalculations
  const validClubs = useMemo(() => {
    return clubs.filter(club => 
      club.latitude && club.longitude && 
      !isNaN(Number(club.latitude)) && !isNaN(Number(club.longitude)) &&
      Math.abs(Number(club.latitude)) <= 90 && Math.abs(Number(club.longitude)) <= 180
    );
  }, [clubs]);

  // Memoize marker click handler
  const handleMarkerClick = useCallback(
    (clubId: string) => {
      onMarkerClick?.(clubId);
    },
    [onMarkerClick]
  );
  
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ height: '400px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer 
          center={[Number(center[0]), Number(center[1])]} 
          zoom={initialZoom} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {radius > 0 && (
            <Circle
              center={[Number(center[0]), Number(center[1])]}
              radius={radius * 1609.34} // Convert miles to meters
              pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue' }}
            />
          )}
          
          <MapBounds clubs={validClubs} />
          
          {validClubs.map((club, index) => (
            <Marker
              key={club.id}
              position={[Number(club.latitude), Number(club.longitude)]}
              icon={createNumberedMarker(index)}
              eventHandlers={{
                click: () => handleMarkerClick(club.id)
              }}
            >
              <Popup>
                {club.club_name || 'Golf Club'}
              </Popup>
            </Marker>
          ))}
          
          {children}
        </MapContainer>
      </Box>
    </Box>
  );
};

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
