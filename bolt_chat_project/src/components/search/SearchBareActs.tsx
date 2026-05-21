import React, { useState, useRef } from 'react';
import { useClientStore } from '../../store/clientStore';

interface SearchResultItem {
  id: number;
  document_name: string;
  table_name: string;
  similarity_score: number;
  summary_text: string;
}

interface SearchResponse {
  results: SearchResultItem[];
}

export const SearchBareActs = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'similarity' | 'keyword'>('similarity');
  const [searchPerformed, setSearchPerformed] = useState<boolean | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentClient = useClientStore((state) => state.currentClient);

  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setError('Search cancelled by user');
    }
  };

  const searchSimilarity = async () => {
    if (!query) return;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setSearchPerformed(false);
    setResults([]);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8082/bare_act_similarity_search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results || []);
        setSearchPerformed(true);
      } else {
        console.error('Search failed');
        setError('Search failed. Please try again.');
        setSearchPerformed(true);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Search aborted');
      } else {
        console.error('Error during search:', error);
        setError('An error occurred during search');
        setSearchPerformed(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const searchKeyword = async () => {
    if(!query) return;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setSearchPerformed(false);
    setResults([]);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:8082/bare_act_keyword_search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results || []);
        setSearchPerformed(true);
      } else {
        console.error('Search failed');
        setError('Search failed. Please try again.');
        setSearchPerformed(true);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Search aborted');
      } else {
        console.error('Error during search:', error);
        setError('An error occurred during search');
        setSearchPerformed(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleViewDocument = async (document_name, e) => {
    e.preventDefault();
    console.log("view button clicked")
    setLoading(true);
      const token = localStorage.getItem('authToken');
      console.log(document_name)
      try {
        const response = await fetch(
          `http://localhost:8082/fetchBareAct?document_name=${document_name}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            method: 'GET',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        const data = await response.json();
        console.log(data);
        setUrl(data.downloadUrl);

      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
        window.open(url, '_blank');
      }
    };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-6 text-black">Search Bare Acts</h2>
      
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <input
            type="text"
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your search query..."
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              setSearchType('similarity');
              searchSimilarity();
            }}
            className={`flex-1 py-2 px-4 rounded-md ${
              searchType === 'similarity'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Similarity Search
          </button>
          <button
            onClick={() => {
              setSearchType('keyword');
              searchKeyword();
            }}
            className={`flex-1 py-2 px-4 rounded-md ${
              searchType === 'keyword'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Keyword Search
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex justify-center items-center text-xl text-gray-600 mb-4">
            Searching our documents
            <div className="ml-2 flex space-x-1">
              <span className="animate-wave">.</span>
              <span className="animate-wave delay-100">.</span>
              <span className="animate-wave delay-200">.</span>
            </div>
          </div>
          <button
            onClick={handleStopSearch}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Stop Search
          </button>
        </div>
      )}

      {/* No Results or Error State */}
      {!isLoading && searchPerformed && (results.length === 0 || error) && (
        <div className="text-center text-black font-semibold text-gray-600 text-xl">
          {error 
            ? "Sorry, I cannot help you with that search:("            
            : `No documents found for "${query}"`
          }
        </div>
      )}

      {/* Search Results */}
      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-blue-700">{result.document_name}</h3>
              <p className="text-gray-600 mt-2">{result.summary_text}</p>
              {result.table_name && (
                <div className="text-sm text-gray-500 mt-2">
                  Type: {result.table_name}
                </div>
              )}
              <a href="#" onClick={(e) => handleViewDocument(result.document_name,  e)} className="text-indigo-600 hover:underline">
                View Document
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};