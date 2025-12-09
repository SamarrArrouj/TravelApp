import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#8ECAEF] text-white py-12">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* À propos */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-blue-900">About Us</h3>
          <p className="text-blue-950 text-sm">
            Travel Agency is dedicated to providing the best travel experiences. Explore the world with comfort and style.
          </p>
        </div>

        {/* Liens rapides */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-blue-900">Quick Links</h3>
          <ul className="text-blue-950 space-y-2">
            <li><a href="#" className="hover:text-blue-800 font-medium transition">Home</a></li>
            <li><a href="#" className="hover:text-blue-800 font-medium transition">Destinations</a></li>
            <li><a href="#" className="hover:text-blue-800 font-medium transition">About</a></li>
            <li><a href="#" className="hover:text-blue-800 font-medium transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-blue-900">Contact</h3>
          <ul className="text-blue-950 space-y-2">
            <li className="flex items-center gap-2"><FaEnvelope className="text-blue-900" /> support@travel.com</li>
            <li className="flex items-center gap-2"><FaPhone className="text-blue-900" /> +123 456 7890</li>
            <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-blue-900" /> 123 Travel St, City</li>
          </ul>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-blue-900">Follow Us</h3>
          <div className="flex gap-6">
            <a href="#" className="text-4xl text-blue-900 hover:scale-110 hover:text-blue-700 transition-all duration-300"><FaFacebookF /></a>
            <a href="#" className="text-4xl text-blue-900 hover:scale-110 hover:text-blue-700 transition-all duration-300"><FaTwitter /></a>
            <a href="#" className="text-4xl text-blue-900 hover:scale-110 hover:text-blue-700 transition-all duration-300"><FaInstagram /></a>
          </div>
        </div>

      </div>

      <div className="text-center text-blue-950 mt-10 text-sm font-semibold">
        © 2025 Travel Agency — All rights reserved.
      </div>
    </footer>
  );
}
