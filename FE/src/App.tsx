// src/App.tsx
import React, { useState } from 'react';
import './App.css';
import MapSection from './components/MapSection';
import ResultsSection from './components/ResultsSection';
import useLocationSearch from './hooks/useLocationSearch';
import { scrapeContent } from './services/api';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<string>('Select a location on the map');
  const [locationData, setLocationData] = useState<{ label: string; lat: number; lng: number } | null>(null);
  const [uuid, setUUID] = useState<string | null>(null);

  const { results, loading, completed, travelPlan, initiateSearch, initiateTravelPlan } = useLocationSearch();

  const simplifyLocationName = (locationName: string): string => {
    // Dividimos la dirección en partes separadas por comas
    const parts = locationName.split(',');
  
    // Usamos solo los primeros 2-3 componentes de la dirección
    if (parts.length >= 3) {
      // Ejemplo: toma solo el número de calle y el nombre de la calle
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    } else {
      // Si la dirección es más corta de lo esperado, simplemente devuélvela como está
      return locationName;
    }
  };
  
  const handleLocationSelect = (locationName: string, lat: number, lng: number) => {
    const simplifiedLocation = simplifyLocationName(locationName);
    console.log("++++++++++++ u ++++++++++++++ ", simplifiedLocation);
    setSelectedLocation(simplifiedLocation || `Coordinates: (${lat}, ${lng})`);
    setLocationData({ label: locationName, lat, lng });
    initiateSearch(simplifiedLocation);
  };
  

  const handleUUIDGenerated = (generatedUUID: string) => {
    console.log("UUID received in App:", generatedUUID); // Verifica que el UUID es correcto
    setUUID(generatedUUID); // Actualiza el estado de `uuid` en `App`
  };

  const handleScraping = async (url: string) => {
    if (!uuid) {
      console.error("UUID not available, cannot scrape content.");
      return;
    }

    try {
      const response = await scrapeContent(url, uuid);
      alert(`Scraped content: ${response.data.content}`);
    } catch (error) {
      console.error('Error during scraping:', error);
    }
  };

  const handleStartTravelPlan = (urls: string[]) => {
    if (!uuid) {
      console.error("UUID not available, cannot start travel plan.");
      return;
    }

    if (urls.length === 0) {
      console.error("No URLs available to start the travel plan.");
      return;
    }

    console.log("Initiating travel plan with URLs:", urls); // Confirmación de URLs
    initiateTravelPlan(selectedLocation, uuid, urls); // Utiliza el UUID correcto y las URLs de eventos
  };

  return (
    <div className="app-container">
      <MapSection onLocationSelect={handleLocationSelect} onUUIDGenerated={handleUUIDGenerated} />
      <ResultsSection
        selectedLocation={selectedLocation}
        results={results}
        loading={loading}
        completed={completed}
        onScrape={handleScraping}
        onStartTravelPlan={handleStartTravelPlan}
        uuid={uuid} // Pasar el UUID como prop a ResultsSection
      />
    </div>
  );
}

export default App;
