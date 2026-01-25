from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # CORS fix: Isse browser request block nahi karega

# --- 1. Model aur Scaler Load Karein ---
MODEL_PATH = "stroke_model.pkl"
SCALER_PATH = "scaler.pkl"

if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Model and Scaler loaded successfully")
else:
    model = None
    scaler = None
    print("⚠️ Error: .pkl files missing. Please run your training script first.")

@app.route('/ml-predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({"error": "Model files missing on server"}), 500
    
    try:
        data = request.json
        
        # --- 2. Data Alignment (JS se match karne ke liye) ---
        # JS se 'sugar' aa raha hai, isliye data.get('sugar') use kiya hai
        # Mapping values to float/int to avoid type errors
        raw_features = np.array([[
            float(data.get('age', 0)),
            float(data.get('sex', 0)),
            float(data.get('chestPain', 0)),
            float(data.get('sugar', 0)),
            float(data.get('angina', 0)),
            float(data.get('oldPeak', 0)),
            float(data.get('stSlope', 0))
        ]])
        
        # --- 3. Scaling aur Prediction ---
        # Scaler use karna zaroori hai warna percentage galat aayegi
        scaled_features = scaler.transform(raw_features)
        
        # Probability nikalna (0 to 1)
        probability = model.predict_proba(scaled_features)[0][1]

        # --- 4. JSON Response ---
        # Key ka naam 'probability' rakha hai kyunki JS wahi dhoond raha hai
        return jsonify({
            "probability": float(probability),
            "status": "success"
        })

    except Exception as e:
        print(f"❌ Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # Port 5000 par run karein
    app.run(debug=True, port=5000)