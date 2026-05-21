import { create } from 'zustand';
import { Client } from '../types';

interface ClientState {
  currentClient: Client | null;
  setCurrentClient: (client: Client | null) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  currentClient: null,
  setCurrentClient: (client) => set({ currentClient: client }),
}));