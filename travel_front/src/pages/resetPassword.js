import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./resetPassword.css";
import { FaLock } from "react-icons/fa";

function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();

  const [new_password, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new_password !== confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("fail");
      return;
      
    }

    try {
      const res = await api.post(`/api/users/reset_password/${token}`, {
        new_password,
        confirm_password: confirmPassword,
      });
      setMessage(res.data.message);
      setMessageType("success");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Server error");
      setMessageType("fail");
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h2 className="reset-title">Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
         <div className="reset-input-group">
            <FaLock className="reset-icon" />
            <input
                type="password"
                placeholder="Enter new password"
                value={new_password}                 
                onChange={(e) => setNewPassword(e.target.value)}  
                required
            />
            </div>


          <div className="reset-input-group">
            <FaLock className="reset-icon" />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-btn">
            Reset Password
          </button>

          <p className={`reset-message ${messageType}`}>{message}</p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
