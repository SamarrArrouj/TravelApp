import { useEffect, useState } from "react";
import "./ExcursionsList.css";
import Header from "../components/Header";

export default function ExcursionList() {
  const [excursions, setExcursions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // 1️⃣ Fetch data
  useEffect(() => {
    fetch("http://localhost:5000/api/excursions")
      .then((res) => res.json())
      .then((data) => {
        setExcursions(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur fetch excursions:", err);
        setLoading(false);
      });
  }, []);

  // 2️⃣ Filtrage automatique
  useEffect(() => {
    const filteredData = excursions.filter((exc) => {
      const matchSearch =
        exc.title.toLowerCase().includes(search.toLowerCase()) ||
        exc.city.toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter
        ? exc.category.toLowerCase() === typeFilter.toLowerCase() // Utiliser "category"
        : true;

      return matchSearch && matchType;
    });

    setFiltered(filteredData);
  }, [search, typeFilter, excursions]);

  if (loading) return <p className="loading">Loading excursions...</p>;

  return (
    <div className="excursion-page">
      {/* === HERO SECTION === */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>EXPLORE</h1>
          <h2>DREAM DESTINATION</h2>
          <p>Offering comprehensive travel solutions to individuals and groups</p>

          {/* === BARRE DE RECHERCHE === */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom ou ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All categories</option>
              <option value="adventure">Adventure</option>
              <option value="cultural">Cultural</option>
              <option value="relaxation">Relaxation</option>
            </select>
          </div>
        </div>
      </section>

      {/* === POPULAR EXCURSIONS === */}
      <section className="popular-section">
        <Header />
        <h2>POPULAR TOUR PLACES</h2>
        <div className="excursion-container">
          {filtered.length === 0 ? (
            <p>No excursions found.</p>
          ) : (
            filtered.map((exc) => (
              <div key={exc.id} className="excursion-card">
                <img
                  src={exc.image_url || "https://via.placeholder.com/300x200"}
                  alt={exc.title}
                  className="excursion-image"
                />
                <div className="excursion-info">
                  <h3 className="excursion-title">{exc.title}</h3>
                  <p><strong>Category:</strong> {exc.category}</p>
                  <p><strong>City:</strong> {exc.city}</p>
                  <p><strong>Date:</strong> {exc.date}</p>
                  <p><strong>Price:</strong> {exc.price} €</p>
                  <p className={`available-spots ${exc.available_spots === 0 ? "complet" : ""}`}>
                    <strong>Available spots:</strong> {exc.available_spots > 0 ? exc.available_spots : "Full"}
                  </p>
                  <button
                    className="excursion-button"
                    onClick={() => (window.location.href = `/excursions/${exc.id}`)}
                  >
                    See details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
