// src/components/SearchSection.tsx
import React from 'react';
import SearchResult from './SearchResult';

interface SearchSectionProps {
  results: any[];
  onScrape: (url: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ results, onScrape }) => {
  return (
    <div className="search-section">
      <ul>
        {results.length > 0 ? (
          results.map((result, index) => (
            <SearchResult key={index} result={result} onScrape={onScrape} />
          ))
        ) : (
          <p>No results to display.</p>
        )}
      </ul>
    </div>
  );
};

export default SearchSection;
