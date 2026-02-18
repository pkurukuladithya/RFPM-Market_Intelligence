"""
Dashboard Router — /dashboard_data endpoint.
Returns aggregated statistics and chart data from the database.
"""

import os
import sys
import math
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from database import SessionLocal
from models import Accommodation

router = APIRouter(tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def safe_float(val, default=0.0):
    """Safely convert a value to float, returning default if None/NaN/Inf."""
    if val is None:
        return default
    try:
        result = float(val)
        if math.isnan(result) or math.isinf(result):
            return default
        return result
    except (TypeError, ValueError):
        return default


@router.get("/dashboard_data")
def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Return aggregated data for the dashboard:
    - KPIs: total accommodations, avg rating, avg guests, etc.
    - Rating distribution (for bar chart)
    - Room type distribution (for pie chart)
    - Price score distribution (for histogram)
    """
    try:
        # ─── KPIs ───
        total = db.query(func.count(Accommodation.id)).scalar() or 0
        avg_rating = db.query(func.avg(Accommodation.stars)).filter(
            Accommodation.stars.isnot(None)
        ).scalar()
        avg_guests = db.query(func.avg(Accommodation.number_of_guests)).scalar()
        total_room_types = db.query(func.count(func.distinct(Accommodation.room_type))).scalar() or 0
        rated_count = db.query(func.count(Accommodation.id)).filter(
            Accommodation.stars.isnot(None)
        ).scalar() or 0
        rated_pct = round((rated_count / total * 100), 1) if total > 0 else 0

        # ─── Rating Distribution (binned) ───
        rating_dist = []
        bins = [(1, 2, "1-2"), (2, 3, "2-3"), (3, 4, "3-4"), (4, 4.5, "4-4.5"), (4.5, 5.01, "4.5-5")]
        for low, high, label in bins:
            count = db.query(func.count(Accommodation.id)).filter(
                Accommodation.stars >= low,
                Accommodation.stars < high
            ).scalar() or 0
            rating_dist.append({"range": label, "count": count})

        # ─── Room Type Distribution (top 10) ───
        room_type_rows = db.query(
            Accommodation.room_type,
            func.count(Accommodation.id).label("count")
        ).group_by(Accommodation.room_type).order_by(
            func.count(Accommodation.id).desc()
        ).limit(10).all()

        room_type_dist = [{"roomType": str(row[0]), "count": int(row[1])} for row in room_type_rows]

        # ─── Price Score Distribution ───
        price_dist = []
        price_bins = [(0, 20, "Economy"), (20, 40, "Budget"), (40, 60, "Mid-Range"),
                      (60, 80, "Premium"), (80, 101, "Luxury")]
        for low, high, label in price_bins:
            count = db.query(func.count(Accommodation.id)).filter(
                Accommodation.price_score >= low,
                Accommodation.price_score < high
            ).scalar() or 0
            price_dist.append({"tier": label, "count": int(count)})

        # ─── Guest Capacity Distribution ───
        guest_dist_rows = db.query(
            Accommodation.number_of_guests,
            func.count(Accommodation.id).label("count")
        ).group_by(Accommodation.number_of_guests).order_by(
            Accommodation.number_of_guests
        ).all()
        guest_dist = [{"guests": int(row[0]), "count": int(row[1])} for row in guest_dist_rows]

        # ─── Rating by Room Type (top 8, avg rating) ───
        rating_by_type = db.query(
            Accommodation.room_type,
            func.avg(Accommodation.stars).label("avg_rating"),
            func.count(Accommodation.id).label("count")
        ).filter(
            Accommodation.stars.isnot(None)
        ).group_by(Accommodation.room_type).order_by(
            func.count(Accommodation.id).desc()
        ).limit(8).all()

        rating_by_room = [
            {
                "roomType": str(row[0]),
                "avgRating": round(safe_float(row[1]), 2),
                "count": int(row[2])
            }
            for row in rating_by_type
        ]

        return {
            "kpis": {
                "totalAccommodations": int(total),
                "avgRating": round(safe_float(avg_rating), 2),
                "avgGuests": round(safe_float(avg_guests), 1),
                "totalRoomTypes": int(total_room_types),
                "ratedPercentage": float(rated_pct)
            },
            "ratingDistribution": rating_dist,
            "roomTypeDistribution": room_type_dist,
            "priceDistribution": price_dist,
            "guestDistribution": guest_dist,
            "ratingByRoomType": rating_by_room
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
