import React, { useState, useEffect } from 'react';

const messages = [
  "Hello! How may I assist you?",
  "Need legal advice? Click here!",
  "Have questions? Let's chat!",
];

const ChatBubble = () => {
  const [visible, setVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Show bubble after a short delay
    const showTimeout = setTimeout(() => {
      setVisible(true);
    }, 1500);

    // Rotate messages every 5 seconds
    const intervalId = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => {
      clearTimeout(showTimeout);
      clearInterval(intervalId);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-0 right-full mr-4 transform transition-all duration-300 ease-in-out">
      <div className="relative bg-white rounded-2xl shadow-xl p-5 w-64 animate-fade-in border border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-green-400 opacity-5 rounded-2xl pointer-events-none" />
        <div className="relative text-gray-800 text-sm font-medium">{messages[messageIndex]}</div>
        {/* Triangle pointer */}
        <div className="absolute top-1/2 -right-2.5 transform -translate-y-1/2">
          <div className="relative h-5 w-5">
            <div className="absolute rotate-45 w-5 h-5 bg-white border-t border-r border-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;