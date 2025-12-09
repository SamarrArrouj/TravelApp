import React from "react";
import { AcademicCapIcon, GlobeAltIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion"; // <- pour l'animation

const testimonials = [
  {
    avatar: "/assets/images/avatar1.jpg",
    text: "Amazing service! Every detail of our trip was perfect.",
    name: "Alice Johnson",
  },
  {
    avatar: "/assets/images/avatar2.jpg",
    text: "The team helped us explore hidden gems we never knew existed!",
    name: "Michael Smith",
  },
  {
    avatar: "/assets/images/avatar3.jpg",
    text: "Highly recommend! Their travel advice is top-notch.",
    name: "Samantha Lee",
  },
  {
    avatar: "/assets/images/avatar.jpg",
    text: "I really admire your perspective—it shows a lot of thoughtfulness and insight.",
    name: "John Doe",
  },
];

export default function AboutUsSections() {
  return (
    <section className="bg-gray-50 px-6 md:px-20 py-16">

      {/* Section: Why choose us */}
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-12 drop-shadow-md">
          Why choose us
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          {[
            { icon: <AcademicCapIcon className="h-16 w-16 text-blue-500 mb-4" />, title: "Expert Guidance", desc: "Our team provides expert travel advice to make your trips seamless." },
            { icon: <GlobeAltIcon className="h-16 w-16 text-blue-500 mb-4" />, title: "Global Destinations", desc: "Explore the best destinations around the world with ease." },
            { icon: <SparklesIcon className="h-16 w-16 text-blue-500 mb-4" />, title: "Memorable Experiences", desc: "We ensure every trip you take is unforgettable and unique." }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="w-64 h-64 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              {item.icon}
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Section: Testimonials */}
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold mb-12">
          What people are <span className="text-blue-500">saying</span> about us
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center"
            >
              <img
                src={t.avatar}
                alt={`Avatar ${t.name}`}
                className="w-20 h-20 rounded-full mb-4 border-2 border-blue-500"
              />
              <p className="text-gray-700 text-center mb-2">"{t.text}"</p>
              <span className="text-blue-500 font-semibold">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
