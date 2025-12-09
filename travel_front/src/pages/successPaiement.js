import React from "react";
import { useNavigate } from "react-router-dom";

function Success() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        ✅ Payment successful!
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Thank you for your booking. You will receive a confirmation email shortly.
      </p>
      <button
        onClick={() => navigate("/home")}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Back to home
      </button>
    </div>
  );
}

export default Success;
