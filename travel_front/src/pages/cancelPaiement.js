import React from "react";
import { useNavigate } from "react-router-dom";

function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center">
      <h1 className="text-4xl font-bold text-red-700 mb-4">
        ❌ Payment cancelled
      </h1>
      <p className="text-lg text-gray-700 mb-6">
       Your payment was not completed. You can try again.
      </p>
      <button
        onClick={() => navigate("/home")}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Back to home
      </button>
    </div>
  );
}

export default Cancel;
