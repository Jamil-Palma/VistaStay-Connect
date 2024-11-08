// src/components/SearchResult.tsx
import React from 'react';

interface SearchResultProps {
  result: {
    title: string;
    snippet: string;
    link: string;
  };
  onScrape: (url: string) => void;
}

const SearchResult: React.FC<SearchResultProps> = ({ result, onScrape }) => {
  return (
    <li className="search-result">
      <h5>{result.title}</h5>
      <p>{result.snippet}</p>
      <a href={result.link} target="_blank" rel="noopener noreferrer">View more</a>
      <button onClick={() => onScrape(result.link)}>Learn More</button>
    </li>
  );
};

export default SearchResult;
