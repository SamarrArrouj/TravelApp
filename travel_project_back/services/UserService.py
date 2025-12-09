from requests import session
from models import db
from models.User import User
from flask_bcrypt import Bcrypt
from flask_mail import Message
from flask import current_app, url_for, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_jwt_extended import decode_token, exceptions as jwt_exceptions
from models.__init__ import mail
from datetime import timedelta, datetime
import random

bcrypt = Bcrypt()


class UserService:
    @staticmethod
    def create_user(name, email, password, confirm_password, role='voyageur'):
        if User.query.filter_by(email=email).first():
            raise ValueError("Cet email est déjà utilisé.")
        if password != confirm_password:
            raise ValueError("Les mots de passe ne correspondent pas.")
        hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
        new_user = User(name=name, email=email, password=hashed_pw, role=role)
        db.session.add(new_user)
        db.session.commit()

        token = create_access_token(identity=str(new_user.id), expires_delta=timedelta(hours=1))
        frontend_url = f"http://localhost:3000/verify/{token}"

        msg = Message(
            'Vérifie ton adresse email',
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.body = f"Bonjour {name},\n\nClique sur ce lien pour vérifier ton compte : {frontend_url}\n\nMerci !"
        mail.send(msg)

        return new_user

    @staticmethod
    def authenticate(email, password):
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            return user
        return None

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

   
    @staticmethod
    def forgot_password():
        try:
            data = request.get_json() or {}
            email = data.get("email")

            if not email:
                return jsonify({"success": False, "message": "Email requis"}), 400

            user = User.query.filter_by(email=email).first()
            if not user:
                return jsonify({"success": False, "message": "Aucun compte trouvé avec cet email"}), 404

        
            token = create_access_token(identity=str(user.id), expires_delta=timedelta(minutes=15))


            frontend_url = f"http://localhost:3000/reset-password/{token}"
            reset_url = frontend_url

            msg = Message(
            "Réinitialisation de votre mot de passe",  
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email]
)

            msg.body = f"Bonjour {user.name},\n\nClique sur ce lien pour réinitialiser ton mot de passe :\n{reset_url}\nCe lien expirera dans 15 minutes."
            mail.send(msg)

            return jsonify({"success": True, "message": "Lien de réinitialisation envoyé par email"}), 200

        except Exception as e:
            return jsonify({"success": False, "message": f"Erreur serveur : {str(e)}"}), 500


    @staticmethod
    def reset_password(token):
        try:
            data = request.get_json() or {}
            new_password = data.get("new_password")
            confirm_password = data.get("confirm_password")

            if not all([new_password, confirm_password]):
                return jsonify({"success": False, "message": "Champs manquants"}), 400

            if new_password != confirm_password:
                return jsonify({"success": False, "message": "Les mots de passe ne correspondent pas"}), 400


            decoded = decode_token(token)
            user_id = int(decoded.get("sub"))

            user = User.query.get(user_id)
            if not user:
                return jsonify({"success": False, "message": "Utilisateur introuvable"}), 404

            hashed_pw = bcrypt.generate_password_hash(new_password).decode("utf-8")
            user.password = hashed_pw
            db.session.commit()

            return jsonify({"success": True, "message": "Mot de passe mis à jour avec succès"}), 200

        except Exception as e:
            return jsonify({"success": False, "message": f"Erreur serveur : {str(e)}"}), 500


    @staticmethod
    def authenticate(email, password):
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            return user
        return None

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(int(user_id))

    @staticmethod
    def get_all_users():
        return User.query.all() or []