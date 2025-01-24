import axios from "axios";

const API_URL = "https://api.openai.com/v1/completions";
const API_KEY = "your_openai_api_key";

export const fetchChatbotResponse = async (input) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "text-davinci-003",
        prompt: input,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error fetching chatbot response:", error);
    return "Sorry, something went wrong.";
  }
};
