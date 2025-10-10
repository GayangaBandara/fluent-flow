import axios from "axios";
import axiosRetry from 'axios-retry';

// OpenAI API endpoint
const API_URL = "https://api.openai.com/v1/chat/completions";

// Configure axios retry mechanism
axiosRetry(axios, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429; // Retry on rate limit errors
  }
});

// Function to get a detailed error message
const getErrorMessage = (error) => {
  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    return "API key is not configured. Please check your .env file and ensure REACT_APP_OPENAI_API_KEY is set.";
  }

  if (error.response) {
    switch (error.response.status) {
      case 401:
        return "Invalid API key. Please check your OpenAI API key.";
      case 429:
        return "Rate limit exceeded. Please try again in a few moments.";
      case 500:
        return "OpenAI server error. Please try again later.";
      default:
        return `API Error: ${error.response.data.error?.message || error.message}`;
    }
  }

  if (error.request) {
    return "Network error. Please check your internet connection.";
  }

  return "An unexpected error occurred. Please try again.";
};

// Function to fetch chatbot responses
export const fetchChatbotResponse = async (input) => {
  try {
    // Making the API request with timeout
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",  // Using the latest model for better accuracy
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant with expertise in providing accurate and detailed responses. Always respond in English and maintain a professional tone."
          },
          { role: "user", content: input },
        ],
        max_tokens: 150,  // Increased token limit for more detailed responses
        temperature: 0.7,
        top_p: 0.9,      // Added top_p for better response quality
        presence_penalty: 0.6,  // Encourages the model to be more innovative
        frequency_penalty: 0.5, // Reduces repetition in responses
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 second timeout
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Detailed error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      request: !!error.request
    });

    // Throw error with detailed message
    throw new Error(getErrorMessage(error));
  }
};
