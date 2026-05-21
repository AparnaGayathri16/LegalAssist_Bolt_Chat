import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { ChatMessage, Conversation } from '../types';
import ChatHistory from './ChatHistory';
import ChatBubble from './ChatBubble';
import { useClientStore } from '../store/clientStore';
import { startChat, sendMessage, fetchConversations, fetchConversationById } from './chatApi'; 
import { useAuthStore } from '../store/authStore';

const legalOptions = [
  "Retrieve case details.",
  "Generate a summary for this case.",
  "Help with specific legal document queries.",
  "Provide explanations or clarifications regarding legal terms."
] as const;

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello!!',
    sender: 'bot',
    timestamp: new Date(),
  },
  {
    id: '2',
    content: 'Please select how can I assist you!',
    sender: 'bot',
    timestamp: new Date(),
  },
];

export const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const currentClient = useClientStore((state) => state.currentClient)
  const caseId = currentClient?.case_id;

  const user = useAuthStore((state) => state.user);

  // Reset chat state when user logs out
  // useEffect(() => {
  //   if (!user?.isAuthenticated) {
  //     setIsOpen(false);
  //     setActiveConversationId(null);
  //     setConversations([]);
  //     setMessages(initialMessages);
  //     setInput('');
  //     setLoadError(null);
  //   }
  // }, [user?.isAuthenticated]);

  useEffect(() => {
    setActiveConversationId(null);
    setMessages(initialMessages);
    setInput('');
  }, [currentClient]);

  // Load conversation history when component mounts or caseId changes
  useEffect(() => {
    let mounted = true;
    setLoadError(null);

    const loadConversations = async () => {
      if (!caseId) {
        setConversations([]);
        return;
      }

      setIsLoading(true);
      try {
        const history = await fetchConversations(caseId);
        if (mounted) {
          if (Array.isArray(history)) {
            // setConversations(history);
            const transformedHistory = history.map(conv => ({
              id: conv.conversation_id.toString(),
              conversation_id: conv.conversation_id,
              title: conv.title || 'Untitled Conversation',
              lastMessage: conv.last_message || '',
              timestamp: new Date(conv.timestamp || Date.now()),
              messages: conv.messages || []
            }));
            setConversations(transformedHistory);
          } else {
            console.error('Invalid response format from fetchConversations');
            setLoadError('Error loading conversations: Invalid response format');
            setConversations([]);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        if (mounted) {
          setLoadError('Error loading conversations. Please try refreshing the page.');
          setConversations([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadConversations();
    return () => {
      mounted = false;
    };
  }, [caseId]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages(initialMessages);
  };

  const handleOptionClick = async (option: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: option,
      sender: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    try {
      // Start a new chat if none exists
      if (!activeConversationId) {
        const currentDate = new Date().toISOString();
        const response = await startChat(
          caseId!,           // case_id
          option,            // title
          option,            // first_message
          currentDate        // date
        );

        if (!response?.conversation_id) {
          throw new Error('Invalid response from startChat: missing conversation_id');
        }

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.message || 'No response from assistant',
          sender: 'bot',
          timestamp: new Date(),
        };

        const updatedMessagesWithBot = [...updatedMessages, botResponse];
        setMessages(updatedMessagesWithBot);

        const newConversation: Conversation = {
          id: response.conversation_id.toString(),
          conversation_id: response.conversation_id,
          title: response.title || option,
          lastMessage: botResponse.content,
          timestamp: new Date(),
          messages: updatedMessagesWithBot,
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newConversation.id);
      }
    } catch (error) {
      console.error('Error in handleOptionClick:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!caseId) {
      console.error('No case ID available');
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      let response;
      if (!activeConversationId) {
        // Start a new chat if there's no active conversation
        const currentDate = new Date().toISOString();
        response = await startChat(
          caseId,           // case_id
          input,            // title
          input,            // first_message
          currentDate       // date
        );
        
        // Ensure we have a valid conversation ID from the response
        if (!response?.conversation_id) {
          throw new Error('Invalid response from startChat: missing conversation_id');
        }

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.message || 'No response from assistant',
          sender: 'bot',
          timestamp: new Date(),
        };

        const updatedMessagesWithBot = [...updatedMessages, botResponse];
        setMessages(updatedMessagesWithBot);

        const newConversation: Conversation = {
          id: response.conversation_id.toString(),
          conversation_id: response.conversation_id,
          title: response.title || input,
          lastMessage: input,
          timestamp: new Date(),
          messages: updatedMessages,
        };
        setConversations(prev => [...prev, newConversation]);
        setActiveConversationId(newConversation.id);
      } else {
        // Continue existing chat
        if (!currentClient?.case_id) {
          throw new Error('No case ID available for sending message');
        }
        response = await sendMessage(currentClient.case_id, Number(activeConversationId), input);
      }

      // Use the actual response from the backend
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message || 'No response from assistant',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      const updatedMessagesWithBot = [...updatedMessages, botResponse];
      setMessages(updatedMessagesWithBot);
      
      // Update conversation with bot response
      if (activeConversationId) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  lastMessage: botResponse.content,
                  timestamp: new Date(),
                  messages: updatedMessagesWithBot,
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, there was an error sending your message. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Transform backend message format to frontend format
  const transformMessage = (message: any): ChatMessage => {
    return {
      id: Date.now().toString() + Math.random().toString(),
      content: message.content,
      sender: message.role === 'user' ? 'user' : 'bot',
      timestamp: new Date(),
    };
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      setActiveConversationId(conversation.id);
      if (caseId) {
        const conversationId = typeof conversation.id === 'string' ? parseInt(conversation.id) : conversation.id;
        const fullConversation = await fetchConversationById(caseId, conversationId);
        
        if (fullConversation && fullConversation.messages) {
          const transformedMessages = fullConversation.messages.map(transformMessage);
          setMessages(transformedMessages);
        } else {
          // If no messages are found, set to initial state or  show an appropriate message
          setMessages([{
            id: '1',
            content: 'No messages found in this conversation.',
            sender: 'bot',
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setMessages([{
        id: '1',
        content: 'Error loading conversation messages.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
    {isOpen ? (
      <div className="bg-white rounded-lg shadow-2xl w-[800px] h-[600px] flex flex-col relative border border-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-blue-500 to-green-400 opacity-5 pointer-events-none" />
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute -top-3 -right-3 bg-white text-gray-500 p-1.5 rounded-full shadow-lg hover:text-red-500 transition-colors border border-gray-200 z-10"
            aria-label="Close chat"
          >
            <div className='-top-3 -right-3'>
            <X className="h-4 w-4" />
            </div>
           
          </button>

          <div className="flex h-full">
            <ChatHistory
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              activeConversationId={activeConversationId}
              onNewChat={handleNewChat}
            />
            
            <div className="flex-1 flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-green-400 text-white p-4 flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h3 className="font-semibold">Legal Assistant</h3>
                </div>
              </div>
              {!caseId ? (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
                  <h4 className="text-gray-500 text-lg">We need a Case to discuss about! Please select one.</h4>
                </div>
              ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-white">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <h4 className="text-gray-500 text-lg">Loading conversations...</h4>
                  </div>
                ) : loadError ? (
                  <div className="flex items-center justify-center">
                    <h4 className="text-red-500 text-lg">{loadError}</h4>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                            : 'bg-white shadow-md text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {messages.length <= 2 && !messages.some(msg => msg.sender === 'user') && (
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {legalOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="text-left px-4 py-2 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>)}
              
              <div className="border-t p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 bg-gray-50"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0">
              <ChatBubble />
            </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;