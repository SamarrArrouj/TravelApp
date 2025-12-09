import React, { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Users", path: "/dashboard/users" },
    { name: "Hotels", path: "/dashboard/hotels" },
    { name: "Flights", path: "/dashboard/flights" },
    { name: "Excursions", path: "/dashboard/excursions" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 shadow-2xl flex flex-col">
        <div className="p-6 text-2xl font-extrabold text-white border-b border-gray-700">Admin Panel 🚀</div>
        <nav className="flex-1 px-4 space-y-1 py-4">
          {links.map((link, idx) => (
            <Link
              key={idx}
              to={link.path}
              className={`flex items-center p-3 rounded-lg text-white font-medium transition-colors duration-200 ${
                location.pathname === link.path ? "bg-blue-600" : "hover:bg-blue-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 pt-0 border-t border-gray-700 mb-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-red-600 flex items-center justify-center"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
