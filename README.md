# Heart Stroke Predictor 🌐

This project includes a Flask backend (ML API) and a web UI served from the same app.

## 🚀 Features
- Responsive design
- Clean UI
- Fast loading
- Hosted on Firebase
 - Flask API for ML predictions

## 🛠️ Built With
- HTML
- CSS
- JavaScript
- Machine learning 
- Firebase Hosting
  

## 📂 Project Structure

/public
  ├── index.html
  ├── style.css
  ├── script.js
  ├── trained ml.py
  ├── app.py

## ✅ Option A: Host the Full App on Flask
This repo is ready to deploy as a single Flask service (UI + API).

### Run locally
```bash
python app.py
```
Then open:
- UI: http://127.0.0.1:5000/
- Health check: http://127.0.0.1:5000/api/health
- API: http://127.0.0.1:5000/ml-predict

### Deploy (Render / Railway / Heroku)
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `gunicorn app:app`
## Project Link 
https://heartpredictor-fa5fe.web.app


  
  

