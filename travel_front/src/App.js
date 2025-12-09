import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import VerifyEmail from "./pages/verifyEmail";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import Home from "./pages/Home";
import FlightSearch from "./pages/FlightSearch";
import Success from "./pages/successPaiement";
import Cancel from "./pages/cancelPaiement";
import HotelSearch from "./pages/HotelSearch";
import AddExcursion from "./pages/dashboard/addExcursion";
import ExcursionList from "./pages/ExcursionsList";
import ExcursionDetails from "./pages/ExcursionDetails";
import AdminDashboard from "./pages/dashboard/dashAdmin";

import ItineraryForm from "./components/ItineraryForm";
import Chatbot from "./pages/chatbot";


import UsersPage from "./pages/dashboard/UsersPage";
import HotelsPage from "./pages/dashboard/HotelsPage";
import FlightsPage from "./pages/dashboard/FlightsPage";
import ExcursionsPage from "./pages/dashboard/ExcursionsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AdminLayout from "./pages/dashboard/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      {/* Context global pour l’itinéraire */}
 
        <Routes>
          {/* Auth & pages publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/flights" element={<FlightSearch />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/hotels" element={<HotelSearch />} />
          <Route path="/add-excursion" element={<AddExcursion />} />
          <Route path="/excursions" element={<ExcursionList />} />
          <Route path="/excursions/:id" element={<ExcursionDetails />} />

          {/* Routes IA avec contexte */}
          <Route path="/itinerary" element={<ItineraryForm />} />
         <Route path="/chatbot" element={<Chatbot />} />
         

          {/* Dashboard */}
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="flights" element={<FlightsPage />} />
            <Route path="excursions" element={<ExcursionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>

    </BrowserRouter>
  );
}

export default App;
