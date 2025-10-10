// Mock API for testing speech functionality
// TODO: Replace with actual OpenAI API integration

// Function to fetch chatbot responses
export const fetchChatbotResponse = async (input) => {
  // Temporary mock response for testing speech functionality
  // Replace with actual API call once API key is valid
  const mockResponses = [
    "Hello! I'm here to help you with any questions you have.",
    "That's an interesting point. Can you tell me more?",
    "I understand. Let me think about that for a moment.",
    "Great question! Here's what I think...",
    "I'm sorry, I didn't quite catch that. Could you rephrase?",
    "Absolutely, I can assist with that.",
    "That's a good observation. Let's explore it further.",
  ];

  // Simple response based on input length
  const responseIndex = input.length % mockResponses.length;
  return mockResponses[responseIndex];
};
