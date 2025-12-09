import React, { useState } from "react";
import api from "../api/api";
import "./login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/users/login", { email, password });

      if (!res.data.token) {
        setMessage("Token manquant côté serveur");
        setMessageType("fail");
        return;
      }

      // Stocker le token et le rôle
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setMessage("Connexion réussie !");
      setMessageType("success");

      // Redirection selon le rôle
      if (res.data.role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/home";
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login échoué");
      setMessageType("fail");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot password?</a>
          </div>
          <button type="submit" className="login-btn">
            Login
          </button>
          <p className="register-text">
            Don’t have an account? <a href="/register">Register</a>
          </p>
          <p className={`message ${messageType}`}>{message}</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
