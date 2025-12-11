// components/InteractiveMap.tsx
import React, { useEffect, useRef, forwardRef, useMemo } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap, Circle, Marker, Popup } from 'react-leaflet';
import { LatLngBounds, LatLng } from 'leaflet';
import L from 'leaflet';
import { divIcon } from 'leaflet';
import type { Club } from '../types/Club';

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

export const MapBounds: React.FC<{ clubs: any[] }> = ({ clubs }) => {
    const map = useMap();

    useEffect(() => {
        if (!clubs.length) return;

        if (clubs.length === 1) {
            // For single club view, zoom in closer
            const club = clubs[0];
            map.setView([club.lat || club.latitude, club.lng || club.longitude], 15);
            return;
        }

        // Original bounds logic for multiple clubs
        const bounds = new LatLngBounds(
            clubs.map(club => [
                club.latitude || 0,
                club.longitude || 0
            ] as [number, number])
        );

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([39.8283, -98.5795], 4);
        }
    }, [clubs, map]);

    return null;
};

export const InteractiveMap = forwardRef<HTMLDivElement, InteractiveMapProps>(({
  clubs,
  center,
  radius,
  onMarkerClick,
  showNumbers = true,
  initialZoom = 8,
  children
}, ref) => {
  // Ensure all clubs have valid coordinates and convert to numbers
  const validClubs = clubs.filter(club => 
    club.latitude && club.longitude && 
    !isNaN(Number(club.latitude)) && !isNaN(Number(club.longitude)) &&
    Math.abs(Number(club.latitude)) <= 90 && Math.abs(Number(club.longitude)) <= 180
  );
  
  return (
    <Box ref={ref} sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ height: '400px', width: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer 
          center={[Number(center[0]), Number(center[1])]} 
          zoom={initialZoom} 
          style={{ height: '100%', width: '100%' }}
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
                click: () => onMarkerClick && onMarkerClick(club.id)
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
});

InteractiveMap.displayName = 'InteractiveMap';

export default InteractiveMap;
