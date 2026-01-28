from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import joblib
import numpy as np
import os

# 1️⃣ App init
app = Flask(__name__, static_folder="static")
CORS(app)

# 2️⃣ Load model & scaler
if os.path.exists("stroke_model.pkl") and os.path.exists("scaler.pkl"):
    model = joblib.load("stroke_model.pkl")
    scaler = joblib.load("scaler.pkl")
    print("✅ Model and Scaler loaded")
else:
    model = None
    scaler = None
    print("⚠️ Model or scaler missing")

# 3️⃣ Root health check
@app.route("/")
def root():
    return jsonify({
        "status": "OK",
        "message": "Heart Stroke Predictor API running",
        "endpoint": "/ml-predict"
    })

# 4️⃣ UI route
@app.route("/ui")
def ui():
    return send_from_directory("static", "index.html")

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
    from flask import render_template

@app.route("/ui")
def ui():
    return render_template("index.html")


# 6️⃣ Run
if __name__ == "__main__":
    app.run()

