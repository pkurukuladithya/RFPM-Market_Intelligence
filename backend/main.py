"""
FastAPI Main Application — Sri Lanka Market Intelligence Dashboard
Includes routers for predictions, dashboard data, and market analysis.
"""

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from fastapi.middleware.cors import CORSMiddleware
import models, schemas

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sri Lanka Market Intelligence API",
    description="ML-powered accommodation market analysis dashboard",
    version="1.0.0"
)

# ─── CORS Middleware ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Database Dependency ───
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Include Routers ───
from routers.predict import router as predict_router
from routers.dashboard import router as dashboard_router
from routers.market import router as market_router

app.include_router(predict_router)
app.include_router(dashboard_router)
app.include_router(market_router)


# ─── Existing User Endpoints (kept for backward compatibility) ───
@app.post("/users/")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


# ─── Health Check ───
@app.get("/")
def root():
    return {
        "message": "Sri Lanka Market Intelligence API",
        "status": "running",
        "endpoints": [
            "/dashboard_data",
            "/predict_rating",
            "/predict_price",
            "/market_analysis",
            "/docs"
        ]
    }
