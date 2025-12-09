import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";

export default function DashboardFlightsPage() {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");
  const [editingFlightId, setEditingFlightId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch flights
  const fetchFlights = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/flights/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFlights(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch flights.");
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Start editing a flight
  const startEdit = (flight) => {
    setEditingFlightId(flight.id);
    setEditData({
      departure_city: flight.departure_city,
      arrival_city: flight.arrival_city,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      price: flight.price,
    });
  };

  const saveEdit = async (flightId) => {
    try {
      await axios.put(
        `http://127.0.0.1:5000/flights/${flightId}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFlights((prev) =>
        prev.map((f) => (f.id === flightId ? { ...f, ...editData } : f))
      );

      setEditingFlightId(null);
      setEditData({});
    } catch (err) {
      console.error(err);
      setError("Unable to update flight.");
    }
  };

  const cancelEdit = () => {
    setEditingFlightId(null);
    setEditData({});
  };

  // Delete flight
  const confirmDelete = (flightId) => {
    setFlightToDelete(flightId);
    setShowModal(true);
  };

  const deleteFlight = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/flights/${flightToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlights((prev) => prev.filter((f) => f.id !== flightToDelete));
      setShowModal(false);
      setFlightToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete flight.");
      setShowModal(false);
    }
  };

  return (
    <div className="p-6 md:p-10 lg:p-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800">
        Flights Management
      </h1>

      {error && <p className="text-red-500 mb-4 text-center font-semibold">{error}</p>}

      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full min-w-[600px] bg-white divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["From", "To", "Departure", "Arrival", "Price (€)", "Actions"].map(
                (title) => (
                  <th
                    key={title}
                    className="p-4 text-left text-gray-600 font-medium tracking-wide"
                  >
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flights.map((flight) => (
              <tr
                key={flight.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {editingFlightId === flight.id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editData.departure_city}
                        onChange={(e) =>
                          setEditData({ ...editData, departure_city: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={editData.arrival_city}
                        onChange={(e) =>
                          setEditData({ ...editData, arrival_city: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="datetime-local"
                        value={editData.departure_time}
                        onChange={(e) =>
                          setEditData({ ...editData, departure_time: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="datetime-local"
                        value={editData.arrival_time}
                        onChange={(e) =>
                          setEditData({ ...editData, arrival_time: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={editData.price}
                        onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(flight.id)}
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
                    <td className="p-4">{flight.departure_city}</td>
                    <td className="p-4">{flight.arrival_city}</td>
                    <td className="p-4">{new Date(flight.departure_time).toLocaleString()}</td>
                    <td className="p-4">{new Date(flight.arrival_time).toLocaleString()}</td>
                    <td className="p-4">{flight.price}</td>
                    <td className="p-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(flight)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(flight.id)}
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
          message="Are you sure you want to delete this flight?"
          onConfirm={deleteFlight}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
