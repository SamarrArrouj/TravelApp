from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ExcursionService import ExcursionService
from services.UserService import UserService
from services.HotelService import HotelService
from services.FlightService import FlightService
from datetime import datetime

stats_bp = Blueprint("stats_bp", __name__)

@stats_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_user_stats():
    current_user_id = int(get_jwt_identity()) 
    current_user = UserService.get_user_by_id(current_user_id)

    if not current_user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    if current_user.role != "admin":
        return jsonify({"error": "Accès interdit"}), 403

    # Users par rôle
    users = UserService.get_all_users()
    users_by_role = {"admin": 0, "voyageur": 0}
    for u in users:
        if u.role in users_by_role:
            users_by_role[u.role] += 1
        else:
            users_by_role[u.role] = 1

    # Inscriptions par mois (année en cours)
    current_year = datetime.now().year
    registrations_per_month = [0]*12
    for u in users:
        if u.created_at.year == current_year:
            registrations_per_month[u.created_at.month - 1] += 1

    # Top excursions
    top_excursions_raw = ExcursionService.get_top_excursions(limit=5)
    top_excursions = [
        {"title": e.title, "bookings_count": e.max_participants - e.available_spots}
        for e in top_excursions_raw
    ]

    # Total hôtels
    total_hotels = HotelService.count_hotels()

    # Total vols
    total_flights = FlightService.count_flights()

    return jsonify({
        "users_by_role": users_by_role,
        "registrations_per_month": registrations_per_month,
        "top_excursions": top_excursions,
        "total_hotels": total_hotels,
        "total_flights": total_flights
    }), 200
