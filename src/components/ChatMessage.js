import React from "react";
import "./ChatMessage.css";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";
  return (
    <div className={`message ${isUser ? "user" : "bot"}`}>
      <p>{message.text}</p>
    </div>
  );
};

export default ChatMessage;
