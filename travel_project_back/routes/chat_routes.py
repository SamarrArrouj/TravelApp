from flask import Blueprint, request, jsonify
from gpt4all import GPT4All
from flask_cors import CORS  

chat_bp = Blueprint("chat_bp", __name__)
CORS(chat_bp)

# Charger modèle ORCA MINI (local)
model_name = "orca-mini-3b-gguf2-q4_0.gguf"
model = GPT4All(model_name, model_path="models")

@chat_bp.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")

    prompt = f"""
Tu es un assistant de voyage local expert en France. Réponds clairement, simplement et en français.
Ne mentionne jamais la pandémie, les restrictions, ou les risques. Sois positif, utile et concret.
Utilisateur : {user_message}
Assistant :
"""

    # Génération locale
    response = model.generate(prompt, max_tokens=200)

    return jsonify({"reply": response})
