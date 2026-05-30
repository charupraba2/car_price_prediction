from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field, validator

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "car_price_model.pkl"

app = FastAPI(title="AutoValue AI | Car Price Prediction")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

try:
    model = joblib.load(str(MODEL_PATH))
except Exception as error:
    raise RuntimeError(f"Could not load model file at {MODEL_PATH}: {error}")

BRAND_IMAGES = {
    "Maruti Suzuki": "https://images.unsplash.com/photo-1471640122410-60a541b12d40?auto=format&fit=crop&w=1400&q=80",
    "Hyundai": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
    "Honda": "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
    "Tata": "https://images.unsplash.com/photo-1517363898872-73786d7e4ee4?auto=format&fit=crop&w=1400&q=80",
    "Mahindra": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    "Toyota": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
    "Ford": "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80",
    "Mercedes": "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80",
    "BMW": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    "Audi": "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=80",
}

DEFAULT_BRAND_IMAGE = "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=80"

BRAND_MAPPING = {
    "maruti suzuki": "maruti",
    "maruti": "maruti",
    "hyundai": "hyundai",
    "honda": "honda",
    "tata": "tata",
    "mahindra": "mahindra",
    "toyota": "toyota",
    "ford": "ford",
    "mercedes": "mercedes-benz",
    "mercedes-benz": "mercedes-benz",
    "bmw": "bmw",
    "audi": "audi",
}

BRAND_FEATURES = [
    "brand_audi",
    "brand_bmw",
    "brand_chevrolet",
    "brand_daewoo",
    "brand_datsun",
    "brand_fiat",
    "brand_force",
    "brand_ford",
    "brand_honda",
    "brand_hyundai",
    "brand_isuzu",
    "brand_jaguar",
    "brand_jeep",
    "brand_kia",
    "brand_land",
    "brand_mahindra",
    "brand_maruti",
    "brand_mercedes-benz",
    "brand_mg",
    "brand_mitsubishi",
    "brand_nissan",
    "brand_opelcorsa",
    "brand_renault",
    "brand_skoda",
    "brand_tata",
    "brand_toyota",
    "brand_volkswagen",
    "brand_volvo",
]

MODEL_FEATURES = [
    "Car_Age",
    "kms_driven_log",
    "fuel_Diesel",
    "fuel_Electric",
    "fuel_LPG",
    "fuel_Petrol",
    "seller_type_Individual",
    "seller_type_Trustmark Dealer",
    "transmission_Manual",
    "owner_Fourth & Above Owner",
    "owner_Second Owner",
    "owner_Test Drive Car",
    "owner_Third Owner",
    *BRAND_FEATURES,
]

class PredictionPayload(BaseModel):
    brand: str = Field(..., example="Toyota")
    year: int = Field(..., ge=1990, le=datetime.now().year)
    fuel_type: str = Field(..., example="Petrol")
    kms_driven: int = Field(..., ge=0, le=1500000)

    @validator("year")
    def validate_year(cls, value):
        current_year = datetime.now().year
        if value > current_year:
            raise ValueError("Year cannot be in the future.")
        return value


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(request, "landing.html", {})


@app.get("/predict-ui", response_class=HTMLResponse)
async def predict_ui(request: Request):
    return templates.TemplateResponse(request, "predict.html", {})


@app.get("/history-ui", response_class=HTMLResponse)
async def history_ui(request: Request):
    return templates.TemplateResponse(request, "history.html", {})


@app.post("/api/predict")
async def predict(payload: PredictionPayload):
    try:
        current_year = datetime.now().year
        car_age = max(current_year - payload.year, 0)

        fuel_diesel = 1 if payload.fuel_type == "Diesel" else 0
        fuel_electric = 1 if payload.fuel_type == "Electric" else 0
        fuel_lpg = 1 if payload.fuel_type == "LPG" else 0
        fuel_petrol = 1 if payload.fuel_type == "Petrol" else 0

        seller_individual = 1
        seller_trustmark = 0
        transmission_manual = 1
        owner_fourth = 0
        owner_second = 0
        owner_test_drive = 0
        owner_third = 0

        brand_key = payload.brand.strip().lower()
        normalized_brand = BRAND_MAPPING.get(brand_key, brand_key)
        brand_flags = [
            1.0 if normalized_brand == feature.replace("brand_", "") else 0.0
            for feature in BRAND_FEATURES
        ]

        raw_features = [
            car_age,
            np.log1p(payload.kms_driven),
            *brand_flags,
            fuel_diesel,
            fuel_electric,
            fuel_lpg,
            fuel_petrol,
            seller_individual,
            seller_trustmark,
            transmission_manual,
            owner_fourth,
            owner_second,
            owner_test_drive,
            owner_third,
        ]

        feature_df = pd.DataFrame([raw_features], columns=MODEL_FEATURES)
        prediction = model.predict(feature_df)[0]
        predicted_price = round(float(prediction), 2)

        return {
            "success": True,
            "prediction": predicted_price,
            "brand": payload.brand,
            "year": payload.year,
            "fuel_type": payload.fuel_type,
            "kms_driven": payload.kms_driven,
            "image_url": BRAND_IMAGES.get(payload.brand, DEFAULT_BRAND_IMAGE),
        }
    except Exception as error:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(error)},
        )
