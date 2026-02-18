"""
Script to load the CSV dataset into PostgreSQL.
Run once: python load_csv.py
"""

import sys
import os
import json
import pandas as pd

# Add parent dir so we can import database/models
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, Base
from models import Accommodation

# ─── Paths ───
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "airbnb_plus_personal_contacts.csv")
ROOM_TYPES_PATH = os.path.join(os.path.dirname(__file__), "..", "dictionaries", "room_types.json")


def compute_price_score(row):
    """
    Compute a synthetic price score (1-100) based on:
    - Guest capacity (more guests = higher price)
    - Room type prestige (villa/hotel > basic room)
    - Star rating (higher = more expensive)
    """
    guest_score = min(row["number_of_guests"] / 16.0, 1.0) * 30  # max 30 pts

    # Room type prestige tiers
    room = str(row["room_type"]).lower()
    if any(w in room for w in ["villa", "boutique", "resort"]):
        type_score = 35
    elif any(w in room for w in ["hotel", "serviced", "bungalow"]):
        type_score = 25
    elif any(w in room for w in ["entire"]):
        type_score = 20
    elif any(w in room for w in ["private room"]):
        type_score = 12
    else:
        type_score = 8

    star_score = (row["stars"] / 5.0) * 35 if pd.notna(row["stars"]) else 15

    return round(guest_score + type_score + star_score, 1)


def load_data():
    """Load CSV into the accommodations table."""
    print(f"📂 Loading CSV from: {os.path.abspath(CSV_PATH)}")

    # Read CSV
    df = pd.read_csv(CSV_PATH)
    print(f"   Rows read: {len(df)}")

    # Load room type dictionary
    with open(ROOM_TYPES_PATH, "r") as f:
        room_type_map = json.load(f)

    # Clean data
    df.columns = ["name", "number_of_guests", "room_type", "stars"]
    df["number_of_guests"] = pd.to_numeric(df["number_of_guests"], errors="coerce").fillna(2).astype(int)
    df["stars"] = pd.to_numeric(df["stars"], errors="coerce")
    df["room_type"] = df["room_type"].fillna("Entire home")
    df["name"] = df["name"].fillna("Unknown Accommodation")

    # Map room type IDs
    df["room_type_id"] = df["room_type"].map(room_type_map).fillna(-1).astype(int)

    # Compute synthetic price scores
    df["price_score"] = df.apply(compute_price_score, axis=1)

    print(f"   Unique room types: {df['room_type'].nunique()}")
    print(f"   Rows with ratings: {df['stars'].notna().sum()}")
    print(f"   Avg price score: {df['price_score'].mean():.1f}")

    # Create tables
    Base.metadata.create_all(bind=engine)
    print("   ✅ Tables created")

    # Insert data — convert NaN to None for proper SQL NULL
    import math
    records = df.to_dict(orient="records")
    for rec in records:
        for key, val in rec.items():
            if isinstance(val, float) and math.isnan(val):
                rec[key] = None

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        # Clear existing data
        session.query(Accommodation).delete()
        session.commit()

        # Bulk insert
        session.bulk_insert_mappings(Accommodation, records)
        session.commit()
        print(f"   ✅ Inserted {len(records)} accommodations into PostgreSQL")

    print("🎉 Data loading complete!")


if __name__ == "__main__":
    load_data()
