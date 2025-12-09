import os
import re
import traceback
from flask import Blueprint, request, jsonify
from gpt4all import GPT4All

itinerary_bp = Blueprint("itinerary_bp", __name__)

# --- Chargement du modèle ---
model_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
)

if not os.path.exists(model_path):
    raise FileNotFoundError(
        f"❌ Modèle non trouvé : {model_path}\n"
        "👉 Télécharge : https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    )

print("⏳ Chargement du modèle TinyLlama...")
try:
    model = GPT4All(
        model_name="tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
        model_path=os.path.dirname(model_path),
        allow_download=False,
        verbose=False,
        n_threads=2,
        n_ctx=1024
    )
    print("✅ Modèle chargé !")
except Exception as e:
    print(f"❌ Échec du chargement : {e}")
    raise


def generate_prompt(destination: str, days: int, budget: float) -> str:
    # Exemple très structuré avec "Day X"
    example = (
        "Day 1 : Matin - Tour Eiffel (15€), Midi - Bistro (12€), Après-midi - Louvre (17€), Soir - Seine (0€)\n"
        "Day 2 : Matin - Montmartre (0€), Midi - Crêperie (10€), Après-midi - Musée d'Orsay (12€), Soir - Dîner (18€)"
    )

    return f"""Tu es un générateur d'itinéraires strict. RÈGLES ABSOLUES :
- Tu ne dois écrire QUE des lignes commençant par "Day X : ".
- X doit aller de 1 à {days}, dans l'ordre, sans sauter.
- Chaque jour : Matin, Midi, Après-midi, Soir + activité et prix (ex: "Matin - Nom (prix€)").
- PAS de liste numérotée (pas de "1.", "2.", etc.).
- PAS d'introduction ("Bienvenue", "Voici", etc.).
- PAS de fin ("Bonne visite", etc.).
- Ne dépasse pas {budget}€ au total.
- Écris uniquement en français.

Exemple pour 2 jours :
{example}

Génère maintenant pour :
Destination : {destination}, Jours : {days}, Budget : {budget}€
Résultat :"""


def extract_itinerary(text: str, expected_days: int) -> str:
    """Extrait les lignes 'Day X :' et les trie."""
    day_lines = {}
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        match = re.match(r"^[Dd]ay\s+(\d+)\s*:(.*)", line)
        if match:
            day_num = int(match.group(1))
            content = match.group(2).strip()
            if 1 <= day_num <= expected_days and content:
                day_lines[day_num] = content

    lines = []
    for day in range(1, expected_days + 1):
        if day in day_lines:
            lines.append(f"Day {day} : {day_lines[day]}")
        else:
            lines.append("")
    return "\n".join(lines)


def is_response_valid(text: str) -> bool:
    """Vérifie si la réponse est valide (pas de phrases parasites)."""
    text_lower = text.lower()
    bad_phrases = [
        "bienvenue", "voici", "liste de", "découvrez", "itinéraire pour", 
        "vous propose", "bonne visite", "bon voyage", "1.", "2.", "3.", "4.", 
        "5.", "6.", "7.", "8.", "9.", "10."
    ]
    if any(phrase in text_lower for phrase in bad_phrases):
        return False
    if not re.search(r"[Dd]ay\s+\d+\s*:", text):
        return False
    return True


def generate_fallback_itinerary(destination: str, days: int, budget: float) -> str:
    """Génère un itinéraire personnalisé si possible, sinon générique."""
    DESTINATION_ACTIVITIES = {
        "paris": [
            ("Matin - Tour Eiffel (15€)", "Midi - Bistro (12€)", "Après-midi - Louvre (17€)", "Soir - Promenade Seine (0€)"),
            ("Matin - Montmartre (0€)", "Midi - Crêperie (10€)", "Après-midi - Musée d'Orsay (12€)", "Soir - Dîner (18€)"),
            ("Matin - Marais (0€)", "Midi - Sandwicherie (8€)", "Après-midi - Centre Pompidou (14€)", "Soir - Spectacle (20€)")
        ],
        "istanbul": [
            ("Matin - Hagia Sophia (7€)", "Midi - Restaurant turc (10€)", "Après-midi - Topkapi Palace (13€)", "Soir - Grand Bazaar (0€)"),
            ("Matin - Mosquée Bleue (0€)", "Midi - Kebab (8€)", "Après-midi - Galata Tower (8€)", "Soir - Croisière Bosphore (15€)"),
            ("Matin - Basilique Citerne (10€)", "Midi - Pâtisserie turque (6€)", "Après-midi - Parc Gülhane (0€)", "Soir - Dîner en terrasse (18€)")
        ],
        "rome": [
            ("Matin - Colisée (16€)", "Midi - Trattoria (10€)", "Après-midi - Forum Romain (12€)", "Soir - Gelato (5€)"),
            ("Matin - Vatican (20€)", "Midi - Pizza (9€)", "Après-midi - Villa Borghese (0€)", "Soir - Dîner (18€)"),
            ("Matin - Panthéon (0€)", "Midi - Pizzeria (8€)", "Après-midi - Trevi (0€)", "Soir - Spectacle (15€)")
        ],
        "lisbonne": [
            ("Matin - Belém Tower (6€)", "Midi - Pasteis de Belém (3€)", "Après-midi - Monastère des Jerónimos (10€)", "Soir - Tramway + Fado (12€)"),
            ("Matin - Alfama (0€)", "Midi - Tascas (10€)", "Après-midi - Castel São Jorge (10€)", "Soir - Miradouro (0€)"),
            ("Matin - Oceanário (18€)", "Midi - Marché (8€)", "Après-midi - Parc Eduardo VII (0€)", "Soir - Dîner (15€)")
        ],
        "barcelone": [
            ("Matin - Sagrada Família (20€)", "Midi - Tapas (12€)", "Après-midi - Parc Güell (10€)", "Soir - Ramblas (0€)"),
            ("Matin - Gothic Quarter (0€)", "Midi - Bodega (10€)", "Après-midi - La Pedrera (22€)", "Soir - Plage (0€)"),
            ("Matin - Marché La Boqueria (0€)", "Midi - Paella (14€)", "Après-midi - Musée Picasso (12€)", "Soir - Flamenco (20€)")
        ],
        "londres": [
            ("Matin - British Museum (0€)", "Midi - Pub anglais (12€)", "Après-midi - Tower Bridge (11€)", "Soir - London Eye (25€)"),
            ("Matin - Buckingham (0€)", "Midi - Fish & Chips (10€)", "Après-midi - Tate Modern (0€)", "Soir - West End (35€)"),
            ("Matin - Camden Market (0€)", "Midi - Street Food (9€)", "Après-midi - Hyde Park (0€)", "Soir - Dîner (18€)")
        ]
    }

    if destination.lower() in DESTINATION_ACTIVITIES:
        patterns = DESTINATION_ACTIVITIES[destination.lower()]
    else:
        # Modèle générique si destination inconnue
        patterns = [
            ("Matin - Centre historique (0€)", "Midi - Restaurant local (10€)", "Après-midi - Musée (12€)", "Soir - Promenade (5€)"),
            ("Matin - Marché (0€)", "Midi - Bistro (12€)", "Après-midi - Parc (0€)", "Soir - Dîner (15€)")
        ]

    lines = []
    for i in range(1, days + 1):
        pattern = patterns[(i - 1) % len(patterns)]
        day_line = f"Day {i} : " + ", ".join(pattern)
        lines.append(day_line)
    return "\n".join(lines)


def calculate_total_cost(itinerary: str) -> int:
    """Extrait tous les prix au format (X€) et retourne la somme."""
    prices = re.findall(r'\((\d+)€\)', itinerary)
    return sum(int(p) for p in prices)


@itinerary_bp.route("/generate-itinerary", methods=["POST"])
def generate_itinerary():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Aucun JSON reçu"}), 400

        destination = str(data.get("destination", "")).strip()
        days = data.get("days")
        budget = data.get("budget")

        if not destination or not days or not budget:
            return jsonify({"error": "Veuillez fournir 'destination', 'days' et 'budget'"}), 400

        try:
            days = int(days)
            budget = float(budget)
        except (ValueError, TypeError):
            return jsonify({"error": "'days' doit être un entier et 'budget' un nombre."}), 400

        if days < 1 or budget <= 0:
            return jsonify({"error": "Jours ≥ 1 et budget > 0."}), 400

        # --- Génération avec le modèle ---
        prompt = generate_prompt(destination, days, budget)
        print(f"🧠 Génération pour {destination}, {days} jours, {budget}€...")

        raw_response = model.generate(
            prompt,
            max_tokens=min(900, 200 + days * 160),
            temp=0.1,
            top_p=0.7,
            repeat_penalty=1.3,
            n_batch=256
        ).strip()

        # Vérifier validité
        if not is_response_valid(raw_response):
            print("⚠️ Réponse non valide → utilisation du mode personnalisé.")
            clean_itin = generate_fallback_itinerary(destination, days, budget)
        else:
            clean_itin = extract_itinerary(raw_response, days)
            filled = sum(1 for line in clean_itin.splitlines() if line.strip() and "Day" in line and not line.endswith(" : "))
            if filled == 0:
                clean_itin = generate_fallback_itinerary(destination, days, budget)

        # 🔢 Calcul budgétaire
        total_cost = calculate_total_cost(clean_itin)
        status = "dans le budget" if total_cost <= budget else "dépasse le budget"

        return jsonify({
            "itinerary": clean_itin,
            "estimated_total_cost": total_cost,
            "budget_provided": budget,
            "status": status
        })

    except Exception as e:
        print("\n" + "="*60)
        print("💥 ERREUR CRITIQUE :")
        print(f"{type(e).__name__}: {e}")
        traceback.print_exc()
        print("="*60 + "\n")
        return jsonify({"error": "Impossible de générer l'itinéraire. Veuillez réessayer."}), 500