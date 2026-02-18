"""
Market Analysis Router — /market_analysis endpoint.
Returns clustering results for market segmentation.
"""

import os
import sys
import joblib
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["Market Analysis"])

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")

# Cluster segment names for business context
SEGMENT_NAMES = {
    0: "Budget Solo/Couple Stays",
    1: "Mid-Range Family Homes",
    2: "Premium Group Villas",
    3: "Luxury Boutique Properties",
    4: "Economy Shared Rooms"
}


@router.get("/market_analysis")
def get_market_analysis():
    """
    Return clustering/segmentation data:
    - Cluster centers
    - Per-cluster statistics
    - Segment names and descriptions
    """
    try:
        cluster_info = joblib.load(os.path.join(MODELS_DIR, "cluster_labels.pkl"))
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Cluster model not found. Run 'python ml/train_model.py' first."
        )

    # Build response with business-friendly segment names
    segments = []
    for i in range(cluster_info["n_clusters"]):
        stats = cluster_info["cluster_stats"].get(str(i), {})
        segment_name = SEGMENT_NAMES.get(i, f"Segment {i}")

        segments.append({
            "id": i,
            "name": segment_name,
            "count": stats.get("count", 0),
            "avgGuests": stats.get("avg_guests", 0),
            "avgPriceScore": stats.get("avg_price_score", 0),
            "avgStars": stats.get("avg_stars"),
            "topRoomTypes": stats.get("top_room_types", {}),
            "center": cluster_info["centers"][i] if i < len(cluster_info["centers"]) else []
        })

    # Cluster distribution for pie chart
    cluster_distribution = [
        {"name": seg["name"], "value": seg["count"]}
        for seg in segments
    ]

    return {
        "segments": segments,
        "clusterDistribution": cluster_distribution,
        "totalClusters": cluster_info["n_clusters"],
        "featureNames": cluster_info.get("feature_names", [])
    }
