// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8081';

// export const startChat = async (caseId: string, firstMessage: string) => {
//   const response = await axios.post(`${API_BASE_URL}/start_chat`, null, {
//     params: { case_id: caseId, firstMessage: `${firstMessage}` },
//   });
//   return response.data;
// };

// export const sendMessage = async (
//   caseId: string,
//   conversationId: number,
//   message: string,
//   options?: { title?: string }
// ) => {
//   const response = await axios.post(`${API_BASE_URL}/continue_chat`, {
//     case_id: caseId,
//     conversation_id: conversationId,
//     message,
//     title: options?.title, // Send title if provided
//   });
//   return response.data;
// };

// export const fetchConversations = async (caseId: string) => {
//   const response = await axios.get(`${API_BASE_URL}/all_conversations`, {
//     params: { case_id: caseId },
//   });
//   return response.data;
// };

// export const getConversationHistory = async (
//   caseId: string,
//   conversationId: number
// ) => {
//   const token = localStorage.getItem('token');
//   const response = await axios.get(
//     `${API_BASE_URL}/conversations/${caseId}/${conversationId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }
//   );
//   if (response.status === 401) {
//     return "No Conversations";
//   }
//   return response.data;
// };

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

/**
 * Start a new chat session.
 * @param {string} caseId - The ID of the case.
 * @param {string} title - The title for the conversation.
 * @param {string} firstMessage - The first message to start the chat.
 * @returns {Promise<Object>} Response data containing conversation ID and assistant message.
 */
export const startChat = async (caseId: string, title: string, firstMessage: string, date: string) => {
  const response = await axios.post(`${API_BASE_URL}/start_chat`, null, {
    params: {
      case_id: caseId,
      title, // Send title from frontend
      first_message: firstMessage, // Updated to match the backend
      date: date
    },
  });
  return response.data;
};

/**
 * Continue an existing chat session by sending a message.
 * @param {string} caseId - The ID of the case.
 * @param {number} conversationId - The ID of the conversation.
 * @param {string} message - The user's message.
 * @returns {Promise<Object>} Response data containing the assistant's reply.
 */
export const sendMessage = async (caseId: string, conversationId: number, message: string) => {
  const response = await axios.post(`${API_BASE_URL}/continue_chat`, {
    case_id: caseId,
    conversation_id: conversationId,
    message,
  });
  console.log(response.data);
  return response.data;
};

/**
 * Fetch all conversations for a given case.
 * @param {string} caseId - The ID of the case.
 * @returns {Promise<Array>} List of all conversations for the case.
 */
export const fetchConversations = async (caseId: string) => {
  if (!caseId) {
    throw new Error('Case ID is required');
  }
  console.log(caseId);
  const response = await axios.get(`${API_BASE_URL}/all_conversations`, {
    params: { case_id: caseId },
  });
  return response.data; // Ensure this is an array of conversations
};


/**
 * Fetch a specific conversation by its ID.
 * @param {string} caseId - The ID of the case.
 * @param {number} conversationId - The ID of the conversation.
 * @returns {Promise<Object>} The specific conversation.
 */
export const fetchConversationById = async (caseId: string, conversationId: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/conversations/${caseId}/${conversationId}`,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};