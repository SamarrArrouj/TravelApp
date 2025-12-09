import React, { useEffect, useState } from "react";

export default function BestHotels() {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/hotels/top")
      .then(res => res.json())
      .then(data => setHotels(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="text-center py-16 bg-gradient-to-b from-gray-50 to-white">
      <h3 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-4 drop-shadow-md">
        🏨 Best Hotels
      </h3>
      <p className="text-gray-600 mb-12 text-lg max-w-2xl mx-auto">
        Discover premium hotels for every traveler.
      </p>

     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
  {Array.isArray(hotels) && hotels.length > 0 ? (
    hotels.map(hotel => (
      <div
        key={hotel.id}
        className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl"
      >
        <img
          src={hotel.image_url}
          alt={hotel.name}
          className="w-full h-56 object-cover transition duration-500 hover:scale-110"
        />
        <div className="p-5">
          <h4 className="text-xl font-bold text-gray-800 mb-2">{hotel.name}</h4>
          <p className="text-blue-500 font-semibold">{hotel.price_per_night} per night</p>
          <button className="mt-4 w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 rounded-lg font-semibold shadow-md hover:from-blue-500 hover:to-blue-700 hover:scale-105 transition-all">
            View Details
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="col-span-full text-center text-gray-500">No hotels available.</p>
  )}
</div>

    </section>
  );
}
