import React, { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaWhatsapp } from "react-icons/fa";

function CardContact({ icon: Icon, iconColor, title, detail }) {
  return (
    <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300">
      <Icon className={`${iconColor} text-3xl`} />
      <div>
        <p className="text-gray-600 font-semibold">{title}</p>
        <p className="text-gray-800 font-bold">{detail}</p>
      </div>
    </div>
  );
}

export default function ContactSection() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  // Animation au scroll
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("contact-cards");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          setVisible(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const response = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus(result.error || "Failed to send message.");
      }
    } catch (err) {
      setStatus("Failed to send message.");
      console.error(err);
    }
  };

  return (
    <section  id="contactSection" className="bg-gray-50 px-6 md:px-20 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-blue-500">
          Get in <span className="text-blue-700">Touch</span>
        </h2>
        <p className="text-gray-600 mt-4 text-lg md:text-xl">
          We'd love to hear from you. Reach out using the form or contact info below.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-12">
        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 bg-white p-10 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-500"
        >
          {["name", "email", "phone", "message"].map((field) => (
            <div className="mb-6" key={field}>
              <label
                className="block text-gray-800 font-bold text-lg md:text-xl mb-2"
                htmlFor={field}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              {field !== "message" ? (
                <input
                  type={field === "email" ? "email" : "text"}
                  id={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 focus:scale-105 transition transform duration-300"
                  placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                  required
                />
              ) : (
                <textarea
                  id={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-4 h-36 resize-none focus:outline-none focus:ring-4 focus:ring-blue-400 focus:scale-105 transition transform duration-300"
                  placeholder="Your Message"
                  required
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-8 rounded-xl hover:from-blue-600 hover:to-blue-800 hover:scale-105 hover:rotate-1 shadow-lg transition transform duration-300"
          >
            Send Message
          </button>
          {status && <p className="mt-4 text-center text-gray-700">{status}</p>}
        </form>

        {/* Cartes contact */}
        <div
          id="contact-cards"
          className={`flex-1 flex flex-col gap-6 transition-all duration-800 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <CardContact
            icon={FaPhone}
            iconColor="text-blue-400"
            title="Hotline:"
            detail="+971 56 498 3456"
          />
          <CardContact
            icon={FaWhatsapp}
            iconColor="text-green-400"
            title="SMS / Whatsapp:"
            detail="+971 55 343 6433"
          />
          <CardContact
            icon={FaEnvelope}
            iconColor="text-red-400"
            title="Email:"
            detail="support@zalomi.com"
          />
        </div>
      </div>
    </section>
  );
}
