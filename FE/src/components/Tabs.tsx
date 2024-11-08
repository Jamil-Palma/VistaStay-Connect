// src/components/Tabs.tsx
import React, { useState, useEffect } from 'react';
import SearchResult from './SearchResult';
import './Tabs.css';

interface TabsProps {
  results: {
    hotels: any[];
    events: any[];
    news: any[];
  };
  loading: {
    hotels: boolean;
    events: boolean;
    news: boolean;
  };
  completed: {
    hotels: boolean;
    events: boolean;
    news: boolean;
  };
  onScrape: (url: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ results, loading, completed, onScrape }) => {
  const [activeTab, setActiveTab] = useState<'hotels' | 'events' | 'news'>('hotels');

  const renderTabContent = (category: 'hotels' | 'events' | 'news') => {
    const categoryResults = results[category];
    const categoryLoading = loading[category];

    return (
      <div className="tab-content">
        {categoryLoading ? (
          <p>Loading {category} results...</p>
        ) : categoryResults.length > 0 ? (
          <ul>
            {categoryResults.map((result, index) => (
              <SearchResult key={index} result={result} onScrape={onScrape} />
            ))}
          </ul>
        ) : (
          <p>No results found for {category}.</p>
        )}
      </div>
    );
  };

  return (
    <div className="tabs">
      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab('hotels')}
          className={`${activeTab === 'hotels' ? 'active' : ''} ${completed.hotels ? 'completed' : ''}`}
        >
          Hotels
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`${activeTab === 'events' ? 'active' : ''} ${completed.events ? 'completed' : ''}`}
        >
          Recreational Events
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`${activeTab === 'news' ? 'active' : ''} ${completed.news ? 'completed' : ''}`}
        >
          Latest News
        </button>
      </div>
      {renderTabContent(activeTab)}
    </div>
  );
};

export default Tabs;
