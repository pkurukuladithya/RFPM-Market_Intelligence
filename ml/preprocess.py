"""
Data preprocessing module for the ML pipeline.
Cleans raw CSV data and prepares features for model training.
"""

import os
import json
import pandas as pd
import numpy as np


# ─── Paths ───
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DICT_DIR = os.path.join(os.path.dirname(__file__), "..", "dictionaries")
CSV_PATH = os.path.join(DATA_DIR, "airbnb_plus_personal_contacts.csv")


def load_room_type_map():
    """Load room type → ID mapping from dictionaries."""
    path = os.path.join(DICT_DIR, "room_types.json")
    with open(path, "r") as f:
        return json.load(f)


def compute_price_score(row):
    """
    Compute a synthetic price score (1-100) based on:
    - Guest capacity (more guests = higher price)
    - Room type prestige (villa/hotel > basic room)
    - Star rating (higher stars = more expensive)
    """
    guest_score = min(row["number_of_guests"] / 16.0, 1.0) * 30

    room = str(row["room_type"]).lower()
    if any(w in room for w in ["villa", "boutique", "resort"]):
        type_score = 35
    elif any(w in room for w in ["hotel", "serviced", "bungalow"]):
        type_score = 25
    elif "entire" in room:
        type_score = 20
    elif "private room" in room:
        type_score = 12
    else:
        type_score = 8

    star_score = (row["stars"] / 5.0) * 35 if pd.notna(row["stars"]) else 15

    return round(guest_score + type_score + star_score, 1)


def load_and_clean_data():
    """
    Load CSV, clean columns, encode features, compute price scores.
    Returns a cleaned DataFrame ready for model training.
    """
    print("📂 Loading raw CSV...")
    df = pd.read_csv(CSV_PATH)

    # Standardize column names
    df.columns = ["name", "number_of_guests", "room_type", "stars"]

    # Clean numeric columns
    df["number_of_guests"] = pd.to_numeric(df["number_of_guests"], errors="coerce").fillna(2).astype(int)
    df["stars"] = pd.to_numeric(df["stars"], errors="coerce")

    # Fill missing categorical values
    df["room_type"] = df["room_type"].fillna("Entire home")
    df["name"] = df["name"].fillna("Unknown Accommodation")

    # Map room types to numeric IDs
    room_map = load_room_type_map()
    df["room_type_id"] = df["room_type"].map(room_map).fillna(-1).astype(int)

    # Compute synthetic price scores
    df["price_score"] = df.apply(compute_price_score, axis=1)

    # Create guest capacity bins for additional features
    df["guest_bin"] = pd.cut(
        df["number_of_guests"],
        bins=[0, 2, 4, 8, 16, 100],
        labels=[0, 1, 2, 3, 4]
    ).astype(int)

    print(f"   ✅ Cleaned {len(df)} rows")
    print(f"   Rows with ratings: {df['stars'].notna().sum()}")
    print(f"   Unique room types: {df['room_type'].nunique()}")

    return df


def get_feature_matrix(df, for_rating=False):
    """
    Extract feature matrix X and target vector y.
    - for_rating=True: predict stars (only rows with stars)
    - for_rating=False: predict price_score (all rows)
    """
    if for_rating:
        df_subset = df.dropna(subset=["stars"]).copy()
        X = df_subset[["number_of_guests", "room_type_id", "guest_bin"]].values
        y = df_subset["stars"].values
    else:
        X = df.copy()
        # Fill missing stars with median for price prediction features
        X["stars_filled"] = X["stars"].fillna(X["stars"].median())
        feature_cols = ["number_of_guests", "room_type_id", "guest_bin", "stars_filled"]
        y = X["price_score"].values
        X = X[feature_cols].values

    return X, y


if __name__ == "__main__":
    df = load_and_clean_data()
    print("\n📊 Data Summary:")
    print(df.describe())
    print("\n🏠 Top Room Types:")
    print(df["room_type"].value_counts().head(10))
