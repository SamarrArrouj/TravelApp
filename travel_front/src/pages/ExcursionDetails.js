import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import "./ExcursionDetails.css";
import Header from "../components/Header";

// Charge la clé publique Stripe
const stripePromise = loadStripe("pk_test_51SNDz9RsIr0Px0ZAVceXTijqYJfwSYVgxY1oAbL293fLoeliTjorp2KVZvCOTZsTGwJQiD2E5xfv4LdRfUfkmSk0002HDH5gLS");

export default function ExcursionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [excursion, setExcursion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    participants: 1,
  });

  // Récupération des détails de l’excursion
  useEffect(() => {
    fetch(`http://localhost:5000/api/excursions/${id}`)
      .then(res => res.json())
      .then(data => {
        setExcursion(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur fetch excursion:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) return <p>Loading details...</p>;
  if (!excursion) return <p>Excursion not found</p>;

  return (
    <div className="excursion-details-page">
      <div className={`excursion-content ${showBookingForm ? "blurred" : ""}`}>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

        <div className="excursion-header">
          <img
            src={excursion.image_url || "https://via.placeholder.com/600x400"}
            alt={excursion.title}
            className="excursion-detail-image"
          />
          <div className="excursion-header-info">
            <h1>{excursion.title}</h1>
            <p><strong>Type :</strong> {excursion.type}</p>
            <p><strong>City :</strong> {excursion.city}</p>
            <p><strong>Date :</strong> {excursion.date}</p>
            <p><strong>Price :</strong> {excursion.price} €</p>
            <p className={`available-spots ${excursion.available_spots === 0 ? "complet" : ""}`}>
              <strong>Available spots :</strong> {excursion.available_spots > 0 ? excursion.available_spots : "Full"}
            </p>
            <button
              className="book-button"
              onClick={() => setShowBookingForm(true)}
              disabled={excursion.available_spots === 0}
            >
              Book
            </button>
          </div>
        </div>

        <section className="excursion-description">
          <h2>Description</h2>
          <p>{excursion.description}</p>
        </section>
      </div>

      {/* Modal réservation */}
      {showBookingForm && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <Elements stripe={stripePromise}>
              <CheckoutForm
                excursion={excursion}
                formData={formData}
                setFormData={setFormData}
                closeForm={() => setShowBookingForm(false)}
                updateExcursion={setExcursion} 
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}

// Formulaire de réservation + Stripe Checkout
function CheckoutForm({ excursion, formData, setFormData, closeForm, updateExcursion }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChangeInput = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Créer réservation locale
      const bookingRes = await fetch(
        `http://localhost:5000/api/excursions/${excursion.id}/create-booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      if (!bookingRes.ok) {
        const errData = await bookingRes.json();
        throw new Error(errData.message || "Impossible de créer la réservation");
      }

      const bookingData = await bookingRes.json();
      updateExcursion(prev => ({
        ...prev,
        available_spots: bookingData.available_spots
      }));

      // 2️⃣ Créer session Stripe → obtenir l'URL
      const res = await fetch(
        `http://localhost:5000/api/excursions/${excursion.id}/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur Stripe");
      }

      const { url } = await res.json(); // ✅ On récupère l'URL

      // 3️⃣ Rediriger vers Stripe
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL de session manquante");
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChangeInput}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChangeInput}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChangeInput}
        required
      />
      <input
        type="number"
        name="participants"
        placeholder="Number of participants"
        max={excursion.available_spots}
        value={formData.participants}
        onChange={handleChangeInput}
        required
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Pay & Book"}
      </button>
      <button type="button" className="close-button" onClick={closeForm}>
        Cancel
      </button>
    </form>
  );
}

