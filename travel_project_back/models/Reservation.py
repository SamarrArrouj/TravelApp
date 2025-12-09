from . import db

class Reservation(db.Model):
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    flight_id = db.Column(db.Integer, db.ForeignKey("flights.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    passengers = db.Column(db.Integer, default=1)

    flight = db.relationship("Flight", back_populates="reservations")

    def __repr__(self):
        return f"<Reservation {self.id} for Flight {self.flight_id}>"
