import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { useAuthStore } from '../store/authStore';
import { Scale, Upload, Search, Users, User } from 'lucide-react';
import { useClientStore } from '../store/clientStore';
import { Client } from '../types/index';

export const Navbar = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const currentClient = useClientStore((state) => state.currentClient);
  const setCurrentClient = useClientStore((state) => state.setCurrentClient);

  const handleAddCase = () => {
    if (!currentClient) {
      // If no client is selected, navigate to client search

      navigate('/client/switch');
      return;
    }
    
    setCurrentClient(currentClient);
    navigate('/client/new', { 
      state: { 
        isNewCase: true,
        isCaseClicked: true,
        clientId: currentClient.clientId,
        party_name: currentClient.party_name 
      } 
    });
  };

  const handleLogOut = () =>{ 
    localStorage.setItem('authToken', '');
    useAuthStore.getState().setUser(null);
    navigate('/signin');
  };

  if (!user?.isAuthenticated) {
    return (
      <nav className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Legal Assist
          </Link>
          <Link to="/signin" className="hover:text-indigo-200">Sign In</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <Scale className="h-6 w-6" />
          Legal Assist
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/upload" className="hover:text-indigo-200 flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Upload Document
          </Link>
          
          <Link to="/documents" className="hover:text-indigo-200 flex items-center gap-1">
            <Search className="h-4 w-4" />
            View Documents
          </Link>
          
          <Link to="/acts" className="hover:text-indigo-200">Search Bare Acts</Link>
          <Link to="/search" className="hover:text-indigo-200">Search Documents</Link>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-1 hover:text-indigo-200">
              <Users className="h-4 w-4" />
              Client ID
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
              <Menu.Item>
                {({ active }) => (
                  <Link to="/client/details" className={`${active ? 'bg-indigo-50' : ''} block px-4 py-2`}>
                    View Client Details
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link to="/client/new" className={`${active ? 'bg-indigo-50' : ''} block px-4 py-2`}>
                    Add New Client
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button onClick={handleAddCase} className={`${active ? 'bg-indigo-50' : ''} block px-4 py-2 w-full text-left hover:bg-indigo-50`}>
                    Add New Case
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link to="/client/switch" className={`${active ? 'bg-indigo-50' : ''} block px-4 py-2`}>
                    Switch Client
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-1 hover:text-indigo-200">
              <User className="h-4 w-4" />
              {user.username}
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
              <Menu.Item>
                {({ active }) => (
                  <Link to="/profile" className={`${active ? 'bg-indigo-50' : ''} block px-4 py-2`}>
                    My Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogOut}
                    className={`${active ? 'bg-indigo-50' : ''} block w-full text-left px-4 py-2`}
                  >
                    Log Out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </nav>
  );
};