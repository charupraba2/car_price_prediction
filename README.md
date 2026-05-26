# AutoValue AI — Car Price Prediction

Modern FastAPI web app for predicting used car prices with a portfolio-ready UI.

## Features
- Glassmorphism landing page
- Car brand dropdown with dynamic preview
- Year, fuel type, and km driven inputs
- Predict button with loading animation
- Stylish prediction card and confidence range
- Dark mode toggle
- Responsive layout
- Chart.js analytics for price history
- Local storage prediction history
- Backend model loading via `joblib`
- CORS-enabled FastAPI API endpoint

## Run locally
1. Activate the virtual environment:
   ```powershell
   d:/car_price_prediction/venv/Scripts/Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Start the app:
   ```powershell
   uvicorn app:app --reload
   ```
4. Open `http://127.0.0.1:8000`

## Project structure
- `app.py` — FastAPI backend and prediction API
- `templates/landing.html` — web app UI
- `static/style.css` — glassmorphism styling
- `static/app.js` — prediction form, local history, and Chart.js logic
- `model/car_price_model.pkl` — trained model file
