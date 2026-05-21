import React, { useState } from 'react';
import { Document } from '../../types';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import { useClientStore } from '../../store/clientStore';

const documentTypes = [
  'Affidavit',
  'Evidence',
  'FIR',
  'Memo',
  'Notices',
  'Plaints',
] as const;

export const DocumentView = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<boolean | null>(null);
  const [downloadUrl, setdownloadUrl] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const currentClient = useClientStore((state) => state.currentClient)

  const handleFetch = async () => {
    const type = selectedType;
    const clientIdParam = currentClient.clientId;
    const caseIdParam = currentClient.case_id;
    if (!type || !clientIdParam || !caseIdParam) return;
    
    setLoading(true);
    setError(null);
    const authToken = localStorage.getItem('authToken');
    try {
      const response = await fetch(
        `http://localhost:8082/list?clientId=${clientIdParam}&case_id=${caseIdParam}&document_type=${type}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          method: 'GET',
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
  
      const data = await response.json();
      console.log('API Response:', data);
  
      // Filter out documents with an empty document_name
      const filteredDocuments = Array.isArray(data.file_list)
        ? data.file_list.map(doc => ({
            ...doc,
            document_type: type  // Set the document type from the selected type
          })).filter(doc => doc.document_name)
        : [];
  
      setDocuments(filteredDocuments);
      setdownloadUrl(Array.isArray(data.download_url) ? data.download_url : []);
      
      if (filteredDocuments.length === 0) {
        setError('No documents found');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (e, doc) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(doc.download_url)
    window.open(doc.download_url, '_blank');
  };

  const handleDeleteClick = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setDocumentToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const clientIdParam = "CN-TN-OTY-DIN-2023-06-123456";
      const caseIdParam = "CASENO12345";
      
      console.log('Deleting document:', {
        clientId: clientIdParam,
        case_id: caseIdParam,
        document_type: selectedType,
        file: documentToDelete.document_name
      });

      const response = await fetch(
        `http://localhost:8082/delete?clientId=${clientIdParam}&case_id=${caseIdParam}&document_type=${selectedType}&file=${encodeURIComponent(documentToDelete.document_name)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete error response:', errorData);
        throw new Error('Failed to delete the document');
      }

      // Remove the deleted document from the list
      setDocuments(documents.filter(doc => doc.document_id !== documentToDelete.document_id));
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete the document');
    } finally {
      setDeleteConfirmOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDocumentToDelete(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">View Documents</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-2">
            Select Document Type
          </label>
          <div className="flex gap-4">
            <select
              id="documentType"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select type...</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              onClick={handleFetch}
              disabled={!selectedType}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              Fetch Documents
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4">
            Loading...
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.document_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{doc.document_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex justify-center space-x-4">
                      <button
                        onClick={(e) => handleViewDocument(e, doc)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => handleViewDocument(e, doc)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Summary
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, doc)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {documentToDelete?.document_name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};