import React, { useState } from "react";
import api from "../api/api";
import "./register.css";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("fail");
      return;
    }

    try {
      const res = await api.post("/api/users/register", { 
        name, email, password, confirm_password: confirmPassword 
      });
      setMessage("Registration successful, a verification email has been sent!");
      setMessageType("success");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("fail");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Create an Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="register-input-group">
            <FaUser className="register-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <FaEnvelope className="register-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <FaLock className="register-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <FaLock className="register-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>

          <p className="register-footer-text">
            Already have an account? <a href="/login">Login</a>
          </p>

          <p className={`register-message ${messageType}`}>{message}</p>
        </form>
      </div>
    </div>
  );
}

export default Register;
