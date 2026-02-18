"""
Prediction Router — /predict_rating and /predict_price endpoints.
Loads trained ML models and returns predictions.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# ─── Setup ───
router = APIRouter(tags=["Predictions"])

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")
DICT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "dictionaries")

# Load models at startup
rating_model = None
price_model = None
room_type_map = None


def load_models():
    """Load ML models and dictionaries into memory."""
    global rating_model, price_model, room_type_map

    try:
        rating_model = joblib.load(os.path.join(MODELS_DIR, "rating_model.pkl"))
        price_model = joblib.load(os.path.join(MODELS_DIR, "price_model.pkl"))
        with open(os.path.join(DICT_DIR, "room_types.json"), "r") as f:
            room_type_map = json.load(f)
        print("   ✅ ML models loaded successfully")
    except FileNotFoundError as e:
        print(f"   ⚠️ Model not found: {e}")
        print("   Run 'python ml/train_model.py' first!")


# Load on module import
load_models()


def get_room_type_id(room_type: str) -> int:
    """Look up room type ID from dictionary."""
    if room_type_map and room_type in room_type_map:
        return room_type_map[room_type]
    return -1


def get_guest_bin(guests: int) -> int:
    """Compute guest capacity bin."""
    if guests <= 2:
        return 0
    elif guests <= 4:
        return 1
    elif guests <= 8:
        return 2
    elif guests <= 16:
        return 3
    else:
        return 4


# ─── Database dependency ───
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from database import SessionLocal
from models import Prediction


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/predict_rating")
def predict_rating(numberOfGuests: int, roomType: str, db: Session = Depends(get_db)):
    """
    Predict accommodation star rating.
    Input: numberOfGuests (int), roomType (str)
    Output: predicted rating (1-5), confidence level
    """
    if rating_model is None:
        raise HTTPException(status_code=503, detail="Rating model not loaded. Run train_model.py first.")

    room_type_id = get_room_type_id(roomType)
    guest_bin = get_guest_bin(numberOfGuests)

    features = np.array([[numberOfGuests, room_type_id, guest_bin]])
    predicted = float(rating_model.predict(features)[0])

    # Clamp to valid range
    predicted = round(max(1.0, min(5.0, predicted)), 2)

    # Determine confidence based on room type match
    confidence = "High" if room_type_id >= 0 else "Medium"

    # Log prediction
    log = Prediction(
        prediction_type="rating",
        number_of_guests=numberOfGuests,
        room_type=roomType,
        predicted_value=predicted
    )
    db.add(log)
    db.commit()

    return {
        "predicted_rating": predicted,
        "confidence": confidence,
        "room_type": roomType,
        "guests": numberOfGuests
    }


@router.post("/predict_price")
def predict_price(numberOfGuests: int, roomType: str, db: Session = Depends(get_db)):
    """
    Recommend a price score for accommodation.
    Input: numberOfGuests (int), roomType (str)
    Output: price score (1-100), price tier label
    """
    if price_model is None:
        raise HTTPException(status_code=503, detail="Price model not loaded. Run train_model.py first.")

    room_type_id = get_room_type_id(roomType)
    guest_bin = get_guest_bin(numberOfGuests)

    # Use median stars (4.5) as default for price prediction
    stars_filled = 4.5
    features = np.array([[numberOfGuests, room_type_id, guest_bin, stars_filled]])
    predicted = float(price_model.predict(features)[0])

    # Clamp to valid range
    predicted = round(max(1.0, min(100.0, predicted)), 1)

    # Determine price tier
    if predicted >= 70:
        tier = "Premium"
    elif predicted >= 50:
        tier = "Mid-Range"
    elif predicted >= 30:
        tier = "Budget-Friendly"
    else:
        tier = "Economy"

    # Log prediction
    log = Prediction(
        prediction_type="price",
        number_of_guests=numberOfGuests,
        room_type=roomType,
        predicted_value=predicted
    )
    db.add(log)
    db.commit()

    return {
        "price_score": predicted,
        "price_tier": tier,
        "room_type": roomType,
        "guests": numberOfGuests
    }
