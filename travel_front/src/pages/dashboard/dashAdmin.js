import React, { useEffect, useState, useRef } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import axios from "axios";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Composant pour l'animation de frappe
const TypingMessage = ({ message, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + message[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, message, speed]);

  return <p className="text-lg font-medium text-gray-600 mt-2">{displayedText}<span className="animate-pulse">|</span></p>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users_by_role: {},
    registrations_per_month: Array(12).fill(0),
    top_excursions: [],
    total_hotels: 0,
    total_flights: 0,
    excursions_by_category: {}
  });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const menuRef = useRef(null);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  
  // Fermer le menu si l'utilisateur clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await axios.get("http://127.0.0.1:5000/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({
          users_by_role: res.data.users_by_role || {},
          registrations_per_month: res.data.registrations_per_month || Array(12).fill(0),
          top_excursions: res.data.top_excursions || [],
          total_hotels: res.data.total_hotels || 0,
          total_flights: res.data.total_flights || 0,
          excursions_by_category: res.data.excursions_by_category || {}
        });
      } catch (err) {
        console.error("Erreur lors du chargement des stats:", err.response?.data || err);
        alert("Erreur lors du chargement des stats. Veuillez vous reconnecter.");
        handleLogout(); 
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const {
    users_by_role,
    registrations_per_month,
    top_excursions,
    total_hotels,
    total_flights
  } = stats;

  const roles = Object.keys(users_by_role);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Définition des couleurs pour les cartes
  const cardColors = [
    { bg: "bg-blue-500", shadow: "shadow-blue-500/50", icon: "fas fa-users" },
    { bg: "bg-purple-500", shadow: "shadow-purple-500/50", icon: "fas fa-mountain" },
    { bg: "bg-green-500", shadow: "shadow-green-500/50", icon: "fas fa-hotel" },
    { bg: "bg-yellow-500", shadow: "shadow-yellow-500/50", icon: "fas fa-plane" },
    { bg: "bg-red-500", shadow: "shadow-red-500/50", icon: "fas fa-tag" }
  ];

  // Composant Card pour simplifier le rendu
  const StatCard = ({ title, value, subtext, colorIndex }) => {
    const { bg, shadow, icon } = cardColors[colorIndex % cardColors.length];
    return (
      <div className={`
        ${bg} text-white p-6 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.03]
        transform hover:${shadow} cursor-pointer
      `}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium mb-1 opacity-90">{title}</h2>
            <p className="text-3xl font-extrabold">{value}</p>
          </div>
          <i className={`${icon} text-4xl opacity-70`}></i>
        </div>
        <p className="text-sm mt-2 opacity-80">{subtext}</p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header - Ajout du menu déroulant de profil */}
        <header className="flex justify-between items-center mb-4 relative">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Dashboard Overview ✨</h1>
            {/* Message d'Accueil animé */}
            <TypingMessage message="Hello Admin, welcome back! Check out the latest stats." speed={50} />
          </div>
          
          {/* Cercle de Profil et Menu */}
          <div className="relative" ref={menuRef}>
            <button 
                className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-xl 
                transition-transform duration-200 hover:scale-105 hover:bg-blue-700 cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                A
            </button>
            
            {/* Menu Déroulant */}
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-2xl py-1 z-20">
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-user-circle mr-2"></i> View Profile
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-cog mr-2"></i> Update Settings
                    </a>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-t mt-1"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                </div>
            )}
          </div>
        </header>

        {/* Espace pour séparer l'en-tête et les cartes après l'animation */}
        <div className="mb-8"></div> 

        {/* Cards statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={Object.values(users_by_role).reduce((a,b)=>a+b,0)}
            subtext={`${roles.length} Roles Actifs`}
            colorIndex={0}
          />
          <StatCard
            title="Total Excursions"
            value={top_excursions.length}
            subtext="Excursions Enregistrées"
            colorIndex={1}
          />
          <StatCard
            title="Total Hotels"
            value={total_hotels}
            subtext="Hôtels Enregistrés"
            colorIndex={2}
          />
          <StatCard
            title="Total Flights"
            value={total_flights}
            subtext="Vols Enregistrés"
            colorIndex={3}
          />
          <StatCard
            title="Active Roles"
            value={roles.length}
            subtext="Rôles d'Utilisateurs"
            colorIndex={4}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg h-96 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Users by Role 📊</h2>
            <div className="flex-1 flex items-center justify-center min-h-0">
                <Doughnut
                    data={{
                        labels: roles.length ? roles : ["No data"],
                        datasets: [{
                            data: roles.length ? roles.map(r => users_by_role[r]) : [1],
                            backgroundColor: ["#3b82f6","#10b981","#f59e0b","#ef4444", "#8b5cf6"]
                        }]
                    }}
                    options={{ maintainAspectRatio: false }}
                />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg xl:col-span-2 h-96 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Registrations per Month 📈</h2>
            <div className="flex-1 min-h-0">
                <Line
                    data={{
                        labels: months,
                        datasets: [{
                            label: "Registrations",
                            data: registrations_per_month,
                            borderColor: "#10b981",
                            backgroundColor: "rgba(16,185,129,0.1)",
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                        }]
                    }}
                    options={{ maintainAspectRatio: false }}
                />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg xl:col-span-3 h-96 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">Top Excursions 🗺️</h2>
            <div className="flex-1 min-h-0">
                <Bar
                    data={{
                        labels: top_excursions.length ? top_excursions.map(e => e.title) : ["No data"],
                        datasets: [{
                            label: "Bookings",
                            data: top_excursions.length ? top_excursions.map(e => e.bookings_count) : [0],
                            backgroundColor: "#3b82f6",
                            barThickness: 30,
                        }]
                    }}
                    options={{ maintainAspectRatio: false }}
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}