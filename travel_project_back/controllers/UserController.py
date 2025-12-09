from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, decode_token, exceptions
from services.UserService import UserService
from models import db
from models.User import User

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        user = UserService.create_user(
        data["name"],
        data["email"],
        data["password"],
        data["confirm_password"],
        data.get("role", "voyageur")
)


        token = create_access_token(identity=user.id)

        user_info = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "token": token
        }
        return jsonify({"message": "Utilisateur créé", "user": user_info}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Erreur serveur", "details": str(e)}), 500

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = UserService.authenticate(data["email"], data["password"])
    if user:
        # ✅ Utilise int ou str de façon cohérente
        token = create_access_token(identity=str(user.id)) 

        return jsonify({
            "token": token,
            "role": user.role
        }), 200
    return jsonify({"message": "Email ou mot de passe incorrect"}), 401




@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = UserService.get_user_by_id(user_id)
    return jsonify({"id": user.id, "name": user.name, "email": user.email})


@user_bp.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    try:
        decoded = decode_token(token, allow_expired=True)
        user_id = int(decoded.get("sub"))

        user = UserService.get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "Utilisateur introuvable"}), 404

        user.is_verified = True
        db.session.commit()

        return jsonify({"message": "Email vérifié avec succès"}), 200

    except exceptions.NoAuthorizationError:
        return jsonify({"error": "Token manquant"}), 400
    except Exception as e:
        return jsonify({"error": "Lien invalide ou expiré", "details": str(e)}), 400
    


@user_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    return UserService.forgot_password()


@user_bp.route("/reset_password/<token>", methods=["POST"])
def reset_password(token):
    return UserService.reset_password(token)


from flask_jwt_extended.exceptions import NoAuthorizationError


@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_users():
    try:
        current_user_id = get_jwt_identity()
        print("JWT ID:", current_user_id)
        current_user = UserService.get_user_by_id(current_user_id)
        if not current_user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        if current_user.role != "admin":
            return jsonify({"error": "Accès interdit"}), 403

        users = UserService.get_all_users()
        users_list = [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat()
            } 
            for u in users
        ]
        return jsonify(users_list), 200

    except NoAuthorizationError:
        return jsonify({"error": "Token invalide ou manquant"}), 422
    except Exception as e:
        return jsonify({"error": "Erreur serveur", "details": str(e)}), 500
    

   
@user_bp.route("/block/<int:user_id>", methods=["PATCH"])
@jwt_required()
def block_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404

    user.is_blocked = not user.is_blocked
    db.session.commit()
    return jsonify({"message": f"Utilisateur {'bloqué' if user.is_blocked else 'débloqué'}"}), 200



@user_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user = UserService.get_user_by_id(get_jwt_identity())
    if current_user.role != "admin":
        return jsonify({"error": "Accès interdit"}), 403
    user = UserService.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "Utilisateur non trouvé"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Utilisateur supprimé"})
