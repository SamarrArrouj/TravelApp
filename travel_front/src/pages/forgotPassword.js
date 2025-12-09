import React, { useState } from "react";
import api from "../api/api";
import "./forgotPassword.css"; 
import { FaEnvelope } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/users/forgot_password", { email });
      setMessage(res.data.message);
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur serveur");
      setMessageType("fail");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h2 className="forgot-title">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="forgot-input-group">
            <FaEnvelope className="forgot-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="forgot-btn">
            Send Reset Link
          </button>
          <p className={`forgot-message ${messageType}`}>{message}</p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
