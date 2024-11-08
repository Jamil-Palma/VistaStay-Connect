import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import axios from 'axios';
import L from 'leaflet';
import '../styles/MapComponent.css';

interface Position {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  onLocationSelect: (locationName: string, lat: number, lng: number) => void;
  onUUIDGenerated: (uuid: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect, onUUIDGenerated }) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [currentUUID, setCurrentUUID] = useState<string | null>(null); // UUID actual guardado
  const provider = new OpenStreetMapProvider();

  const SearchField = () => {
    const map = useMap();

    useEffect(() => {
      const searchControl: any = new (GeoSearchControl as any)({
        provider: provider,
        style: 'bar',
        autoClose: true,
        keepResult: true,
      });

      map.addControl(searchControl);

      map.on('geosearch/showlocation', (result: any) => {
        const { label, x, y } = result.location;
        const newPosition = { lat: y, lng: x };
        setPosition(newPosition);
        setLocationLabel(label);
        onLocationSelect(label, y, x);
        map.setView(newPosition, 12);

        console.log("Location selected through search:", label);

        // Genera y guarda el UUID solo si no existe uno o cambia la ubicación
        if (!currentUUID || locationLabel !== label) {
          createUUIDFolder(label);
        }
      });

      return () => {
        map.removeControl(searchControl);
      };
    }, [map, locationLabel, currentUUID]);

    return null;
  };

  const createUUIDFolder = async (locationName: string) => {
    // Genera un nuevo UUID en cada llamada a `createUUIDFolder`
    const newUUID = uuidv4();
    setCurrentUUID(newUUID); // Actualiza el estado de `currentUUID` con el nuevo UUID
    console.log("Attempting to create folder with UUID:", newUUID);
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/generate_uuid_folder/', {
        locationName,
        folderUUID: newUUID, // Usar el nuevo UUID generado aquí
      });
  
      console.log("Folder created with UUID:", newUUID);
      console.log("Folder created with response:", response);
  
      // Llama a `onUUIDGenerated` con el nuevo UUID para actualizarlo en `App`
      onUUIDGenerated(newUUID);
    } catch (error) {
      console.error("Error creating UUID folder:", error);
    }
  };
  
  
  
  
  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setLocationLabel(data.display_name);
        onLocationSelect(data.display_name, lat, lng);

        // Genera y guarda el UUID solo si no existe uno o cambia la ubicación
        if (!currentUUID || locationLabel !== data.display_name) {
          createUUIDFolder(data.display_name);
        }
      } else {
        const fallback = `Lat: ${lat}, Lng: ${lng}`;
        setLocationLabel(fallback);
        onLocationSelect(fallback, lat, lng);

        // Llamada de respaldo en caso de que no haya un nombre específico
        createUUIDFolder(fallback);
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      const fallback = `Lat: ${lat}, Lng: ${lng}`;
      setLocationLabel(fallback);
      onLocationSelect(fallback, lat, lng);
      createUUIDFolder(fallback);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(newPosition);
        fetchLocationName(newPosition.lat, newPosition.lng); // Obtener nombre y crear UUID solo si es necesario
      },
    });
    return null;
  };

  return (
    <div className="map-container">
      <MapContainer center={[40.7128, -74.006]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {position && <Marker position={position} icon={L.icon({ iconUrl: 'marker-icon.png' })} />}
        <SearchField />
        <MapClickHandler />
      </MapContainer>

      <div className="location-info">
        <p>{locationLabel ? `Selected location: ${locationLabel}` : 'Click on the map to select a location.'}</p>
      </div>
    </div>
  );
};

export default MapComponent;
