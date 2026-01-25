from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load both the model and the scaler created by train_model.py
if os.path.exists("stroke_model.pkl") and os.path.exists("scaler.pkl"):
    model = joblib.load("stroke_model.pkl")
    scaler = joblib.load("scaler.pkl")
    print("✅ Model and Scaler loaded")
else:
    model = None
    scaler = None
    print("⚠️ Error: .pkl files missing. Run train_model.py first.")

@app.route('/ml-predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({"error": "Model not trained"}), 500
    try:
        data = request.json
        # The order MUST match the training script: age, sex, cp, fbs, exang, oldpeak, slope
        raw_features = np.array([[
            float(data.get('age', 0)),
            float(data.get('sex', 0)),
            float(data.get('chestPain', 0)),
            float(data.get('sugar', 0)),
            float(data.get('angina', 0)),
            float(data.get('oldPeak', 0)),
            float(data.get('stSlope', 0))
        ]])
        
        # 1. Scale input to match training distribution
        scaled_features = scaler.transform(raw_features)
        # 2. Get true probability
        probability = model.predict_proba(scaled_features)[0][1]

        return jsonify({"probability": float(probability)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)