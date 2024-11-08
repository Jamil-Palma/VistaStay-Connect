import React, { useEffect, useState } from 'react';
import Tabs from './Tabs';
import CityChat from './CityChat';
import { analyzeData, generateHotelInfo } from '../services/api';

interface ResultsSectionProps {
  selectedLocation: string;
  results: { hotels: any[]; events: any[]; news: any[] };
  loading: { hotels: boolean; events: boolean; news: boolean; travelPlan: boolean };
  completed: { hotels: boolean; events: boolean; news: boolean };
  onScrape: (url: string) => void;
  onStartTravelPlan: (urls: string[]) => void;
  uuid: string | null;
}

interface AnalysisResponse {
  query: string;
  response: string;
}

interface HotelInfoResponse {
  filename: string;
  response: string;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ selectedLocation, results, loading, completed, onScrape, onStartTravelPlan, uuid }) => {
  const [eventUrls, setEventUrls] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse[]>([]);
  const [hotelInfo, setHotelInfo] = useState<HotelInfoResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'hotelInfo' | 'cityChat'>('hotelInfo'); 
  const [hotelInfoExpanded, setHotelInfoExpanded] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loadingHotelInfo, setLoadingHotelInfo] = useState<boolean>(false); // New state for loading spinner

  useEffect(() => {
    const urls = Array.isArray(results.events) ? results.events.map(event => event.link).filter(Boolean) : [];
    setEventUrls(urls);
  }, [results.events]);
  
  const handleShowUUID = () => {
    console.log("Current UUID:", uuid);
  };

  const handleAnalyzeData = async () => {
    if (!uuid) {
      console.error("UUID not available, cannot analyze data.");
      return;
    }

    const questions = [
      "What are the most popular hotels near this location?",
      "Are there any highly-rated hotels for families?",
      "What events are happening in this location?",
      "What are popular tourist attractions around here?",
      "Are there any recreational activities nearby?",
      "Tell me about the history of this location."
    ];

    const newAnalysisResults: AnalysisResponse[] = [];

    for (const question of questions) {
      try {
        const response = await analyzeData(uuid, question);
        if (response.data.response && response.data.response.trim() !== "Empty Response") {
          newAnalysisResults.push({
            query: question,
            response: response.data.response,
          });
        }
      } catch (error) {
        console.error(`Error analyzing data for question "${question}":`, error);
      }
    }

    setAnalysisResults(newAnalysisResults);
  };

  const handleGenerateHotelInfo = async () => {
    if (!uuid) {
      console.error("UUID not available, cannot generate hotel info.");
      return;
    }

    setLoadingHotelInfo(true); // Start loading

    try {
      const response = await generateHotelInfo(uuid);
      const filteredResponses = response.data.responses.filter(
        (info: HotelInfoResponse) => info.response.trim() !== "The content provided does not contain sufficient hotel information."
      );

      if (filteredResponses.length === 0) {
        setHotelInfo([{ filename: "", response: "The content provided does not contain sufficient hotel information." }]);
      } else {
        setHotelInfo(filteredResponses);
      }
    } catch (error) {
      console.error("Error generating hotel info:", error);
    } finally {
      setLoadingHotelInfo(false); // End loading
    }
  };

  return (
    <div className="results-section">
      <h3>Search Results for: {selectedLocation}</h3>

      <div className="instructions">
        <p><strong>Usage Guide:</strong></p>
        <ol>
          <li>Click anywhere on the map to view information about that location.</li>
          <li>Press <strong>Start Travel Plan</strong> to begin generating a travel plan.</li>
          <li>To chat with insights about this location, select the <strong>Chat with City</strong> tab and click <strong>Analyze Data</strong> first.</li>
          <li>To generate a detailed plan with recommendations, use <strong>Generate Hotel Info</strong> and review the information under the <strong>Hotel Information</strong> tab.</li>
        </ol>
      </div>

      <button 
        onClick={() => onStartTravelPlan(eventUrls)} 
        disabled={loading.travelPlan || eventUrls.length === 0}
        className="button-style"
      >
        {loading.travelPlan ? "Generating Travel Plan..." : "Start Travel Plan"}
      </button>

      <button 
        onClick={handleAnalyzeData} 
        disabled={!uuid} 
        className="button-style"
      >
        Analyze Data
      </button>

      <button 
        onClick={handleGenerateHotelInfo} 
        disabled={!uuid || loadingHotelInfo} 
        className="button-style"
      >
        {loadingHotelInfo ? "Generating Hotel Info..." : "Generate Hotel Info"}
      </button>

      <div className="additional-tabs">
        <button onClick={() => setActiveTab('hotelInfo')} className={activeTab === 'hotelInfo' ? 'active' : 'button-style'}>
          Hotel Information
        </button>
        <button onClick={() => setActiveTab('cityChat')} className={activeTab === 'cityChat' ? 'active' : 'button-style'}>
          Chat with City
        </button>
      </div>

      <div className="additional-tab-content">
        {activeTab === 'hotelInfo' && hotelInfo.length > 0 && (
          <div className="hotel-info">
            <button onClick={() => setHotelInfoExpanded(!hotelInfoExpanded)} className="button-style">
              {hotelInfoExpanded ? "Hide Details" : "Show Details"}
            </button>
            {hotelInfoExpanded && (
              <div className="hotel-info-details">
                {hotelInfo.map((info, index) => (
                  <div key={index} className="hotel-info-item">
                    <p><strong>Option {index + 1}:</strong> {info.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'cityChat' && (
          <CityChat uuid={uuid} messages={chatMessages} setMessages={setChatMessages} />
        )}
      </div>

      <Tabs results={results} loading={loading} completed={completed} onScrape={onScrape} />
    </div>
  );
};

export default ResultsSection;
