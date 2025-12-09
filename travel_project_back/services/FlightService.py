from amadeus import Client, ResponseError
from models import db
from models.Flight import Flight
from models.Reservation import Reservation
import os
from dotenv import load_dotenv
import stripe
from datetime import datetime

load_dotenv()

amadeus = Client(
    client_id=os.getenv("AMADEUS_CLIENT_ID"),
    client_secret=os.getenv("AMADEUS_CLIENT_SECRET")
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class FlightService:

    @staticmethod
    def search_flights(origin, destination, date, adults=1, time=None):
        """
        Recherche les vols selon l'origine, destination, date et heure (optionnelle).
        Gère les erreurs Amadeus et retourne toujours une liste (vide si aucun vol).
        """
        flights = []

        try:
            response = amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=date,
                adults=adults,
                currencyCode="EUR"
            )

            print(f"⚡ Amadeus a retourné {len(response.data)} offres")

            for offer in response.data:

                try:
                    segments = offer["itineraries"][0]["segments"]
                    # Tu peux commenter cette ligne si tu veux inclure les vols avec escale
                    if len(segments) > 1:
                        continue

                    segment = segments[0]
                    departure_time = segment["departure"]["at"]
                    arrival_time = segment["arrival"]["at"]

                    flight_date = departure_time[:10]
                    if date and flight_date != date:
                        continue

                    if time:
                        flight_hour = int(departure_time[11:13])
                        user_hour = int(time[:2])
                        if abs(flight_hour - user_hour) > 1:
                            continue

                    flight_data = {
                        "airline": segment["carrierCode"],
                        "departure_city": segment["departure"]["iataCode"],
                        "arrival_city": segment["arrival"]["iataCode"],
                        "departure_time": departure_time,
                        "arrival_time": arrival_time,
                        "price": offer["price"]["total"]
                    }

                    # Vérifie si le vol existe déjà
                    existing_flight = Flight.query.filter_by(
                        airline=flight_data["airline"],
                        departure_city=flight_data["departure_city"],
                        arrival_city=flight_data["arrival_city"],
                        departure_time=flight_data["departure_time"]
                    ).first()

                    if not existing_flight:
                        new_flight = Flight(**flight_data)
                        db.session.add(new_flight)
                        db.session.commit()
                        flight_data["id"] = new_flight.id
                    else:
                        flight_data["id"] = existing_flight.id

                    flights.append(flight_data)

                except Exception as e_seg:
                    # Continue même si un segment plante
                    print(f"⚠️ Erreur traitement segment: {e_seg}")
                    continue

            return flights

        except ResponseError as e:
            # Amadeus a retourné une erreur, on logge mais on ne plante pas
            print("⚠️ Erreur Amadeus:", e.response.body)
            return []

        except Exception as e:
            # Autres erreurs
            print("⚠️ Erreur recherche vols:", str(e))
            return []

  
    @staticmethod
    def create_reservation(flight_id, name, email, phone, passengers=1):
        flight = Flight.query.get(flight_id)
        if not flight:
            raise Exception("Vol introuvable")

        new_res = Reservation(
            flight_id=flight_id,
            name=name,
            email=email,
            phone=phone,
            passengers=passengers
        )

        db.session.add(new_res)
        db.session.commit()
        return new_res

   
    @staticmethod
    def create_payment_intent(flight_id, passengers=1):
        """ Crée un PaymentIntent Stripe pour le vol sélectionné """
        flight = Flight.query.get(flight_id)
        if not flight:
            raise Exception("Vol introuvable")

        amount = int(float(flight.price) * 100 * passengers)  
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="eur",
            payment_method_types=["card"],
            metadata={
                "flight_id": str(flight_id),
                "passengers": str(passengers)
            }
        )
        return intent

    @staticmethod
    def create_checkout_session(flight_id, passengers=1):
        """ Crée une session Stripe Checkout """
        flight = Flight.query.get(flight_id)
        if not flight:
            raise Exception("Vol introuvable")

        amount = int(float(flight.price) * 100 * passengers) 

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"Vol {flight.departure_city} → {flight.arrival_city}",
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url="http://localhost:3000/success",
                cancel_url="http://localhost:3000/cancel",
            )
            return session
        except Exception as e:
            raise Exception(f"Erreur création session Stripe: {str(e)}")
    @staticmethod
    def count_flights():
        return Flight.query.count()