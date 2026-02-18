# 🇱🇰 Sri Lanka Advanced Market Intelligence Dashboard

A full-stack ML-powered dashboard for analyzing Sri Lanka's accommodation market. Built with React, FastAPI, PostgreSQL, and scikit-learn.

## 📁 Project Structure

```
web_new/
├── frontend/          # React + Vite dashboard
│   └── src/
│       ├── components/  (Sidebar, KPICard)
│       ├── pages/       (Home, RatingPredictor, PriceRecommender, MarketAnalysis)
│       ├── App.jsx
│       └── index.css
├── backend/           # FastAPI API server
│   ├── routers/         (predict.py, dashboard.py, market.py)
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   └── load_csv.py
├── ml/                # Machine Learning pipeline
│   ├── preprocess.py
│   ├── train_model.py
│   └── models/          (saved .pkl files)
├── data/              # CSV dataset
│   └── airbnb_plus_personal_contacts.csv
└── dictionaries/      # Mapping files
    ├── room_types.json
    └── amenities.json
```

## 🚀 How to Run

### 1. Train ML Models
```bash
cd ml
pip install pandas scikit-learn joblib numpy
python train_model.py
```

### 2. Load CSV into PostgreSQL
```bash
cd backend
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pandas joblib scikit-learn numpy
python load_csv.py
```

### 3. Start Backend
```bash
cd backend
python -m uvicorn main:app --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard at http://localhost:5173
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard_data` | GET | KPIs and chart data |
| `/predict_rating` | POST | Predict star rating |
| `/predict_price` | POST | Recommend price score |
| `/market_analysis` | GET | Clustering segments |
| `/docs` | GET | Swagger API docs |

## 🤖 ML Models

- **Rating Predictor**: Random Forest Regressor
- **Price Recommender**: Gradient Boosting Regressor
- **Market Segmentation**: K-Means Clustering (5 segments)

## ⚙️ Tech Stack

- **Frontend**: React 19, Vite 7, Recharts, React Router
- **Backend**: FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL
- **ML**: scikit-learn, pandas, joblib
