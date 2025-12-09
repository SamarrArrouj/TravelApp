import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState("");
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);

  const token = localStorage.getItem("token"); 

  const fetchHotels = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/hotels/search", {
        params: { city_code: "TUN" },
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch hotels.");
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const startEdit = (hotel) => {
    setEditingHotelId(hotel.id);
    setEditData({
      name: hotel.name,
      city: hotel.city,
      country: hotel.country,
      price_per_night: hotel.price_per_night,
    });
  };

  const saveEdit = async (hotelId) => {
    try {
      await axios.put(
        `http://127.0.0.1:5000/hotels/${hotelId}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHotels((prev) =>
        prev.map((h) => (h.id === hotelId ? { ...h, ...editData } : h))
      );
      setEditingHotelId(null);
      setEditData({});
    } catch (err) {
      console.error(err);
      setError("Unable to update hotel.");
    }
  };

  const cancelEdit = () => {
    setEditingHotelId(null);
    setEditData({});
  };

  const confirmDelete = (hotelId) => {
    setHotelToDelete(hotelId);
    setShowModal(true);
  };

  const deleteHotel = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/hotels/${hotelToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHotels((prev) => prev.filter((h) => h.id !== hotelToDelete));
      setShowModal(false);
      setHotelToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete hotel.");
      setShowModal(false);
    }
  };

  return (
    <div className="p-6 md:p-10 lg:p-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800">
        Hotels Management
      </h1>
      {error && (
        <p className="text-red-500 mb-4 text-center font-semibold">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full min-w-[600px] bg-white divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["Hotel", "City", "Country", "Price/Night", "Actions"].map((title) => (
                <th key={title} className="p-4 text-left text-gray-600 font-medium tracking-wide">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                {editingHotelId === hotel.id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editData.country}
                        onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editData.price_per_night}
                        onChange={(e) => setEditData({ ...editData, price_per_night: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(hotel.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4">{hotel.name}</td>
                    <td className="p-4">{hotel.city}</td>
                    <td className="p-4">{hotel.country}</td>
                    <td className="p-4">{hotel.price_per_night}</td>
                    <td className="p-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(hotel)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(hotel.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ConfirmModal
          message="Are you sure you want to delete this hotel?"
          onConfirm={deleteHotel}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
