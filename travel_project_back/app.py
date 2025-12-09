from flask import Flask
from config import Config
from models import db, mail
from services.UserService import bcrypt
from flask_jwt_extended import JWTManager
from controllers.UserController import user_bp
from controllers.FlightController import flight_bp
from controllers.HotelController import hotel_bp
from controllers.ExcursionController import excursion_bp
from controllers.statsController import stats_bp
from models.User import User
from datetime import timedelta
from flask_cors import CORS
import os
from services.contact_bp import contact_bp
from routes.chat_routes import chat_bp




from routes.ai_routes import itinerary_bp 

from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(
    app,
    origins=["http://localhost:3000"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True
)
app.config.from_object(Config)
app.config["JWT_SECRET_KEY"] = "super-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

db.init_app(app)
mail.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(flight_bp)
app.register_blueprint(hotel_bp)
app.register_blueprint(excursion_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(contact_bp)
app.register_blueprint(itinerary_bp, url_prefix="/api/itinerary")
app.register_blueprint(chat_bp)

if __name__ == "__main__":
    app.run(debug=True)
