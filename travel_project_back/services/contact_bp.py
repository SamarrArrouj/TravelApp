from flask import Blueprint, request, jsonify, current_app
from flask_cors import CORS
from flask_mail import Message
from datetime import datetime
from models import db, mail 
from models.ContactMessage import ContactMessage

contact_bp = Blueprint("contact", __name__)
CORS(contact_bp)

@contact_bp.route("/contact", methods=["POST"])
def contact():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    message_text = data.get("message")

    if not all([name, email, message_text]):
        return jsonify({"error": "Name, email, and message are required"}), 400

    try:
        # Sauvegarde dans la base
        contact_msg = ContactMessage(
            name=name,
            email=email,
            phone=phone,
            message=message_text,
            created_at=datetime.utcnow()
        )
        db.session.add(contact_msg)
        db.session.commit()

        # Envoi de l'email
        msg_email = Message(
            subject=f"New contact message from {name}",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=["Samar.arouj2020@gmail.com"],  
            body=f"Name: {name}\nEmail: {email}\nPhone: {phone}\n\nMessage:\n{message_text}"
        )
        mail.send(msg_email)

        return jsonify({"message": "Your message has been received and sent!"})

    except Exception as e:
        print("Contact Error:", e) 
        return jsonify({"error": str(e)}), 500
