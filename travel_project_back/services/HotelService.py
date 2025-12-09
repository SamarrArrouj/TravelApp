# services/HotelService.py
import os
import random
import json
import requests
from concurrent.futures import ThreadPoolExecutor
from models import db
from models.Hotel import Hotel
from dotenv import load_dotenv
from amadeus import Client, ResponseError
import stripe
from datetime import datetime
from models.HotelReservation import HotelReservation

load_dotenv()

amadeus = Client(
    client_id=os.getenv("AMADEUS_CLIENT_ID"),
    client_secret=os.getenv("AMADEUS_CLIENT_SECRET")
)

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

CURRENCY_MAP = {
    "TN": "TND",
    "FR": "€",
    "US": "$",
    "TR": "₺"
}

class HotelService:

    # --- Méthodes d'images (inchangées) ---
    @staticmethod
    def get_hotel_gallery_images(hotel_name, city):
        try:
            query = f"{hotel_name} {city} hotel"
            url = "https://api.unsplash.com/search/photos"
            params = {
                "query": query,
                "client_id": UNSPLASH_ACCESS_KEY,
                "orientation": "landscape",
                "per_page": 10
            }
            response = requests.get(url, params=params, timeout=5)
            data = response.json()
            images = [photo["urls"]["regular"] for photo in data.get("results", [])]
            if not images:
                images = [f"https://source.unsplash.com/600x400/?{city}+hotel"]
            return images
        except Exception as e:
            print(f"⚠️ Erreur Unsplash (galerie) pour {hotel_name}: {str(e)}")
            return [f"https://source.unsplash.com/600x400/?{city}+hotel"]

    @staticmethod
    def get_unsplash_image(query):
        try:
            url = "https://api.unsplash.com/search/photos"
            params = {
                "query": query,
                "client_id": UNSPLASH_ACCESS_KEY,
                "orientation": "landscape",
                "per_page": 1
            }
            response = requests.get(url, params=params, timeout=5)
            data = response.json()
            if data.get("results"):
                return data["results"][0]["urls"]["regular"]
            return f"https://source.unsplash.com/600x400/?{query.replace(' ', '+')}"
        except Exception as e:
            print(f"⚠️ Erreur Unsplash principale pour {query}: {str(e)}")
            return f"https://source.unsplash.com/600x400/?{query.replace(' ', '+')}"

    # --- Recherche hôtels ---
    @staticmethod
    def search_hotels(city_code):
        try:
            response = amadeus.reference_data.locations.hotels.by_city.get(cityCode=city_code)
            hotels_data = []
            for item in response.data:
                address = item.get("address", {})
                name = item.get("name", "").strip()
                city = address.get("cityName", "").strip()
                country = address.get("countryCode", "").strip()
                address_line = ", ".join(address.get("lines", [])) if address.get("lines") else ""

                if not name or not city or not country:
                    continue

                existing = Hotel.query.filter(
                    Hotel.name.ilike(f"%{name}%"),
                    Hotel.city.ilike(f"%{city}%"),
                    Hotel.country.ilike(f"%{country}%")
                ).first()

                hotels_data.append({
                    "name": name,
                    "city": city,
                    "country": country,
                    "address": address_line,
                    "existing": existing,
                    "image_url": existing.image_url if existing else None,
                    "gallery_images": existing.gallery_images if existing and existing.gallery_images else []
                })

            # Remplir les images Unsplash avec ThreadPool
            def fetch_images(hotel):
                if not hotel["image_url"]:
                    hotel["image_url"] = HotelService.get_unsplash_image(f"{hotel['name']} {hotel['city']} hotel")
                if not hotel["gallery_images"]:
                    hotel["gallery_images"] = HotelService.get_hotel_gallery_images(hotel["name"], hotel["city"])
                return hotel

            with ThreadPoolExecutor(max_workers=8) as executor:
                hotels_data = [f.result() for f in [executor.submit(fetch_images, h) for h in hotels_data]]

            new_hotels = []
            for h in hotels_data:
                description = f"{h['name']} est un hôtel situé à {h['city']}, {h['country']}."
                price_value = random.randint(50, 500)
                currency = CURRENCY_MAP.get(h['country'].upper(), "$")
                price_str = f"{price_value} {currency}"

                if not h["existing"]:
                    new_hotel = Hotel(
                        name=h["name"],
                        city=h["city"],
                        country=h["country"],
                        address=h["address"],
                        image_url=h["image_url"],
                        price_per_night=price_str,
                        description=description,
                        gallery_images=json.dumps(h["gallery_images"])
                    )
                    db.session.add(new_hotel)
                    new_hotels.append(new_hotel)
                else:
                    new_hotels.append(h["existing"])

            db.session.commit()

            return [{
                "id": h.id,
                "name": h.name,
                "city": h.city,
                "country": h.country,
                "address": h.address,
                "price_per_night": h.price_per_night,
                "image_url": h.image_url,
                "description": h.description,
                "gallery_images": getattr(h, 'get_gallery_images', lambda: [])()
            } for h in new_hotels]

        except Exception as e:
            raise Exception(f"Erreur recherche hôtels: {str(e)}")

    # --- Calcul prix ---
    @staticmethod
    def calculate_price(price_str, nights, guests):
        try:
            price_value = float(price_str.split()[0])
            return price_value * nights * guests
        except:
            return 0

    # --- Créer réservation après paiement ---
    @staticmethod
    def create_reservation(hotel_id, name, email, phone, check_in, check_out, guests=1):
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            raise Exception("Hôtel introuvable")
        check_in_date = datetime.strptime(check_in, "%Y-%m-%d")
        check_out_date = datetime.strptime(check_out, "%Y-%m-%d")
        nights = (check_out_date - check_in_date).days
        total_price = HotelService.calculate_price(hotel.price_per_night, nights, guests)

        reservation = HotelReservation(
            hotel_id=hotel_id,
            name=name,
            email=email,
            phone=phone,
            check_in=check_in_date,
            check_out=check_out_date,
            guests=guests,
            total_price=total_price
        )
        db.session.add(reservation)
        db.session.commit()
        return reservation

    # --- Créer session Stripe Checkout avec metadata ---
    @staticmethod
    def create_checkout_session(hotel_id, check_in, check_out, guests=1, name=None, email=None, phone=None):
        hotel = Hotel.query.get(hotel_id)
        if not hotel:
            raise Exception("Hôtel introuvable")

        check_in_date = datetime.strptime(check_in, "%Y-%m-%d")
        check_out_date = datetime.strptime(check_out, "%Y-%m-%d")
        nights = (check_out_date - check_in_date).days
        amount = int(HotelService.calculate_price(hotel.price_per_night, nights, guests) * 100)

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": f"Séjour {hotel.name} ({check_in} → {check_out})",
                    },
                    "unit_amount": amount,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url="http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:3000/cancel",
            metadata={
                "hotel_id": str(hotel_id),
                "check_in": check_in,
                "check_out": check_out,
                "guests": str(guests),
                "name": name or "",
                "email": email or "",
                "phone": phone or ""
            }
        )
        return session

    @staticmethod
    def save_reservation_from_session(session_id):
        """Récupère la session Stripe et crée la réservation"""
        session = stripe.checkout.Session.retrieve(session_id)

        hotel_id = int(session.metadata.get("hotel_id"))
        check_in = session.metadata.get("check_in")
        check_out = session.metadata.get("check_out")
        guests = int(session.metadata.get("guests"))
        name = session.metadata.get("name")
        email = session.metadata.get("email")
        phone = session.metadata.get("phone")

        # Vérifier si réservation existe déjà pour éviter doublons
        existing = HotelReservation.query.filter_by(
            hotel_id=hotel_id,
            email=email,
            check_in=datetime.strptime(check_in, "%Y-%m-%d"),
            check_out=datetime.strptime(check_out, "%Y-%m-%d")
        ).first()
        if existing:
            return existing

        return HotelService.create_reservation(
            hotel_id=hotel_id,
            name=name,
            email=email,
            phone=phone,
            check_in=check_in,
            check_out=check_out,
            guests=guests
        )
    @staticmethod
    def count_hotels():
        """Retourne le nombre total d'hôtels"""
        return Hotel.query.count()
    
    @staticmethod
    def get_hotel_by_id(hotel_id):
        return Hotel.query.get(hotel_id)

    @staticmethod
    def delete_hotel(hotel):
        db.session.delete(hotel)
        db.session.commit()

    @staticmethod
    def update_hotel(hotel, data):
        hotel.name = data.get("name", hotel.name)
        hotel.city = data.get("city", hotel.city)
        hotel.country = data.get("country", hotel.country)
        hotel.address = data.get("address", hotel.address)
        hotel.price_per_night = data.get("price_per_night", hotel.price_per_night)
        db.session.commit()