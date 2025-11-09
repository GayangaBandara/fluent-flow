import React, { useState, useEffect, useCallback } from "react";
import ChatMessage from "./ChatMessage";
import { fetchChatbotResponse, clearChatHistory, checkBackendHealth } from "../services/chatbotAPI";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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

  // Check backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setBackendConnected(isHealthy);
        if (!isHealthy) {
          console.warn("Backend is not responding. Make sure the Flask server is running on port 5000.");
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
        setBackendConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    // Check if speech features are supported
    const supported = 'speechSynthesis' in window &&
                     ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setSpeechSupported(supported);
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
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
          alert('Speech recognition error: ' + event.error);
        };

        recognitionInstance.onend = () => {
          setListening(false);
        };

        recognitionInstance.start();
      }
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error("Error clearing chat:", error);
      alert("Failed to clear chat history");
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;
    if (!backendConnected) {
      alert("Cannot send message: Backend is not connected. Please check if the Flask server is running.");
      return;
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      const userMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      console.log("Sending message to backend...");
      const botResponse = await fetchChatbotResponse(input);
      setIsTyping(false);

      const botMessage = { sender: "bot", text: botResponse };
      setMessages((prev) => [...prev, botMessage]);

      // Speak the response after a short delay
      setTimeout(() => {
        if (speechSupported) {
          speak(botResponse);
        }
      }, 500);

    } catch (error) {
      setIsTyping(false);
      console.error("Error in chat:", error);
      const errorMessage = {
        sender: "bot",
        text: `Sorry, I encountered an error: ${error.message}. Please try again or check your connection.`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <h2>Fluent Flow Chatbot</h2>
        <div className="status-indicators">
          <span className={`status-dot ${backendConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {backendConnected ? 'Connected' : 'Disconnected'}
          </span>
          {messages.length > 0 && (
            <button onClick={handleClearChat} className="clear-button" title="Clear chat history">
              🗑️ Clear
            </button>
          )}
        </div>
      </div>
      
      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>👋 Hello! I'm your AI speaking partner. You can:</p>
            <ul>
              <li>Type messages in the text box below</li>
              <li>Click the microphone button to speak</li>
              <li>I'll respond both in text and speech</li>
            </ul>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message or use the microphone..."
          disabled={isLoading || !backendConnected}
        />
        <button
          onClick={handleMicClick}
          disabled={!speechSupported || isLoading}
          className={`mic-button ${listening ? 'listening' : ''}`}
          title={speechSupported ? (listening ? 'Stop listening' : 'Start listening') : 'Speech not supported'}
        >
          {listening ? '🔴' : '🎤'}
        </button>
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim() || !backendConnected}
          className="send-button"
        >
          {isLoading ? '⏳' : '📤'} Send
        </button>
      </div>
      
      {!backendConnected && (
        <div className="connection-warning">
          ⚠️ Backend server is not running. Please start the Flask server on port 5000.
        </div>
      )}
    </div>
  );
};

export default Chatbot;