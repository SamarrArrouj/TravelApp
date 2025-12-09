// src/components/FloatingChatbot.jsx
import React, { useState } from "react";
import Chatbot from "../pages/chatbot";
import './FloatingChatbot.css';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className="chatbot-wrapper">
          <div className="chatbot-header">
            <span>✈️ Travel Assistant</span>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <Chatbot />
        </div>
      )}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
    </div>
  );
}
