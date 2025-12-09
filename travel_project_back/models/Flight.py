from . import db

class Flight(db.Model):
    __tablename__ = "flights"

    id = db.Column(db.Integer, primary_key=True)
    airline = db.Column(db.String(50), nullable=False)
    departure_city = db.Column(db.String(10), nullable=False)
    arrival_city = db.Column(db.String(10), nullable=False)
    departure_time = db.Column(db.String(50), nullable=False)
    arrival_time = db.Column(db.String(50), nullable=False)
    price = db.Column(db.String(20), nullable=False)

    reservations = db.relationship("Reservation", back_populates="flight")

    def __repr__(self):
        return f"<Flight {self.airline} {self.departure_city}->{self.arrival_city}>"
