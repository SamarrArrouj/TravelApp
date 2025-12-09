import React, { useState, useEffect } from "react";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérifier si le token existe
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/home";
  };

  const handleGenerateItinerary = () => {
    window.location.href = "/itinerary"; 
  };

  return (
    <section className="relative h-screen">
      {/* Image de fond */}
      <img
        src="/assets/images/home.jpg"
        alt="Travel banner"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Texte/CTA */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4 z-5">
        <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">Let's Travel</h1>
        <p className="text-2xl mb-6 drop-shadow-md">Discover amazing destinations around the world</p>
    <button
  onClick={handleGenerateItinerary}
  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
>
  Generate Itinerary
</button>

      </div>
    </section>
  );
}
