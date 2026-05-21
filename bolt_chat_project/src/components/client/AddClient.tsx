import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClientStore } from '../../store/clientStore'; 
import { Client } from '../../types';

interface LocationState {
  clientId: string;
  partyName: string;
  isCaseClicked: boolean;
}

export const AddClient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setCurrentClient = useClientStore((state) => state.setCurrentClient);
  const state = location.state as LocationState;
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    clientId: '',
    case_id: '',
    fir_number: '',
    case_code: '',
    party_name: '',
    advocate_name: '',
    act: '',
  });   

  const validateForm = () => {
    let newErrors = {};
    if (!formData.clientId) newErrors.clientId = 'Client ID is required';
    if (!formData.case_id) newErrors.case_id = 'Case Id is required';
    if (!formData.fir_number) newErrors.fir_number = 'FIR number is required';
    if (!formData.case_code) newErrors.case_code = 'Case code is required';
    if (!formData.party_name) newErrors.party_name = 'Party Name is required';
    if (!formData.advocate_name) newErrors.advocate_name = 'Advocate name is required';
    return newErrors;
  };

  useEffect(() => {
    console.log('Location state:', state); // Debug log
    // Set the form data when location state is available
    if (state?.clientId && state?.party_name && state.isCaseClicked) {
      setFormData(prev => ({
        ...prev,
        clientId: state.clientId,
        party_name: state.party_name
      }));
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
        console.log('Form submitted:', formData);
        const clientId = formData.clientId;
        localStorage.setItem("clientId", clientId);
        const payload = {
            clientId: formData.clientId,
            case_id: formData.case_id,
            fir_number: formData.fir_number,
            case_code: formData.case_code,
            party_name: formData.party_name,
            advocate_name: formData.advocate_name,
            act: formData.act
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8082/add_client`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                method: "POST",
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error:', errorData);
                setError(true);
            } else {
                console.log('Client added successfully');
                // Set the current client in the store
                setCurrentClient(payload);
                // Navigate to success page
                if(state.isCaseClicked) navigate('/case/add-success');
                else navigate('/client/add-success');
            }
        } catch (error) {
            console.error('Error during submission:', error);
            setError(true);
        }
    } else {
        setErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Client/Case</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
              Client ID
            </label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="party_name" className="block text-sm font-medium text-gray-700">
              Party Name
            </label>
            <input
              type="text"
              id="party_name"
              name="party_name"
              value={formData.party_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="case_id" className="block text-sm font-medium text-gray-700">
              Case ID
            </label>
            <input
              type="text"
              id="case_id"
              name="case_id"
              value={formData.case_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fir_number" className="block text-sm font-medium text-gray-700">
              FIR Number
            </label>
            <input
              type="text"
              id="fir_number"
              name="fir_number"
              value={formData.fir_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="case_code" className="block text-sm font-medium text-gray-700">
              Case Code
            </label>
            <input
              type="text"
              id="case_code"
              name="case_code"
              value={formData.case_code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          
          <div>
            <label htmlFor="advocate_name" className="block text-sm font-medium text-gray-700">
              Advocate Name
            </label>
            <input
              type="text"
              id="advocate_name"
              name="advocate_name"
              value={formData.advocate_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="act" className="block text-sm font-medium text-gray-700">
              Act
            </label>
            <input
              type="text"
              id="act"
              name="act"
              value={formData.act}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};