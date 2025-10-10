import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import { fetchChatbotResponse } from "../services/chatbotAPI";
import { useSpeechSynthesis } from "react-speech-kit";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { speak } = useSpeechSynthesis();

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const botResponse = await fetchChatbotResponse(input);
    const botMessage = { sender: "bot", text: botResponse };
    setMessages((prev) => [...prev, botMessage]);

    speak({ text: botResponse });
    setInput("");
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
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;