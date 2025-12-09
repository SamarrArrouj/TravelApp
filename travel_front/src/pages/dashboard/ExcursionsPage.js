import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ExcursionsPage() {
  const [excursions, setExcursions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState("");

  const fetchExcursions = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/excursions");
      setExcursions(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch excursions");
    }
  };

  useEffect(() => {
    fetchExcursions();
  }, []);

  const startEdit = (exc) => {
    setEditingId(exc.id);
    setEditData({
      title: exc.title,
      price: exc.price,
      duration: exc.duration,
    });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/excursions/${id}`, editData);
      setExcursions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...editData } : e))
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Unable to update excursion");
    }
  };

  const deleteExcursion = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/excursions/${id}`);
      setExcursions((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      setError("Unable to delete excursion");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Excursions Management</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="w-full bg-white shadow rounded-xl">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-4">Excursion</th>
            <th className="p-4">Price (€)</th>
            <th className="p-4">Duration</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {excursions.map((exc) => (
            <tr key={exc.id} className="border-b hover:bg-gray-50">
              {editingId === exc.id ? (
                <>
                  <td className="p-4">
                    <input
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      type="number"
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      value={editData.duration}
                      onChange={(e) =>
                        setEditData({ ...editData, duration: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>

                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => saveEdit(exc.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-4">{exc.title}</td>
                  <td className="p-4">{exc.price}</td>
                  <td className="p-4">{exc.duration}</td>

                  <td className="p-4">
                    <button
                      onClick={() => startEdit(exc)}
                      className="px-3 py-1 bg-blue-600 text-white rounded mr-2"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteExcursion(exc.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
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
  );
}
