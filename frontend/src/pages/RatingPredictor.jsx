/**
 * Rating Predictor Page
 * Form to input accommodation details and predict star rating using ML model.
 */

import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const ROOM_TYPES = [
    "Entire home", "Private room in home", "Entire villa", "Room in hotel",
    "Private room in villa", "Private room in guesthouse", "Room in boutique hotel",
    "Entire rental unit", "Private room in bed and breakfast", "Room in bed and breakfast",
    "Private room in rental unit", "Entire vacation home", "Private room in resort",
    "Entire guest suite", "Entire guesthouse", "Entire bungalow", "Entire cottage",
    "Entire townhouse", "Entire condo", "Farm stay", "Tent", "Entire serviced apartment",
    "Entire bed and breakfast", "Private room in bungalow", "Private room in cottage",
    "Casa particular", "Tiny home", "Boat", "Entire chalet", "Campsite", "Cave",
    "Private room in nature lodge", "Castle", "Room in resort"
];

export default function RatingPredictor() {
    const [guests, setGuests] = useState(2);
    const [roomType, setRoomType] = useState("Entire villa");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${API}/predict_rating?numberOfGuests=${guests}&roomType=${encodeURIComponent(roomType)}`
            );
            setResult(res.data);
        } catch (err) {
            console.error("Prediction error:", err);
            setResult({ error: true });
        }
        setLoading(false);
    };

    // Visual star gauge
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const partial = rating - fullStars;
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) stars.push("★");
            else if (i === fullStars && partial >= 0.5) stars.push("★");
            else stars.push("☆");
        }
        return stars.join(" ");
    };

    return (
        <div>
            <div className="page-header">
                <h2>⭐ Rating Predictor</h2>
                <p>Predict the expected star rating for an accommodation</p>
            </div>

            <div className="form-card animate-in">
                <div className="form-group">
                    <label>Number of Guests</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                        placeholder="Enter number of guests"
                    />
                </div>

                <div className="form-group">
                    <label>Room Type</label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                        {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <button className="btn-predict" onClick={handlePredict} disabled={loading}>
                    {loading ? "Predicting..." : "🔮 Predict Rating"}
                </button>

                {result && !result.error && (
                    <div className="result-card">
                        <div className="result-value">{result.predicted_rating} / 5.0</div>
                        <div style={{ fontSize: 28, marginBottom: 8, letterSpacing: 4 }}>
                            {renderStars(result.predicted_rating)}
                        </div>
                        <div className="result-label">Predicted Star Rating</div>
                        <div className="result-meta">
                            <div className="result-meta-item">
                                <strong>Confidence:</strong> {result.confidence}
                            </div>
                            <div className="result-meta-item">
                                <strong>Room Type:</strong> {result.room_type}
                            </div>
                            <div className="result-meta-item">
                                <strong>Guests:</strong> {result.guests}
                            </div>
                        </div>
                    </div>
                )}

                {result?.error && (
                    <div className="result-card" style={{ borderColor: "rgba(244,63,94,0.3)" }}>
                        <p style={{ color: "var(--accent-rose)" }}>
                            ⚠️ Prediction failed. Make sure the backend and ML models are running.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
