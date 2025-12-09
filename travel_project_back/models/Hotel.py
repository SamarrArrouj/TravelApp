from . import db
import json

class Hotel(db.Model):
    __tablename__ = "hotels"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    country = db.Column(db.String(10), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(300), nullable=True)
    price_per_night = db.Column(db.String(50), nullable=True)
    gallery_images = db.Column(db.JSON, nullable=True)

    def get_gallery_images(self):
        """Retourne toujours une liste Python"""
        if self.gallery_images:
            return self.gallery_images if isinstance(self.gallery_images, list) else json.loads(self.gallery_images)
        # fallback si vide
        return [self.image_url] if self.image_url else []

    reservations = db.relationship("HotelReservation", back_populates="hotel", cascade="all, delete-orphan")
