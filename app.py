from flask import Flask, request, jsonify, render_template, send_from_directory, abort
from flask_cors import CORS
import joblib
import numpy as np
import os

# 1️⃣ App init
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

ALLOWED_PAGES = {
    "html": "html.html",
    "dashboard": "dashboard.html",
    "analytics": "analytics.html",
    "patient": "patient.html",
    "result": "result.html",
}

ALLOWED_ROOT_FILES = {
    "script.js",
    "dashboard.js",
    "analytics.js",
    "history.js",
    "css.css",
}

# 2️⃣ Load model & scaler
if os.path.exists("stroke_model.pkl") and os.path.exists("scaler.pkl"):
    model = joblib.load("stroke_model.pkl")
    scaler = joblib.load("scaler.pkl")
    print("✅ Model and Scaler loaded")
else:
    model = None
    scaler = None
    print("⚠️ Model or scaler missing")

# 3️⃣ Root UI
@app.route("/")
def root():
    return render_template("index.html")


# 4️⃣ Health check
@app.route("/api/health")
def health():
    return jsonify({
        "status": "OK",
        "message": "Heart Stroke Predictor API running",
        "endpoint": "/ml-predict"
    })


# 4️⃣ HTML pages (served from templates)
@app.route("/<page>.html")
def html_pages(page):
    template_name = ALLOWED_PAGES.get(page)
    if template_name is None:
        abort(404)
    return render_template(template_name)


@app.route("/assets/<path:filename>")
def assets_files(filename):
    return send_from_directory(os.path.join(app.root_path, "assets"), filename)


# 4️⃣ Root-level static files (JS/CSS)
@app.route("/<path:filename>")
def root_files(filename):
    if filename in ALLOWED_ROOT_FILES:
        return send_from_directory(app.root_path, filename)
    abort(404)



# 5️⃣ Prediction API
@app.route("/ml-predict", methods=["POST"])
def predict():
    if model is None or scaler is None:
        return jsonify({"error": "Model not trained"}), 500

    try:
        data = request.json

        raw_features = np.array([[  
            float(data.get("age", 0)),
            float(data.get("sex", 0)),
            float(data.get("chestPain", 0)),
            float(data.get("sugar", 0)),
            float(data.get("angina", 0)),
            float(data.get("oldPeak", 0)),
            float(data.get("stSlope", 0))
        ]])

        scaled = scaler.transform(raw_features)
        probability = model.predict_proba(scaled)[0][1]

        return jsonify({"probability": float(probability)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# 6️⃣ Run
if __name__ == "__main__":
    app.run()
