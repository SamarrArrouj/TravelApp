import React from "react";

export default function TravelStats() {
  return (
    <section id="travelstats" className="flex flex-col md:flex-row items-center justify-center gap-20 px-6 md:px-20 py-20 bg-white">
      <div className="relative">
        <img
          src="/assets/images/girl.jpg"
          alt="Traveler"
          className="w-[350px] md:w-[450px] rounded-xl shadow-lg"
        />
        {/* Stats */}
        <div className="absolute -top-3 left-3 bg-white px-4 py-2 rounded-lg shadow text-base font-semibold">
          +200 hotels
        </div>
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white px-4 py-2 rounded-lg shadow text-base font-semibold">
          +200 flights
        </div>
        <div className="absolute bottom-3 left-0 bg-white px-4 py-2 rounded-lg shadow text-base font-semibold">
          +200 destinations
        </div>
        <div className="absolute bottom-3 right-5 bg-white px-4 py-2 rounded-lg shadow text-base font-semibold">
          +200 tours
        </div>
      </div>

      <div className="max-w-md text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Travel Any Corner of <br />
          <span className="text-blue-600">the world</span> with us
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Phasellus ac velit quis velit facilisis tincidunt.
        </p>
               <button
          onClick={() => document.getElementById("contactSection").scrollIntoView({ behavior: "smooth" })}
          className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-600 transition"
        >
          Contact Us
        </button>
      </div>
    </section>
  );
}
