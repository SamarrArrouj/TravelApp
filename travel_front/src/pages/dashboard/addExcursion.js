import { useState } from "react";

export default function AddExcursion() {
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    city: "",
    address: "",
    date: "",
    duration: 1,
    price: 0,
    max_participants: 10,
    available_spots: 10,
    image_url: "",
    category: "adventure" 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/api/excursions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4">Ajouter une Excursion</h2>

      <input name="title" placeholder="Titre" onChange={handleChange} required className="input" />
      <input name="type" placeholder="Type" onChange={handleChange} className="input" />
      <textarea name="description" placeholder="Description" onChange={handleChange} className="input" />
      <input name="city" placeholder="Ville" onChange={handleChange} className="input" />
      <input name="address" placeholder="Adresse" onChange={handleChange} className="input" />
      <input name="date" type="date" onChange={handleChange} className="input" required />
      <input name="duration" type="number" placeholder="Durée (h)" onChange={handleChange} className="input" />
      <input name="price" type="number" placeholder="Prix" onChange={handleChange} className="input" />
      <input name="max_participants" type="number" placeholder="Max participants" onChange={handleChange} className="input" />
      <input name="available_spots" type="number" placeholder="Places disponibles" onChange={handleChange} className="input" />
      <input name="image_url" placeholder="URL image" onChange={handleChange} className="input" />


      <select 
        name="category" 
        onChange={handleChange} 
        className="input"
        value={form.category}
      >
        <option value="adventure">Adventure</option>
        <option value="cultural">Cultural</option>
        <option value="relaxation">Relaxation</option>
      </select>

      <button 
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 transition"
      >
        Ajouter l’excursion
      </button>
    </form>
  );
}
