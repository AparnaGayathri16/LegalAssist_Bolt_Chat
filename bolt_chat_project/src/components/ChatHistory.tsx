import React, { useState } from 'react';
import { Clock, PlusCircle, MoreVertical } from 'lucide-react';
import { Conversation } from '../types';

interface ChatHistoryProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  activeConversationId: string | null;
  onNewChat: () => void;
  onRenameConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  onSelectConversation,
  activeConversationId,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleMoreClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === conversationId ? null : conversationId);
  };

  const handleOptionClick = (e: React.MouseEvent, conversationId: string, action: 'rename' | 'delete') => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (action === 'rename' && onRenameConversation) {
      onRenameConversation(conversationId);
    } else if (action === 'delete' && onDeleteConversation) {
      onDeleteConversation(conversationId);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-72 bg-white overflow-hidden relative shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-blue-500 to-green-400 opacity-5 pointer-events-none" />
      <div className="relative h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm hover:shadow-md"
            aria-label="Start new chat"
          >
            <PlusCircle className="h-5 w-5 text-blue-600" />
          </button>
        </div>
        <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
          {conversations && conversations.length > 0 ? (
            conversations.map((conversation) => {
              const { id, title, timestamp, lastMessage } = conversation;
              if (!id) {
                console.error('Conversation ID is missing');
                return null; // Skip this conversation if the ID is missing
              }
              return (
                <button
                  key={id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-all relative ${
                    activeConversationId === id
                      ? 'bg-blue-50 shadow-inner border-l-4 border-blue-500'
                      : 'hover:border-l-4 hover:border-blue-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 truncate">
                        {title || lastMessage?.content}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(timestamp).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => handleMoreClick(e, id)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </button>
                        {openDropdownId === id && (
                          <div className="absolute right-2 top-12 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={(e) => handleOptionClick(e, id, 'rename')}
                              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                              Rename
                            </button>
                            <button
                              onClick={(e) => handleOptionClick(e, id, 'delete')}
                              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{lastMessage?.content}</p>
                  </div>
                </button>
              );
            })
          ) : (
            <p className="p-4 text-gray-500">No conversations found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
