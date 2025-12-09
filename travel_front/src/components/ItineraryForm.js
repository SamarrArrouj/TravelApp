import React, { useState } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEuroSign,
  FaRoute,
  FaClock,
  FaUtensils,
  FaTheaterMasks
} from "react-icons/fa";
import Header from "./Header";

export default function ItineraryGenerator() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalCost, setTotalCost] = useState(null);
  const [status, setStatus] = useState("");

  // 🎨 Couleur harmonisée avec le fond bleu ciel
  const cardColor = "bg-blue-50"; // Bleu pastel doux — parfait pour votre fond

  const handleSubmit = async () => {
    if (!destination || !days || !budget) {
      setError("Please fill in all fields!");
      return;
    }

    setError("");
    setLoading(true);
    setItinerary("");
    setTotalCost(null);
    setStatus("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/itinerary/generate-itinerary",
        { destination, days, budget },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.itinerary) {
        setItinerary(res.data.itinerary);
        setTotalCost(res.data.estimated_total_cost);
        setStatus(res.data.status);
      } else {
        setError("No itinerary generated. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error generating itinerary. Try a known city (Paris, Rome, etc.).");
    } finally {
      setLoading(false);
    }
  };

  const renderItinerary = () => {
    if (!itinerary) return null;

    return itinerary.split("\n").map((line, idx) => {
      if (!line.trim()) return null;

      const parts = line.split(/[:,]/).map(p => p.trim()).filter(p => p);
      if (parts.length < 2)
        return <p key={idx} className="text-gray-700">{line}</p>;

      const dayLabel = parts[0];
      const activities = parts.slice(1).join(": ").split(", ");

      return (
        <div
          key={idx}
          className={`${cardColor} rounded-2xl p-5 shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300`}
        >
          <h3 className="font-bold text-xl text-gray-800 mb-3 flex items-center">
            <FaRoute className="mr-2 text-gray-700" /> {dayLabel}
          </h3>

          <div className="space-y-2">
            {activities.map((act, i) => {
              let icon = <FaClock className="text-gray-500" />;

              if (act.toLowerCase().includes("morning"))
                icon = <FaClock className="text-blue-500" />;
              else if (
                act.toLowerCase().includes("noon") ||
                act.toLowerCase().includes("dinner") ||
                act.includes("Restaurant") ||
                act.includes("Bistro")
              )
                icon = <FaUtensils className="text-green-500" />;
              else if (
                act.toLowerCase().includes("evening") ||
                act.includes("Show") ||
                act.includes("Theater")
              )
                icon = <FaTheaterMasks className="text-purple-500" />;

              const priceMatch = act.match(/\((\d+)€\)/);
              const price = priceMatch ? priceMatch[0] : "";
              const activityText = act.replace(/\s*\(\d+€\)/, "");

              return (
                <div key={i} className="flex items-center bg-white rounded-xl p-2 shadow-sm">
                  <span className="mr-3 text-lg">{icon}</span>
                  <span className="text-gray-700 flex-1">
                    {activityText}
                    {price && (
                      <span className="font-semibold text-gray-900 ml-1">{price}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Header buttonColor="white" />

      <div
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url("/assets/images/itinerary.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="bg-black bg-opacity-30 min-h-screen">
          <div className="max-w-6xl mx-auto px-6 py-10">

            <div className="text-center mb-10">
              <br /><br /><br />
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
                🌍 Smart Itinerary Generator
              </h1>
              <p className="text-gray-200 max-w-2xl mx-auto">
                Enter your destination, duration, and budget. The AI creates a personalized itinerary for you!
              </p>
            </div>

            {/* 🟦 Formulaire — harmonisé avec le fond */}
            <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-indigo-500" /> Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Paris, Rome, Istanbul..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-indigo-500" /> Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="4"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2 flex items-center">
                      <FaEuroSign className="mr-2 text-indigo-500" /> Budget (€)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                    loading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    "✨ Generate My Itinerary"
                  )}
                </button>
              </div>

              {error && (
                <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
              )}

              {totalCost !== null && (
                <div className="mt-6 p-4 bg-white bg-opacity-70 rounded-lg border border-gray-200">
                  <p className="text-gray-800">
                    💰 <strong>Estimated Cost:</strong> {totalCost}€ / {budget}€
                  </p>
                  <p
                    className={`font-semibold ${
                      status === "dans le budget"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {status === "dans le budget"
                      ? "✅ Within Budget"
                      : "⚠️ Over Budget"}
                  </p>
                </div>
              )}
            </div>

            {itinerary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderItinerary()}
              </div>
            )}

            <div className="mt-10 text-center text-gray-200 text-sm pb-6">
              ✨ Powered by a local AI
            </div>
          </div>
        </div>
      </div>
    </>
  );
}