"""
ML Model Training Script
Trains three models:
  1. Rating Predictor   — Random Forest Regressor → predict star rating
  2. Price Recommender  — Gradient Boosting Regressor → predict price score
  3. Market Clustering  — K-Means → group accommodations into segments

Usage:
  cd ml/
  python train_model.py
"""

import os
import sys
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

# Add parent directory for imports
sys.path.insert(0, os.path.dirname(__file__))
from preprocess import load_and_clean_data, get_feature_matrix

# ─── Output directory ───
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_rating_model(df):
    """
    Train a Random Forest model to predict star ratings.
    Features: numberOfGuests, roomTypeId, guestBin
    Target: stars
    """
    print("\n" + "=" * 50)
    print("🌟 Training Rating Predictor...")
    print("=" * 50)

    X, y = get_feature_matrix(df, for_rating=True)
    print(f"   Training samples: {len(X)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"   MAE: {mae:.3f}")
    print(f"   R²:  {r2:.3f}")

    # Save model
    path = os.path.join(MODELS_DIR, "rating_model.pkl")
    joblib.dump(model, path)
    print(f"   ✅ Saved to {path}")

    return model


def train_price_model(df):
    """
    Train a Gradient Boosting model to predict synthetic price scores.
    Features: numberOfGuests, roomTypeId, guestBin, stars
    Target: price_score
    """
    print("\n" + "=" * 50)
    print("💰 Training Price Recommender...")
    print("=" * 50)

    X, y = get_feature_matrix(df, for_rating=False)
    print(f"   Training samples: {len(X)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = GradientBoostingRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"   MAE: {mae:.3f}")
    print(f"   R²:  {r2:.3f}")

    # Save model
    path = os.path.join(MODELS_DIR, "price_model.pkl")
    joblib.dump(model, path)
    print(f"   ✅ Saved to {path}")

    return model


def train_clustering(df):
    """
    K-Means clustering to group accommodations into market segments.
    Features: numberOfGuests, roomTypeId, stars (filled), price_score
    """
    print("\n" + "=" * 50)
    print("📊 Training Market Clustering...")
    print("=" * 50)

    features = df[["number_of_guests", "room_type_id", "price_score"]].copy()
    features["stars_filled"] = df["stars"].fillna(df["stars"].median())

    # Standardize features for clustering
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features.values)

    # Train K-Means with 5 clusters
    n_clusters = 5
    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    model.fit(X_scaled)

    # Cluster statistics
    df_clustered = df.copy()
    df_clustered["cluster"] = model.labels_

    print(f"   Clusters: {n_clusters}")
    for i in range(n_clusters):
        cluster_data = df_clustered[df_clustered["cluster"] == i]
        print(f"   Cluster {i}: {len(cluster_data)} items, "
              f"avg guests={cluster_data['number_of_guests'].mean():.1f}, "
              f"avg price_score={cluster_data['price_score'].mean():.1f}")

    # Save model and scaler
    cluster_path = os.path.join(MODELS_DIR, "cluster_model.pkl")
    scaler_path = os.path.join(MODELS_DIR, "cluster_scaler.pkl")
    joblib.dump(model, cluster_path)
    joblib.dump(scaler, scaler_path)
    print(f"   ✅ Saved cluster model to {cluster_path}")
    print(f"   ✅ Saved scaler to {scaler_path}")

    # Save cluster labels for backend use
    labels_path = os.path.join(MODELS_DIR, "cluster_labels.pkl")
    cluster_info = {
        "labels": model.labels_.tolist(),
        "centers": model.cluster_centers_.tolist(),
        "n_clusters": n_clusters,
        "feature_names": ["number_of_guests", "room_type_id", "price_score", "stars"],
        "cluster_stats": {}
    }
    for i in range(n_clusters):
        cluster_data = df_clustered[df_clustered["cluster"] == i]
        cluster_info["cluster_stats"][str(i)] = {
            "count": int(len(cluster_data)),
            "avg_guests": round(float(cluster_data["number_of_guests"].mean()), 1),
            "avg_price_score": round(float(cluster_data["price_score"].mean()), 1),
            "avg_stars": round(float(cluster_data["stars"].mean()), 2) if cluster_data["stars"].notna().any() else None,
            "top_room_types": cluster_data["room_type"].value_counts().head(3).to_dict()
        }
    joblib.dump(cluster_info, labels_path)
    print(f"   ✅ Saved cluster info to {labels_path}")

    return model, scaler


def main():
    print("🚀 Sri Lanka Market Intelligence — ML Training Pipeline")
    print("=" * 60)

    # Load and preprocess data
    df = load_and_clean_data()

    # Train all models
    train_rating_model(df)
    train_price_model(df)
    train_clustering(df)

    print("\n" + "=" * 60)
    print("🎉 All models trained and saved successfully!")
    print(f"   Models directory: {os.path.abspath(MODELS_DIR)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
