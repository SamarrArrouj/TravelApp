import stripe
from models.Excursion import Excursion
from models.BookExcursion import BookExcursion
from models import db
from datetime import datetime
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class ExcursionService:

    @staticmethod
    def get_all_excursions():
        """Retourne toutes les excursions"""
        return Excursion.query.all()

    @staticmethod
    def get_excursion_by_id(excursion_id):
        """Retourne une excursion par ID, 404 si non trouvée"""
        return Excursion.query.get_or_404(excursion_id)

    @staticmethod
    def create_excursion(data):
        """Créer une nouvelle excursion avec validations"""
        # Vérifier les champs obligatoires
        required_fields = ["title", "type", "description", "city", "address", "date", "duration", "price", "available_spots", "image_url", "category"]
        for field in required_fields:
            if not data.get(field):
                raise ValueError(f"Le champ {field} est obligatoire")

        # Validation de la date
        try:
            date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Format de date invalide. Utiliser YYYY-MM-DD")

        # Créer l’excursion
        excursion = Excursion(
            title=data["title"],
            type=data["type"],
            description=data["description"],
            city=data["city"],
            address=data["address"],
            date=date,
            duration=int(data["duration"]),
            price=float(data["price"]),
            max_participants=int(data.get("max_participants", data["available_spots"])),
            available_spots=int(data["available_spots"]),
            image_url=data["image_url"],
            category=data["category"]
        )

        db.session.add(excursion)
        db.session.commit()
        return excursion

    @staticmethod
    def create_booking_from_form(excursion_id, form_data):
        """Créer une réservation locale depuis un formulaire"""
        excursion = Excursion.query.get_or_404(excursion_id)
        participants = int(form_data.get("participants", 1))

        if excursion.available_spots is None:
            excursion.available_spots = 0
        if excursion.available_spots < participants:
            raise ValueError("Pas assez de places disponibles")

        booking = BookExcursion(
            excursion_id=excursion.id,
            name=form_data.get("name", ""),
            email=form_data.get("email", ""),
            phone=form_data.get("phone", ""),
            participants=participants
        )
        excursion.available_spots -= participants

        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def create_checkout_session(excursion_id, form_data):
        """Créer une session Stripe Checkout"""
        excursion = Excursion.query.get_or_404(excursion_id)
        participants = int(form_data.get("participants", 1))

        if excursion.available_spots is None:
            excursion.available_spots = 0
        if excursion.available_spots < participants:
            raise ValueError("Pas assez de places disponibles")

        metadata = {
            "excursion_id": str(excursion.id),
            "participants": str(participants),
            "name": form_data.get("name", ""),
            "email": form_data.get("email", ""),
            "phone": form_data.get("phone", "")
        }

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {"name": f"Excursion {excursion.title}"},
                    "unit_amount": int(excursion.price * 100),
                },
                "quantity": participants,
            }],
            mode="payment",
            success_url="http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/cancel",
            metadata=metadata
        )
        return session

    @staticmethod
    def create_booking_from_session(metadata):
        """Créer une réservation après paiement Stripe"""
        excursion_id = int(metadata["excursion_id"])
        participants = int(metadata["participants"])
        excursion = Excursion.query.get_or_404(excursion_id)

        if excursion.available_spots is None:
            excursion.available_spots = 0
        if excursion.available_spots < participants:
            raise ValueError("Pas assez de places disponibles")

        booking = BookExcursion(
            excursion_id=excursion.id,
            name=metadata.get("name", ""),
            email=metadata.get("email", ""),
            phone=metadata.get("phone", ""),
            participants=participants
        )
        excursion.available_spots -= participants

        db.session.add(booking)
        db.session.commit()
        return booking

    @staticmethod
    def get_top_excursions(limit=5):
        """Retourne les excursions avec le plus de réservations"""
        excursions = Excursion.query.all()

        # Assurer que max_participants et available_spots ne sont jamais None
        for e in excursions:
            if e.max_participants is None:
                e.max_participants = 0
            if e.available_spots is None:
                e.available_spots = 0

        # Trier par nombre de réservations effectuées
        excursions.sort(key=lambda e: (e.max_participants - e.available_spots), reverse=True)

        return excursions[:limit]

    @staticmethod
    def get_excursions_by_category():
        """Retourne le nombre total d'excursions regroupées par catégorie"""
        from sqlalchemy import func

        results = db.session.query(
            Excursion.category,
            func.count(Excursion.id)
        ).group_by(Excursion.category).all()

        return {category: count for category, count in results}
