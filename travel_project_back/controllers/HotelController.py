from flask import Blueprint, request, jsonify
from services.HotelService import HotelService
import stripe
import os
from flask_cors import cross_origin
from models.Hotel import Hotel

hotel_bp = Blueprint("hotels", __name__)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")  

# Route recherche hôtels (existante)
@hotel_bp.route("/hotels/search", methods=["GET"])
def search_hotels():
    city_code = request.args.get("city_code")
    country_code = request.args.get("country_code")
    hotels_list = HotelService.search_hotels(city_code)
    if country_code:
        hotels_list = [h for h in hotels_list if h["country"] == country_code]
    return jsonify(hotels_list)


# 🔹 Route création réservation
@hotel_bp.route("/hotels/reservations", methods=["POST"])
def create_reservation():
    data = request.json
    try:
        hotel_id = data.get("hotel_id")
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        guests = int(data.get("guests", 1))
        check_in = data.get("check_in")
        check_out = data.get("check_out")

        # Vérification basique
        if not all([hotel_id, name, email, phone, check_in, check_out]):
            return jsonify({"error": "Tous les champs sont requis."}), 400


        # Crée la session Stripe Checkout
        session = HotelService.create_checkout_session(hotel_id, check_in, check_out, guests)

        return jsonify({"checkout_url": session.url})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hotel_bp.route("/hotels/create-checkout-session", methods=["POST", "OPTIONS"])
def create_checkout_session():
    if request.method == "OPTIONS":
        return '', 200

    data = request.json
    try:
        hotel_id = data.get("hotel_id")
        check_in = data.get("check_in")
        check_out = data.get("check_out")
        guests = int(data.get("guests", 1))
        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")

        session = HotelService.create_checkout_session(
            hotel_id, check_in, check_out, guests, name, email, phone
        )
        return jsonify({"url": session.url})  # ✅ Correct

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hotel_bp.route("/hotels/payment-success", methods=["GET"])
def payment_success():
    session_id = request.args.get("session_id")
    if not session_id:
        return jsonify({"error": "session_id manquant"}), 400

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        metadata = session.metadata

        # Sauvegarder la réservation après paiement réussi
        reservation = HotelService.create_reservation(
            hotel_id=int(metadata["hotel_id"]),
            name=metadata.get("name", ""),
            email=metadata.get("email", ""),
            phone=metadata.get("phone", ""),
            check_in=metadata["check_in"],
            check_out=metadata["check_out"],
            guests=int(metadata.get("guests", 1))
        )

        return jsonify({"message": "Réservation sauvegardée !", "reservation_id": reservation.id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔹 Supprimer un hôtel
@hotel_bp.route("/hotels/<int:hotel_id>", methods=["DELETE", "OPTIONS"])
def delete_hotel(hotel_id):
    if request.method == "OPTIONS":
        return '', 200
    try:
        hotel = HotelService.get_hotel_by_id(hotel_id)
        if not hotel:
            return jsonify({"error": "Hôtel introuvable"}), 404
        HotelService.delete_hotel(hotel)
        return jsonify({"message": "Hôtel supprimé avec succès"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hotel_bp.route("/hotels/<int:hotel_id>", methods=["PUT"])
@cross_origin()  # autorise les requêtes depuis le frontend React
def update_hotel_route(hotel_id):
    data = request.json
    hotel = Hotel.query.get(hotel_id)
    if not hotel:
        return jsonify({"error": "Hôtel introuvable"}), 404

    try:
        HotelService.update_hotel(hotel, data)
        return jsonify({
            "message": "Hôtel mis à jour avec succès",
            "hotel": {
                "id": hotel.id,
                "name": hotel.name,
                "city": hotel.city,
                "country": hotel.country,
                "address": hotel.address,
                "price_per_night": hotel.price_per_night
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@hotel_bp.route("/hotels/top", methods=["GET"])
def get_top_hotels():
    try:
        hotels = Hotel.query.order_by(Hotel.price_per_night.asc()).limit(3).all()
        hotels_data = [{
            "id": h.id,
            "name": h.name,
            "city": h.city,
            "country": h.country,
            "address": h.address,
            "price_per_night": h.price_per_night,
            "image_url": h.image_url,
            "description": h.description
        } for h in hotels]

        return jsonify(hotels_data)  # toujours un tableau
    except Exception as e:
        print("Error fetching top hotels:", e)
        return jsonify([])  # <- tableau vide en cas d'erreur
