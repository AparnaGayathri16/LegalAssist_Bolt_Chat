import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../../store/clientStore';

export const CaseAddSuccess = () => {
  const navigate = useNavigate();
  const currentClient = useClientStore((state) => state.currentClient);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          New Case Added Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          The new case has been added to client in our database.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Client Details:</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Client ID:</span> {currentClient?.clientId}</p>
          <p><span className="font-medium">Party Name:</span> {currentClient?.party_name}</p>
          <p><span className="font-medium">Case ID:</span> {currentClient?.case_id}</p>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/client/details')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          View Full Details
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default CaseAddSuccess;