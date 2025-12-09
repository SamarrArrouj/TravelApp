import React, { useState } from "react";
import './chatbot.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = { sender: "user", text: input };
  setMessages([...messages, userMsg]);

  // Réinitialiser l'input IMMÉDIATEMENT
  setInput("");

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    const botMsg = { sender: "bot", text: data.reply };

    setMessages((prev) => [...prev, botMsg]);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    setMessages((prev) => [...prev, { sender: "bot", text: "Désolé, une erreur est survenue." }]);
  }

  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === "user" ? "user-msg" : "bot-msg"}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose une question..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
