"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel
from typing import Optional


# ─── Existing User schemas ───
class UserCreate(BaseModel):
    name: str
    email: str


# ─── Prediction schemas ───
class PredictionInput(BaseModel):
    numberOfGuests: int
    roomType: str


class RatingResponse(BaseModel):
    predicted_rating: float
    confidence: str
    room_type: str
    guests: int


class PriceResponse(BaseModel):
    price_score: float
    price_tier: str
    room_type: str
    guests: int


# ─── Dashboard schemas ───
class KPIData(BaseModel):
    total_accommodations: int
    avg_rating: float
    avg_guests: float
    total_room_types: int
    rated_percentage: float
