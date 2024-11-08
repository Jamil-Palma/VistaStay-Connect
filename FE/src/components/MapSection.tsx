// src/components/MapSection.tsx
import React from 'react';
import MapComponent from './MapComponent';

interface MapSectionProps {
  onLocationSelect: (locationName: string, lat: number, lng: number) => void;
  onUUIDGenerated: (uuid: string) => void;
}

const MapSection: React.FC<MapSectionProps> = ({ onLocationSelect, onUUIDGenerated }) => {
  return (
    <div className="map-section">
      <MapComponent onLocationSelect={onLocationSelect} onUUIDGenerated={onUUIDGenerated} />
    </div>
  );
};

export default MapSection;
