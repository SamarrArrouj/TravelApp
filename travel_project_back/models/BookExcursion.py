from . import db
from datetime import datetime

class BookExcursion(db.Model):
    __tablename__ = "book_excursions"
    id = db.Column(db.Integer, primary_key=True)
    excursion_id = db.Column(db.Integer, db.ForeignKey("excursions.id"), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    participants = db.Column(db.Integer, nullable=False, default=1)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)

    excursion = db.relationship("Excursion", backref=db.backref("bookings", lazy=True))
