import React, { useState, useEffect , useMemo} from 'react';
import { useClientStore } from '../../store/clientStore';
import {Client} from '../../types/index'

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

export const ClientDetails = () => {
  const client = useClientStore((state) => state.currentClient);
  const [selectedParameter, setSelectedParameter] = useState<SearchParameter>(searchParameterKeys[0]);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [parameterValues, setParameterValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  if (!client) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No client selected</h2>
        <p className="mt-2 text-gray-600">Please switch to a client first</p>
      </div>
    );
  }

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
    }
    return filteredClients;
  }, [clients, sortConfig, selectedParameter]);

  useEffect(() => {
  const fetchCases = async () => {
    if (!selectedParameter || !searchValue) return;
    
    const token = localStorage.getItem('authToken');
    try {
      setIsLoading(true);
      // Get the correct parameter key from searchParameters
      const paramKey = searchParameters[selectedParameter as keyof typeof searchParameters];
      console.log("know the paramkey ITSS ",paramKey);
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
  };fetchCases();
}, [client?.clientId]);


  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Client Details</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Client ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.clientId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Case ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.case_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">FIR Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.fir_number}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Case Code</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.case_code}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Party Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.party_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Advocate Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.advocate_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Act</dt>
            <dd className="mt-1 text-sm text-gray-900">{client.act}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};