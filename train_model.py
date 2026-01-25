import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.utils import resample
import joblib

# 1. Load the base dataset
url = "https://storage.googleapis.com/download.tensorflow.org/data/heart.csv"
df = pd.read_csv(url)

# 2. Data Augmentation: Simulate 2,000 patients based on real patterns
# This creates 2000 rows by adding slight random noise to existing real data
df_large = resample(df, n_samples=2000, replace=True, random_state=42)
noise = np.random.normal(0, 0.01, size=(2000, len(df.columns)))
# Only add noise to numeric columns to maintain medical logic
numeric_cols = ['age', 'oldpeak']
for col in numeric_cols:
    df_large[col] += np.random.normal(0, 1, 2000)

# 3. Define Features and Target
X = df_large[['age', 'sex', 'cp', 'fbs', 'exang', 'oldpeak', 'slope']]
y = df_large['target']

# 4. Scale the data (Crucial for consistent percentages)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 5. Use Random Forest for more nuanced probabilities (better than Logistic Regression)
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_scaled, y)

# 6. Save the new Model and Scaler
joblib.dump(model, "stroke_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print(f"✅ Model trained on {len(df_large)} patient profiles and saved!")