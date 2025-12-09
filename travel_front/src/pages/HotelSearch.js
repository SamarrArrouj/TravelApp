import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import "./HotelSearch.css";
import Header from "../components/Header";

const stripePromise = loadStripe("pk_test_51SNDz9RsIr0Px0ZAVceXTijqYJfwSYVgxY1oAbL293fLoeliTjorp2KVZvCOTZsTGwJQiD2E5xfv4LdRfUfkmSk0002HDH5gLS");

function HotelSearch() {
  const countries = [
    { code: "TN", name: "Tunisie" },
    { code: "FR", name: "France" },
    { code: "US", name: "United States" },
    { code: "TR", name: "Turkey" },
  ];

  const heroImages = [
    "https://i.pinimg.com/1200x/53/9b/bf/539bbfba6deedd455432072e0ac7b8ab.jpg",
    "https://i.pinimg.com/1200x/f5/a7/34/f5a734ad3d5c123b4a95b7ec14e09326.jpg",
    "https://i.pinimg.com/1200x/db/c0/0d/dbc00d838006e6a20c07c3383d0f1f24.jpg"
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  const [countryCode, setCountryCode] = useState("TN");
  const [cityCode, setCityCode] = useState("TUN");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [bookingFormVisible, setBookingFormVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchHotels(countryCode, cityCode);
  }, [countryCode, cityCode]);

  const fetchHotels = async (country, city) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/hotels/search?city_code=${city}&country_code=${country}`);
      const data = await res.json();
      const safeData = (Array.isArray(data) ? data : []).map((h) => ({
        ...h,
        gallery_images: h.gallery_images?.length
          ? h.gallery_images
          : [h.image_url || `https://source.unsplash.com/800x500/?${encodeURIComponent(h.city + " hotel")}`],
      }));
      setHotels(safeData);
    } catch (err) {
      console.error(err);
      setHotels([]);
    }
    setLoading(false);
  };

  const openModal = (hotel) => {
    setSelectedHotel(hotel);
    setImageIndex(0);
    setBookingFormVisible(false);
    setName(""); setEmail(""); setPhone("");
    setGuests(1); setCheckIn(""); setCheckOut("");
    setMessage({ text: "", type: "" });
  };

  const closeModal = () => {
    setSelectedHotel(null);
    setBookingFormVisible(false);
  };

  const nextImage = () => {
    if (!selectedHotel?.gallery_images?.length) return;
    setImageIndex((prev) => (prev + 1) % selectedHotel.gallery_images.length);
  };

  const prevImage = () => {
    if (!selectedHotel?.gallery_images?.length) return;
    setImageIndex((prev) => (prev - 1 + selectedHotel.gallery_images.length) % selectedHotel.gallery_images.length);
  };

  const handleBookingSubmit = async () => {
  if (!name || !email || !phone || !checkIn || !checkOut) {
    setMessage({ text: "⚠️ Veuillez remplir tous les champs.", type: "error" });
    return;
  }

  try {
    // 1️⃣ Créer la réservation locale (optionnel – vous pourriez aussi le faire dans le webhook)
    const resBooking = await fetch("http://127.0.0.1:5000/hotels/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotel_id: selectedHotel.id,
        name, email, phone, guests, check_in: checkIn, check_out: checkOut,
      }),
    });

    const bookingData = await resBooking.json();
    if (bookingData.error) {
      setMessage({ text: `❌ ${bookingData.error}`, type: "error" });
      return;
    }

    // 2️⃣ Créer la session Stripe Checkout → obtenir l'URL
    const resStripe = await fetch("http://127.0.0.1:5000/hotels/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotel_id: selectedHotel.id,
        name, email, phone, // ⚠️ Important : transmettez les infos pour le webhook
        guests,
        check_in: checkIn,
        check_out: checkOut,
      }),
    });

    const stripeData = await resStripe.json();
    if (stripeData.error) {
      setMessage({ text: `💳 ${stripeData.error}`, type: "error" });
      return;
    }

    // 3️⃣ Redirection vers Stripe (sans Stripe.js !)
    if (stripeData.url) {
      window.location.href = stripeData.url;
    } else {
      setMessage({ text: "❌ Erreur : URL de paiement manquante.", type: "error" });
    }

  } catch (err) {
    console.error(err);
    setMessage({ text: "❌ Une erreur est survenue.", type: "error" });
  }
};
  return (
    <div className="hotel-search-page">
      <Header />
      {/* Hero Section */}
      <div className="hero-section">
        {heroImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Slide ${i}`}
            className={`hero-image ${i === heroIndex ? "active" : ""}`}
          />
        ))}
        <div className="hero-search">
          <h1>Search your Holiday</h1>
          <div className="search-bar">
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
            <select value={cityCode} onChange={(e) => setCityCode(e.target.value)}>
              {countryCode === "TN" && <>
                <option value="TUN">Tunis</option>
                <option value="DJE">Djerba</option>
              </>}
              {countryCode === "FR" && <option value="PAR">Paris</option>}
              {countryCode === "TR" && <>
                <option value="IST">Istanbul</option>
                <option value="AYT">Antalya</option>
              </>}
              {countryCode === "US" && <>
                <option value="NYC">New York</option>
                <option value="LAX">Los Angeles</option>
              </>}
            </select>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="hotels-grid">
        {loading && <div className="status-message info">⏳ Downloading hotels...</div>}
        {!loading && hotels.length === 0 && <div className="status-message error">😔 No hotels found</div>}
        {hotels.map((h) => (
          <div key={h.id} className="hotel-card">
            <div className="hotel-image-container">
              <img className="hotel-image" src={h.image_url} alt={h.name} />
              {h.isOnSale && <span className="badge">SALE</span>}
            </div>
            <div className="hotel-info">
              <h3>{h.name}</h3>
              <p className="category">{h.category || "Relax / Culture"}</p>
              <p className="description">{h.description?.substring(0, 60) || "No description"}...</p>
              <p className="price">💰 {h.price_per_night}</p>
              <button className="details-btn" onClick={() => openModal(h)}>Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Details */}
      {selectedHotel && !bookingFormVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>✖</button>

            <div className="carousel-container">
              <button className="nav-btn left" onClick={prevImage}>◀</button>
              <img
                className="carousel-image"
                src={selectedHotel.gallery_images[imageIndex]}
                alt={`${selectedHotel.name} - ${imageIndex + 1}`}
              />
              <button className="nav-btn right" onClick={nextImage}>▶</button>
            </div>

            <div className="modal-info">
              <h2>{selectedHotel.name}</h2>
              <p>{selectedHotel.address}, {selectedHotel.city}</p>
              <p><strong>Price:</strong> {selectedHotel.price_per_night}</p>
              <p>{selectedHotel.description || "No description available."}</p>
              <button className="book-btn" onClick={() => setBookingFormVisible(true)}>Book Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Booking Form */}
      {selectedHotel && bookingFormVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="booking-form" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-form" onClick={() => setBookingFormVisible(false)}>✖</button>
            <h3>Booking for {selectedHotel.name}</h3>
            <input placeholder="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="Number of Guests" type="number" min="1" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            <div className="booking-buttons">
              <button className="confirm-btn" onClick={handleBookingSubmit}>💳 Pay & Book</button>
              <button className="cancel-btn" onClick={() => setBookingFormVisible(false)}>Back</button>
            </div>
            {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
          </div>
        </div>
      )}

    </div>
  
);
}

export default HotelSearch;
