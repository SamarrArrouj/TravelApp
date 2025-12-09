import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./FlightSearch.css";
import Header from "../components/Header";

const stripePromise = loadStripe("pk_test_51SNDz9RsIr0Px0ZAVceXTijqYJfwSYVgxY1oAbL293fLoeliTjorp2KVZvCOTZsTGwJQiD2E5xfv4LdRfUfkmSk0002HDH5gLS");

function FlightSearch() {
  const airports = [
    { code: "TUN", name: "Tunis (TUN)" },
    { code: "CDG", name: "Paris (CDG)" },
    { code: "IST", name: "Istanbul (IST)" },
    { code: "LHR", name: "London (LHR)" },
    { code: "JFK", name: "New York (JFK)" },
  ];

  const [origin, setOrigin] = useState("TUN");
  const [destination, setDestination] = useState("IST");
  const [date, setDate] = useState("2025-11-15");
  const [time, setTime] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [hasSearched, setHasSearched] = useState(false);

  const formatTime = (datetime) => {
    const dateObj = new Date(datetime);
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const airlineImages = {
    TU: "/assets/images/tunisair.jpg",
    BJ: "/assets/images/nouvelair.jpg",
    TK: "/assets/images/turkish.jpg",
    LH: "/assets/images/lufthansa.jpg",
    A3: "/assets/images/aegean.jpg",
    AF: "/assets/images/airfrance.jpg",
    KL: "/assets/images/klm.jpg",
    AZ: "/assets/images/ita.jpg",
    HV: "/assets/images/transavia.jpg",
    BA: "/assets/images/britishairways.jpg",
    AA: "/assets/images/americanairlines.jpg",
  };

  const getAirlineImage = (code) => airlineImages[code] || "/assets/images/airplane.jpg";

  const handleSearch = async () => {
    setHasSearched(true);
    setLoading(true);
    setFlights([]);
    try {
      const url = `http://127.0.0.1:5000/flights/search?origin=${origin}&destination=${destination}&date=${date}${time ? `&time=${time}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFlights([]);
    }
    setLoading(false);
  };

  const handlePayment = async () => {
  if (!selectedFlight || !name || !email || !phone) {
    setMessage({ text: "⚠️ Please fill in all fields to continue booking.", type: "error" });
    return;
  }

  try {
    // 1️⃣ Create local reservation (optional – ensure your backend handles it safely)
    const resBooking = await fetch("http://127.0.0.1:5000/flights/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flight_id: selectedFlight.id,
        name,
        email,
        phone,
        passengers
      })
    });

    const bookingData = await resBooking.json();
    if (bookingData.error) {
      setMessage({ text: `❌ Unable to book this flight: ${bookingData.error}`, type: "error" });
      return;
    }

    // 2️⃣ Create Stripe Checkout session → get redirect URL
    const resStripe = await fetch("http://127.0.0.1:5000/flights/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        flight_id: selectedFlight.id, 
        passengers 
      })
    });

    const stripeData = await resStripe.json();
    if (stripeData.error) {
      setMessage({ text: `💳 Payment failed: ${stripeData.error}`, type: "error" });
      return;
    }

    // ✅ 3️⃣ REDIRECT TO STRIPE (no Stripe.js needed!)
    if (stripeData.url) {
      window.location.href = stripeData.url;
    } else {
      setMessage({ text: "❌ Missing payment URL. Please try again.", type: "error" });
    }

  } catch (err) {
    console.error(err);
    setMessage({ text: "❌ An error occurred during booking. Please try again.", type: "error" });
  }
};

  return (
    <div className="flight-page">
      <Header/>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>✈️ Find Your Perfect Flight</h1>
          <p>Plan your next adventure easily and quickly</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
          {airports.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
        </select>
        <select value={destination} onChange={(e) => setDestination(e.target.value)}>
          {airports.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Flights Grid */}
      <div className="flights-grid">
        {loading && <div className="status-message info">⏳ Loading</div>}
        {!loading && hasSearched && flights.length === 0 && (
          <div className="status-message error">😔 No flights found</div>
        )}
        {flights.map((f, i) => (
          <div key={i} className="flight-card">
            <img src={getAirlineImage(f.airline)} alt={f.airline} />
            <div className="flight-info">
              <h3>{f.departure_city} → {f.arrival_city}</h3>
              <p className="time">🕒 {formatTime(f.departure_time)} → {formatTime(f.arrival_time)}</p>
              <p className="airline">✈️ {f.airline}</p>
              <h4 className="price">{f.price} TND</h4>
              <button className="book-btn" onClick={() => { setSelectedFlight(f); setMessage({ text: "", type: "" }); }}>Reserve</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedFlight && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Book Your Flight</h3>
            <div className="flight-route">
              <span className="route">{selectedFlight.departure_city} → {selectedFlight.arrival_city}</span>
              <span className="time">{formatTime(selectedFlight.departure_time)} – {formatTime(selectedFlight.arrival_time)}</span>
            </div>
            <label>Full Name
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>Email
              <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>Phone
              <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label>Number of Passengers
              <input type="number" min="1" placeholder="Number of Passengers" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} />
            </label>
            <div className="modal-buttons">
              <button className="confirm" onClick={handlePayment}>Pay & Confirm</button>
              <button className="cancel" onClick={() => setSelectedFlight(null)}>Cancel</button>
            </div>
            {message.text && (
              <div className={`form-message ${message.type}`}>{message.text}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
