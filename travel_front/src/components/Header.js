import React, { useState, useEffect } from "react";

export default function Header({ buttonColor = "white" }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/home";
  };

  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center px-12 py-6 text-white z-10">
      
      {/* Navigation principale */}
      <nav className="flex space-x-8 font-semibold">
        <a href="/home" className={`hover:text-blue-300 transition-colors duration-300 text-2xl`} style={{ color: buttonColor }}>Home</a>
        <a href="/flights" className={`hover:text-blue-300 transition-colors duration-300 text-2xl`} style={{ color: buttonColor }}>Flights</a>
        <a href="/hotels" className={`hover:text-blue-300 transition-colors duration-300 text-2xl`} style={{ color: buttonColor }}>Hotels</a>
        <a href="/excursions" className={`hover:text-blue-300 transition-colors duration-300 text-2xl`} style={{ color: buttonColor }}>Excursions</a>
        <a href="#" className={`hover:text-blue-300 transition-colors duration-300 text-2xl`} style={{ color: buttonColor }}>Contact</a>
      </nav>

      {/* Liens login/register ou profile/logout */}
      <div className="flex space-x-6 font-semibold">
        {!isLoggedIn ? (
          <>
            <a href="/login" className="hover:text-blue-300 transition-colors duration-300 text-2xl px-6 py-3" style={{ color: buttonColor }}>Login</a>
            <a href="/register" className="border px-6 py-3 rounded-lg text-2xl hover:bg-blue-500 hover:text-white transition-all" style={{ borderColor: buttonColor, color: buttonColor }}>Register</a>
          </>
        ) : (
          <>
            <a href="/profile" className="hover:text-blue-300 transition-colors duration-300 text-2xl px-6 py-3" style={{ color: buttonColor }}>Profile</a>
            <button
              onClick={handleLogout}
              className="border px-6 py-3 rounded-lg text-2xl hover:bg-blue-500 hover:text-white transition-all"
              style={{ borderColor: buttonColor, color: buttonColor }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
