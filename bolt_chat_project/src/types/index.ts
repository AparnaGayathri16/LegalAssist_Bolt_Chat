export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface Client {
  clientId: string;
  caseId: string;
  firNumber: string;
  caseCode: string;
  partyName: string;
  advocateName: string;
  act: string;
}

export interface Document {
  id: string;
  type: 'Affidavit' | 'Evidence' | 'FIR' | 'Memo' | 'Notices' | 'Plaints';
  name: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Conversation {
  id: string;
  conversation_id: number;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}