from . import db
from .Hotel import Hotel

class HotelReservation(db.Model):
    __tablename__ = "hotel_reservations"

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey("hotels.id"), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    guests = db.Column(db.Integer, default=1)

    hotel_id = db.Column(db.Integer, db.ForeignKey("hotels.id"), nullable=False)
    hotel = db.relationship("Hotel", back_populates="reservations")
