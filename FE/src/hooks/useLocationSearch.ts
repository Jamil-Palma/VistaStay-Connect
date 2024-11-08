// src/hooks/useLocationSearch.ts
import { useState } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { runSimpleSearch, startTravelPlan } from '../services/api';

interface UseLocationSearchResult {
  results: { hotels: any[]; events: any[]; news: any[] };
  loading: { hotels: boolean; events: boolean; news: boolean; travelPlan: boolean };
  completed: { hotels: boolean; events: boolean; news: boolean };
  travelPlan: any | null;
  initiateSearch: (locationLabel: string) => void;
  initiateTravelPlan: (locationLabel: string, folderUUID: string, urls: string[]) => void;
}

const useLocationSearch = (): UseLocationSearchResult => {
  const [results, setResults] = useState({ hotels: [], events: [], news: [] });
  const [loading, setLoading] = useState({ hotels: false, events: false, news: false, travelPlan: false });
  const [completed, setCompleted] = useState({ hotels: false, events: false, news: false });
  const [travelPlan, setTravelPlan] = useState<any | null>(null);

  let cancelTokenSource: CancelTokenSource | null = null;

  const initiateSearch = (locationLabel: string) => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Search cancelled due to a new location selection.");
    }
    cancelTokenSource = axios.CancelToken.source();
    performSearch('hotels', locationLabel, cancelTokenSource);
  };

  const performSearch = async (category: 'hotels' | 'events' | 'news', locationLabel: string, cancelTokenSource: CancelTokenSource) => {
    setLoading(prev => ({ ...prev, [category]: true }));
    setCompleted(prev => ({ ...prev, [category]: false }));
  
    try {
      const response = await runSimpleSearch(`${locationLabel} ${category} hotel contact phone number`, cancelTokenSource.token);
      console.log(`Response for ${category}:`, response.data.result_content);
      setResults(prev => ({ ...prev, [category]: response.data.result_content || [] }));
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log(`Request cancelled: ${category}`);
      } else {
        console.error(`Error fetching ${category} results:`, error);
      }
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }));
      setCompleted(prev => ({ ...prev, [category]: true }));
  
      if (category === 'hotels' && !axios.isCancel(cancelTokenSource.token)) {
        await performSearch('events', locationLabel, cancelTokenSource);
      } else if (category === 'events' && !axios.isCancel(cancelTokenSource.token)) {
        await performSearch('news', locationLabel, cancelTokenSource);
      }
    }
  };
  

  const initiateTravelPlan = async (locationLabel: string, folderUUID: string, urls: string[]) => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Travel plan cancelled due to a new location selection.");
    }
    cancelTokenSource = axios.CancelToken.source();
    setLoading(prev => ({ ...prev, travelPlan: true }));
    
    console.log("Starting travel plan with:", { locationLabel, folderUUID, urls }); // Depuración

    try {
      const response = await startTravelPlan(locationLabel, folderUUID, urls, cancelTokenSource.token);
      console.log("Travel plan response:", response.data); // Depuración
      setTravelPlan(response.data.travel_plan); // Actualizar el plan de viaje con los datos del backend
      console.log("Travel Plan set:", response.data.travel_plan); // Confirmación de que el estado se actualizó
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Travel plan request cancelled");
      } else {
        console.error("Error generating travel plan:", error);
      }
    } finally {
      setLoading(prev => ({ ...prev, travelPlan: false }));
    }
  };

  return { results, loading, completed, travelPlan, initiateSearch, initiateTravelPlan };
};

export default useLocationSearch;
