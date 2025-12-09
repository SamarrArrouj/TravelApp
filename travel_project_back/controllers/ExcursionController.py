from flask import Blueprint, jsonify, request
from services.ExcursionService import ExcursionService
from services.UserService import UserService
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.Excursion import Excursion
from models import db
from models.BookExcursion import BookExcursion
import stripe
import os

excursion_bp = Blueprint('excursion', __name__, url_prefix='/api/excursions')

# GET tous les excursions
@excursion_bp.route('', methods=['GET'])
def get_excursions():
    excursions = ExcursionService.get_all_excursions()
    return jsonify([{
        "id": e.id,
        "title": e.title,
        "type": e.type,
        "description": e.description,
        "city": e.city,
        "address": e.address,
        "date": e.date.strftime("%Y-%m-%d"),
        "duration": e.duration,
        "price": e.price,
        "available_spots": e.available_spots,
        "image_url": e.image_url,
        "category": e.category
    } for e in excursions])

# GET par ID
@excursion_bp.route('/<int:id>', methods=['GET'])
def get_excursion(id):
    e = ExcursionService.get_excursion_by_id(id)
    return jsonify({
        "id": e.id,
        "title": e.title,
        "type": e.type,
        "description": e.description,
        "city": e.city,
        "address": e.address,
        "date": e.date.strftime("%Y-%m-%d"),
        "duration": e.duration,
        "price": e.price,
        "available_spots": e.available_spots,
        "image_url": e.image_url,
        "category": e.category
    })

# POST ajouter excursion
@excursion_bp.route('', methods=['POST'])
def add_excursion():
    data = request.json
    try:
        excursion = ExcursionService.create_excursion(data)
        return jsonify({"message": "Excursion ajoutée", "id": excursion.id})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST créer PaymentIntent
@excursion_bp.route('/<int:id>/create-payment-intent', methods=['POST'])
def create_payment_intent(id):
    data = request.json
    participants = data.get("participants", 1)
    try:
        intent = ExcursionService.create_payment_intent(id, participants)
        return jsonify({"client_secret": intent.client_secret})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# POST créer booking local
@excursion_bp.route('/<int:id>/create-booking', methods=['POST'])
def create_booking(id):
    data = request.json
    try:
        booking = ExcursionService.create_booking_from_form(id, data)
        return jsonify({
            "message": "Réservation réussie",
            "booking_id": booking.id,
            "available_spots": booking.excursion.available_spots
        })
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST créer session Stripe
@excursion_bp.route('/<int:id>/create-checkout-session', methods=['POST'])
def create_checkout_session(id):
    data = request.get_json()
    try:
        session = ExcursionService.create_checkout_session(id, data)
        return jsonify({"url": session.url})  # ✅ Retourne l'URL complète
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@excursion_bp.route("/stripe-webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        try:
            ExcursionService.create_booking_from_session(session["metadata"])
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    return jsonify({"status": "success"}), 200

@excursion_bp.route("/stats", methods=["GET"])
@jwt_required()
def excursion_stats():
    current_user_id = get_jwt_identity()
    current_user = UserService.get_user_by_id(current_user_id)
    if current_user.role != "admin":
        return jsonify({"error": "Accès interdit"}), 403

    excursions = ExcursionService.get_all_excursions() 
    # top 5 excursions par réservations
    top_excursions = sorted(excursions, key=lambda e: getattr(e, "bookings_count", 0), reverse=True)[:5]
    top_excursions_data = [{"title": e.title, "bookings_count": getattr(e, "bookings_count", 0)} for e in top_excursions]

    excursions_by_category = ExcursionService.get_excursions_by_category()

    return jsonify({
        "top_excursions": top_excursions_data,
        "excursions_by_category": excursions_by_category,
    }), 200


@excursion_bp.route('/<int:id>', methods=['PUT'])
def update_excursion(id):
    data = request.json
    excursion = Excursion.query.get_or_404(id)

    excursion.title = data.get("title", excursion.title)
    excursion.duration = data.get("duration", excursion.duration)
    excursion.price = data.get("price", excursion.price)

    try:
        db.session.commit()
        return jsonify({"message": "Excursion updated"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@excursion_bp.route('/<int:id>', methods=['DELETE'])
def delete_excursion(id):
    excursion = Excursion.query.get_or_404(id)

    try:
        # Supprimer d'abord les bookings liés
        BookExcursion.query.filter_by(excursion_id=id).delete()
        db.session.delete(excursion)
        db.session.commit()
        return jsonify({"message": "Excursion deleted"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400




