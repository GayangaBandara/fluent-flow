import axios from "axios";

// OpenAI API endpoint
const API_URL = "https://api.openai.com/v1/chat/completions";

// Function to fetch chatbot responses
export const fetchChatbotResponse = async (input) => {
  try {
    // Logging API key for debugging (optional, but be cautious about exposing your API key in production)
    console.log("API Key:", process.env.REACT_APP_OPENAI_API_KEY);

    // Making the API request
    const response = await axios.post(
      API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input },
        ],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Logging the response for debugging
    console.log("API Response:", response.data);

    // Returning the chatbot's response
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    // Logging the error for debugging
    console.error("Error fetching chatbot response:", error);

    // Returning a fallback response
    return "Sorry, I couldn't process that. Please try again.";
  }
};
