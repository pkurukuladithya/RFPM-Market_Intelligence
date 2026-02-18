"""
SQLAlchemy models for the Sri Lanka Market Intelligence Dashboard.
Includes: User (existing), Accommodation, Prediction tables.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """Existing user model — kept for backward compatibility."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)


class Accommodation(Base):
    """Stores cleaned accommodation data from the CSV dataset."""
    __tablename__ = "accommodations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    number_of_guests = Column(Integer, nullable=False)
    room_type = Column(String(100), nullable=False)
    room_type_id = Column(Integer, nullable=True)
    stars = Column(Float, nullable=True)
    # Synthetic fields computed during preprocessing
    price_score = Column(Float, nullable=True)
    cluster_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Prediction(Base):
    """Logs prediction requests from users for analytics."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_type = Column(String(50), nullable=False)  # 'rating' or 'price'
    number_of_guests = Column(Integer, nullable=False)
    room_type = Column(String(100), nullable=False)
    predicted_value = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
