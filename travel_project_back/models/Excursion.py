from . import db

class Excursion(db.Model):
    __tablename__ = "excursions"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    type = db.Column(db.String(50))
    description = db.Column(db.Text)
    city = db.Column(db.String(100))
    address = db.Column(db.String(200))
    date = db.Column(db.Date)
    duration = db.Column(db.Integer) 
    price = db.Column(db.Float)
    max_participants = db.Column(db.Integer)
    available_spots = db.Column(db.Integer)
    image_url = db.Column(db.String(250))
    rating = db.Column(db.Float, default=0)
    category = db.Column(db.String(50), default="adventure")  # adventure / cultural / relaxation





    