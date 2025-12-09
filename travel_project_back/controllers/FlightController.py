from flask import Blueprint, request, jsonify
from services.FlightService import FlightService
from models.Flight import Flight
from models import db

flight_bp = Blueprint("flights", __name__)

@flight_bp.route("/flights/search", methods=["GET"])
def search_flights():
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    date = request.args.get("date")

    if not origin or not destination or not date:
        return jsonify({"error": "origin, destination et date sont obligatoires"}), 400

    time = request.args.get("time")
    adults = int(request.args.get("adults", 1))

    try:
        flights = FlightService.search_flights(origin, destination, date, adults, time)
        return jsonify(flights), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400




@flight_bp.route("/flights/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()
    flight_id = data.get("flight_id")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    passengers = data.get("passengers", 1)

    try:
        reservation = FlightService.create_reservation(flight_id, name, email, phone, passengers)
        return jsonify({
            "message": "Réservation réussie",
            "reservation_id": reservation.id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@flight_bp.route("/flights/create-payment-intent", methods=["POST"])
def create_payment_intent():
    data = request.get_json()
    flight_id = data.get("flight_id")
    passengers = data.get("passengers", 1)

    try:
        intent = FlightService.create_payment_intent(flight_id, passengers)
        return jsonify({
            "client_secret": intent.client_secret
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    


@flight_bp.route("/flights/create-checkout-session", methods=["POST"], endpoint="checkout_session")
def create_checkout_session():
    data = request.get_json()
    flight_id = data.get("flight_id")
    passengers = data.get("passengers", 1)

    try:
        session = FlightService.create_checkout_session(flight_id, passengers)
        return jsonify({'url': session.url})  # ✅ Correct
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@flight_bp.route("/flights/dashboard", methods=["GET"])
def dashboard_flights():
    flights = Flight.query.all()
    flights_list = [
        {
            "id": f.id,
            "airline": f.airline,
            "departure_city": f.departure_city,
            "arrival_city": f.arrival_city,
            "departure_time": f.departure_time,
            "arrival_time": f.arrival_time,
            "price": f.price
        } for f in flights
    ]
    return jsonify(flights_list), 200



@flight_bp.route("/flights/<int:flight_id>", methods=["PUT"])
def update_flight(flight_id):
    data = request.get_json()
    flight = Flight.query.get(flight_id)

    if not flight:
        return jsonify({"error": "Flight not found"}), 404

    # Mise à jour des champs
    flight.departure_city = data.get("departure_city", flight.departure_city)
    flight.arrival_city = data.get("arrival_city", flight.arrival_city)
    flight.departure_time = data.get("departure_time", flight.departure_time)
    flight.arrival_time = data.get("arrival_time", flight.arrival_time)
    flight.price = data.get("price", flight.price)

    try:
        db.session.commit()
        return jsonify({"message": "Flight updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================== DELETE FLIGHT ==================
@flight_bp.route("/flights/<int:flight_id>", methods=["DELETE"])
def delete_flight(flight_id):
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "Flight not found"}), 404

    try:
        db.session.delete(flight)
        db.session.commit()
        return jsonify({"message": "Flight deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400