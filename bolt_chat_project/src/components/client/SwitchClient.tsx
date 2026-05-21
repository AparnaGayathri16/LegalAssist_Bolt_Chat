import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../../store/clientStore';

interface Client {
  clientId: string;
  case_id: string;
  fir_number: string;
  case_code: string;
  party_name: string;
  advocate_name: string;
  act: string;
}

interface SortConfig {
  key: keyof Client | null;
  direction: 'ascending' | 'descending';
}

const searchParameters = {
  "Client Id": "client_id",
  "Case ID": "case_id",
  "Fir number": "fir_number",
  "Case code": "case_code",
  "Party name": "party_name",
  "Advocate name": "advocate_name",
  "Act": "act"
} as const;

type SearchParameter = typeof searchParameters[number];

const searchParameterKeys = Object.keys(searchParameters);

export const SwitchClient = () => {
  const navigate = useNavigate();
  const setCurrentClient = useClientStore((state) => state.setCurrentClient);
  
  const [selectedParameter, setSelectedParameter] = useState<SearchParameter>(searchParameterKeys[0]);
  const [partyNameforCase, setpartynameforcase] = useState<SearchParameter>("Party name");
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [parameterValues, setParameterValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  const handleParameterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const param = e.target.value as SearchParameter;
    setSelectedParameter(param);
    setSearchValue('');
    setSearchResults([]);
    
    // Fetch values for the selected parameter
    const token = localStorage.getItem('authToken');
    try {
      setIsLoading(true);
      const paramKey = searchParameters[param];
      const response = await fetch(
        `http://localhost:8082/searchParams?parameter=${paramKey}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          method: "GET"
        }
      );

      const data = await response.json();
      console.log('Raw parameter values:', data);
      
      // Extract values from the response data
      let values: string[] = [];
      if (Array.isArray(data)) {
        values = data.map(item => {
          // If item is an object, extract the first value
          if (typeof item === 'object' && item !== null) {
            return String(Object.values(item)[0]);
          }
          // If item is a primitive value, convert to string
          return String(item);
        });
      }
      
      console.log('Processed parameter values:', values);
      setParameterValues(values);
    } catch (error) {
      console.error('Error fetching parameter values:', error);
      setParameterValues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchValue(e.target.value);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!selectedParameter || !searchValue) return;
    
    const token = localStorage.getItem('authToken');
    try {
      setIsLoading(true);
      // Get the correct parameter key from searchParameters
      const paramKey = searchParameters[selectedParameter as keyof typeof searchParameters];
      console.log('Selected parameter:', selectedParameter);
      console.log('Parameter key:', paramKey);
      console.log('Search value:', searchValue);

      const response = await fetch(
        `http://localhost:8082/clients?parameter=${paramKey}&value=${searchValue}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          method: "GET"
        }
      );

      const data = await response.json();
      console.log('Search results:', data);
      
      if (Array.isArray(data)) {
        setSearchResults(data);
      } else {
        console.error('Unexpected response format:', data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedClients = useMemo(() => {
    let filteredClients = clients.filter(client =>
      client.party_name.toLowerCase().includes(selectedParameter.toLowerCase()) ||
      client.case_id.toLowerCase().includes(selectedParameter.toLowerCase()) ||
      client.clientId.toLowerCase().includes(selectedParameter.toLowerCase()) ||
      client.fir_number.toLowerCase().includes(selectedParameter.toLowerCase()) ||
      client.case_code.toLowerCase().includes(selectedParameter.toLowerCase()) ||
      client.advocate_name.toLowerCase().includes(selectedParameter.toLowerCase()) ||
      client.act.toLowerCase().includes(selectedParameter.toLowerCase())
    );

    if (sortConfig.key !== null) {
      filteredClients.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    };
    return filteredClients;
  }, [clients, sortConfig, selectedParameter]);

  const handleSelect = (client: Client) => {
    // Set client in Zustand store
    setCurrentClient(client);
    // Navigate to client details with party name
    navigate('/client/details');
  };

  const handleAddCase = (client: Client) => {
    setCurrentClient(client);
    navigate('/client/new', { 
      state: { 
        isNewCase: true,
        clientId: client.clientId,
        party_name: client.party_name 
      } 
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold mb-6">Client Search</h2>
        <div className="flex space-x-4">
          <select
            className="form-select p-2 border rounded"
            value={selectedParameter}
            onChange={handleParameterChange}
          >
            <option value="">Select a parameter to search</option>
            {searchParameterKeys.map((param) => (
              <option key={param} value={param}>
                {param}
                
              </option>
            ))}
          </select>

          <select
            className="form-select p-2 border rounded"
            value={searchValue}
            onChange={handleValueChange}
            disabled={isLoading || parameterValues.length === 0}
          >
            <option value="">Select a value</option>
            {parameterValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleSearch}
            disabled={isLoading || !searchValue}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Search Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Client ID</th>
                    <th className="px-4 py-2">Case ID</th>
                    <th className="px-4 py-2">FIR Number</th>
                    <th className="px-4 py-2">Case Code</th>
                    <th className="px-4 py-2">Party Name</th>
                    <th className="px-4 py-2">Advocate Name</th>
                    <th className="px-4 py-2">Act</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((client) => (
                    <tr key={client.clientId} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{client.clientId}</td>
                      <td className="border px-4 py-2">{client.case_id}</td>
                      <td className="border px-4 py-2">{client.fir_number}</td>
                      <td className="border px-4 py-2">{client.case_code}</td>
                      <td className="border px-4 py-2">{client.party_name}</td>
                      <td className="border px-4 py-2">{client.advocate_name}</td>
                      <td className="border px-4 py-2">{client.act}</td>
                      <td className="border px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSelect(client)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleAddCase(client)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                          >
                            Add Case
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwitchClient;