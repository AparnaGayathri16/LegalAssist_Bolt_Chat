import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Chat } from './components/Chat';
import { SignIn } from './components/auth/SignIn';
import { DocumentUpload } from './components/documents/DocumentUpload';
import { DocumentView } from './components/documents/DocumentView';
import { SearchBareActs } from './components/search/SearchBareActs';
import { SearchDocuments } from './components/search/SearchDocuments';
import { ClientDetails } from './components/client/ClientDetails';
import { AddClient } from './components/client/AddClient';
import { AddCase } from './components/client/AddCase';
import { SwitchClient } from './components/client/SwitchClient';
import { ClientAddSuccess } from './components/client/ClientAddSuccess';
import { CaseAddSuccess } from './components/client/CaseAddSuccess';

function App() {
  return (
    <Router>
      <div className="min-h-screen relative">
        <div className="absolute inset-0 bg-[url('/images/lady_justice.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent"></div>
        <div className="relative">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <div className="mt-32 ml-8">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">Legal Assist</h1>
                  <p className="text-3xl text-gray-700">Your intelligent legal companion</p>
                </div>
              } />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/upload" element={<DocumentUpload />} />
              <Route path="/documents" element={<DocumentView />} />
              <Route path="/acts" element={<SearchBareActs />} />
              <Route path="/search" element={<SearchDocuments />} />
              <Route path="/client/details" element={<ClientDetails />} />
              <Route path="/client/new" element={<AddClient />} />
              <Route path="/case/new" element={<AddCase />} />
              <Route path="/client/switch" element={<SwitchClient />} />
              <Route path="/client/add-success" element={<ClientAddSuccess />} />
              <Route path="/case/add-success" element={<CaseAddSuccess />} />
            </Routes>
          </main>
          <Chat />
        </div>
      </div>
    </Router>
  );
}

export default App;