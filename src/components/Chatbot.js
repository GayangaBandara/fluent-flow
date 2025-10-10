import React, { useState, useEffect, useCallback } from "react";
import ChatMessage from "./ChatMessage";
import { fetchChatbotResponse } from "../services/chatbotAPI";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Initialize speech recognition and synthesis
  const recognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      return recognition;
    }
    return null;
  }, []);

  useEffect(() => {
    // Check if speech features are supported
    const supported = 'speechSynthesis' in window &&
                     ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setSpeechSupported(supported);
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMicClick = () => {
    if (!speechSupported) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (listening) {
      setListening(false);
      recognition()?.stop();
    } else {
      setListening(true);
      const recognitionInstance = recognition();
      
      if (recognitionInstance) {
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setListening(false);
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setListening(false);
        };

        recognitionInstance.start();
      }
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    try {
      const userMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);

      const botResponse = await fetchChatbotResponse(input);
      
      if (botResponse.error) {
        throw new Error(botResponse.error);
      }

      const botMessage = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);

      if (speechSupported) {
        speak(botResponse);
      } else {
        console.log("Speech synthesis not supported in this browser");
      }
      setInput("");
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage = {
        sender: "bot",
        text: "Failed to fetch response from OpenAI API. Please check your API key and internet connection."
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleMicClick} disabled={!speechSupported}>
          {listening ? 'Stop' : 'Mic'}
        </button>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;