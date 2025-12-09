import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./verifyEmail.css";

function VerifyEmail() {
  const { token } = useParams(); 
  const [message, setMessage] = useState("Vérification en cours...");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/api/users/verify/${token}`);
        setMessage(res.data.message);

       
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setMessage(err.response?.data?.error || "Erreur de vérification");
      }
    };

    if (token) verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <h2>Email Verification</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default VerifyEmail;
