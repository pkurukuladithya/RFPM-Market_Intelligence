/**
 * Price Recommender Page
 * Form to get a recommended price score and tier for an accommodation.
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

export default function PriceRecommender() {
    const [guests, setGuests] = useState(4);
    const [roomType, setRoomType] = useState("Entire villa");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${API}/predict_price?numberOfGuests=${guests}&roomType=${encodeURIComponent(roomType)}`
            );
            setResult(res.data);
        } catch (err) {
            console.error("Price prediction error:", err);
            setResult({ error: true });
        }
        setLoading(false);
    };

    // Price gauge visual
    const renderGauge = (score) => {
        const percentage = Math.min(100, Math.max(0, score));
        return (
            <div style={{
                width: "100%",
                height: 12,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 6,
                overflow: "hidden",
                marginTop: 12,
                marginBottom: 8,
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: percentage >= 70 ? "linear-gradient(90deg, #f59e0b, #f97316)"
                        : percentage >= 50 ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                            : percentage >= 30 ? "linear-gradient(90deg, #10b981, #06b6d4)"
                                : "linear-gradient(90deg, #64748b, #94a3b8)",
                    borderRadius: 6,
                    transition: "width 0.6s ease",
                }}></div>
            </div>
        );
    };

    return (
        <div>
            <div className="page-header">
                <h2>💰 Price Recommender</h2>
                <p>Get a recommended price tier score for an accommodation</p>
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
                    {loading ? "Calculating..." : "💲 Get Price Score"}
                </button>

                {result && !result.error && (
                    <div className="result-card">
                        <div className="result-value">{result.price_score}</div>
                        <div className="result-label">Price Score (out of 100)</div>
                        {renderGauge(result.price_score)}
                        <div className={`tier-badge tier-${result.price_tier}`}>
                            {result.price_tier}
                        </div>
                        <div className="result-meta">
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
                            ⚠️ Price prediction failed. Make sure the backend and ML models are running.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
