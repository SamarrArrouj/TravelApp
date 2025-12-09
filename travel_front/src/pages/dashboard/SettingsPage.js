import React from "react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white shadow rounded-xl p-6">
        <div className="mb-4">
          <label className="block font-semibold mb-1">Admin Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            defaultValue="Admin"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            defaultValue="admin@example.com"
          />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Save Changes
        </button>
      </div>
    </div>
  );
}
