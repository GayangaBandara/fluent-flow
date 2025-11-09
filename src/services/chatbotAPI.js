// API service for chatbot interactions with Flask backend
import axios from 'axios';

// Configure the API base URL
const API_BASE_URL = 'http://127.0.0.1:5000';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to the chatbot server. Please ensure the backend is running on port 5000.');
    }
    
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(`Request failed: ${error.message}`);
    }
  }
);

// Function to fetch chatbot responses
export const fetchChatbotResponse = async (input) => {
  try {
    console.log('Sending message to backend:', input);
    
    const response = await api.post('/chat', {
      message: input
    });

    if (response.success) {
      console.log('Received response from backend:', response.reply);
      return response.reply;
    } else {
      throw new Error(response.error || 'Failed to get response from chatbot');
    }
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
    throw error; // Re-throw to let the component handle it
  }
};

// Function to clear chat history
export const clearChatHistory = async () => {
  try {
    const response = await api.post('/clear-history');
    return response.success;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

// Function to get chat history
export const getChatHistory = async () => {
  try {
    const response = await api.get('/get-history');
    return response;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

// Function to check backend health
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 'healthy';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};
