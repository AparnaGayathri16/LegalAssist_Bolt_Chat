import React, { useState, useEffect, useMemo } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../../store/clientStore';

interface Case {
  case_id: string;
}

export const DocumentUpload = () => {
  const currentClient = useClientStore((state) => state.currentClient)
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (currentClient) {
      setClientId(currentClient.clientId);
    } else {
      setClientId(null);
    }
  }, [currentClient]);

  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);  
  const [file, setFile] = useState<File | null>(null);
  const [selectedCaseNumber, setSelectedCaseNumber] = useState<string | null>(null);
  const [fetchedCases, setFetchedCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadButtonSuccess, setUploadButtonSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  useEffect(() => {    
    const fetchCases = async () => {
      if (!clientId) {
        setError('No client selected');
        setFetchedCases([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await fetch(
          `http://localhost:8082/client?client_id=${clientId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            method: "GET"
          }
        );

        const data = await response.json();
        console.log(data);
        if (Array.isArray(data)) {
          setFetchedCases(data);
        } else {
          setError("Unexpected response format.");
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
        setError('Failed to load cases.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCases();
  }, [clientId]);

  const handleSelectCaseNumber = (case_id: string) => {
    setSelectedCaseNumber(case_id);
  };
  
  const handleUpload = async () => {
    if (!clientId) {
      alert({
        title: "Missing Client",
        description: "Please select a client first.",
        variant: "destructive",
      });
      return;
    }

    if (!file || !selectedCaseNumber) {
      setError("Please select a file and a case number.");
      return;
    }

    const formData = new FormData();
    formData.append("files", file);
    const token = localStorage.getItem('authToken');

    setIsLoading(true);
    setUploadProgress(0);

    try {
      handleSelectCaseNumber(selectedCaseNumber);
      const response = await fetch(
        `http://localhost:8082/upload/${clientId}/${selectedCaseNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUploadButtonSuccess(true);
      } else {
        const errorData = await response.json();
        console.log("Error:", errorData);
        setError(errorData.message || 'Sorry this file cannot be uploaded');
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while uploading the file.");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Case Number Selection */}
        <div className="mb-6">
          <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Select Case Number
          </label>
          <select
            id="caseNumber"
            value={selectedCaseNumber || ''}
            onChange={(e) => handleSelectCaseNumber(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a case...</option>
            {fetchedCases.map((caseItem) => (
              <option key={caseItem} value={caseItem}>
                {caseItem}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            Select Document
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">Any file up to 10MB</p>
            </div>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || !selectedCaseNumber || isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              !file || !selectedCaseNumber || isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Document'
            )}
          </button>
        </div>

        {/* Error Display */}
        { uploadButtonSuccess ? (
          <div className="mt-4 text-green-600">
            File Uploaded Successfully!
          </div>
        ) : null}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};