import React, { useEffect, useState } from "react";
import axios from "axios";
import ConfirmModal from "./ConfirmModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlockUser = async (userId) => {
    try {
      await axios.patch(
        `http://127.0.0.1:5000/api/users/block/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_blocked: !u.is_blocked } : u
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to block/unblock the user.");
    }
  };

  const confirmDelete = (userId) => {
    setUserToDelete(userId);
    setShowModal(true);
  };

  const deleteUser = async () => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/users/${userToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      setShowModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete the user.");
      setShowModal(false);
    }
  };

  return (
    <div className="p-6 md:p-10 lg:p-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-800">
        Users Management
      </h1>
      {error && (
        <p className="text-red-500 mb-4 text-center font-semibold">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full min-w-[600px] bg-white divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["Name", "Email", "Role", "Status", "Actions"].map((title) => (
                <th
                  key={title}
                  className="p-4 text-left text-gray-600 font-medium tracking-wide"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <span
                    className={`font-semibold px-2 py-1 rounded-full text-sm ${
                      user.is_blocked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.is_blocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => toggleBlockUser(user.id)}
                    className={`px-4 py-2 rounded-lg shadow text-white font-medium transition hover:scale-105 ${
                      user.is_blocked ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {user.is_blocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => confirmDelete(user.id)}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white font-medium shadow hover:bg-gray-800 transition hover:scale-105"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ConfirmModal
          message="Are you sure you want to delete this user?"
          onConfirm={deleteUser}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
