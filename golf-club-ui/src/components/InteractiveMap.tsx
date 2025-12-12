// components/InteractiveMap.tsx
import React, { useEffect, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import { divIcon } from 'leaflet';
import type { Club } from '../types/Club';
import { calculateBounds, filterValidCoordinates, debounce } from '../utils/mapOptimization';

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

// Create a consistent marker style function
export const createNumberedMarker = (index: number) => {
  return divIcon({
    className: 'custom-div-icon',
    html: `<div class='marker-pin'>${index + 1}</div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });
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

            // Use optimized bounds calculation
            const validCoords = filterValidCoordinates(clubsToFit);
            if (validCoords.length === 0) {
                map.setView([39.8283, -98.5795], 4);
                return;
            }

            const bounds = calculateBounds(validCoords);
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
    return filterValidCoordinates(clubs);
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
