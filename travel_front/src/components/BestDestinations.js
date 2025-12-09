import React, { useState, useEffect } from "react";

export default function BestDestinations() {
  const destinationsData = [
    { name: "Paris", flights_count: 12, image: "/assets/images/paris.jpg" },
    { name: "Istanbul", flights_count: 8, image: "/assets/images/istanbul.jpg" },
    { name: "London", flights_count: 10, image: "/assets/images/london.jpg" }
  ];

  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const topDestinations = destinationsData
      .sort((a, b) => b.flights_count - a.flights_count)
      .slice(0, 6);
    setDestinations(topDestinations);
  }, []);

  return (
    <section className="text-center py-16 bg-gradient-to-b from-blue-50 to-white">
      <h3 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-3 drop-shadow-md">
        ✈️ Best Destinations
      </h3>
      <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
        Explore top-rated travel spots worldwide and find your perfect adventure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
        {destinations.map((dest, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-56 object-cover transition duration-500 hover:scale-110"
              />
              <span className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                Top Choice
              </span>
            </div>
            <div className="p-5">
              <h4 className="text-xl font-bold text-gray-800 mb-2">{dest.name}</h4>
              <p className="text-blue-500 font-semibold">{dest.flights_count} flights available</p>
              
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
