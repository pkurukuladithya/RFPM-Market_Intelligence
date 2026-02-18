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

const tierColors = {
    "Premium": { bg: "from-yellow-500/10 to-amber-500/10", border: "border-yellow-400/20", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30" },
    "Mid-Range": { bg: "from-blue-500/10 to-cyan-500/10", border: "border-blue-400/20", badge: "bg-blue-500/20 text-blue-300 border-blue-400/30" },
    "Budget-Friendly": { bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-400/20", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" },
    "Economy": { bg: "from-gray-500/10 to-slate-500/10", border: "border-gray-400/20", badge: "bg-gray-500/20 text-gray-300 border-gray-400/30" },
    "Luxury": { bg: "from-purple-500/10 to-pink-500/10", border: "border-purple-400/20", badge: "bg-purple-500/20 text-purple-300 border-purple-400/30" },
};

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
            <div className="w-full h-3 bg-gray-700/30 rounded-full overflow-hidden mt-4 mb-2">
                <div 
                    className="h-full rounded-full transition-all duration-600 ease-out"
                    style={{
                        width: `${percentage}%`,
                        background: percentage >= 70 ? "linear-gradient(90deg, #f59e0b, #f97316)"
                            : percentage >= 50 ? "linear-gradient(90deg, #3b82f6, #06b6d4)"
                                : percentage >= 30 ? "linear-gradient(90deg, #10b981, #14b8a6)"
                                    : "linear-gradient(90deg, #64748b, #94a3b8)",
                    }}
                ></div>
            </div>
        );
    };

    const tierInfo = result && result.price_tier ? tierColors[result.price_tier] : null;

    return (
        <div className="space-y-8">
            <div className="page-header">
                <h2 className="text-3xl font-bold text-white mb-2">💰 Price Recommender</h2>
                <p className="text-gray-400">Get intelligent pricing recommendations based on market analysis</p>
            </div>

            <div className="max-w-2xl form-card animate-in">
                <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-xl">
                    <p className="text-sm text-cyan-200">
                        💡 <span className="font-semibold">Smart Pricing:</span> Our ML model analyzes market demand and competition to suggest optimal pricing strategies.
                    </p>
                </div>

                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">👥 Number of Guests</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                        placeholder="Enter number of guests"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">Capacity of your accommodation</p>
                </div>

                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">🏠 Room Type</label>
                    <select 
                        value={roomType} 
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    >
                        {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Type of accommodation</p>
                </div>

                <button 
                    className="w-full py-3 mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handlePredict} 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="inline-block animate-spin">⏳</span>
                            Calculating...
                        </>
                    ) : (
                        <>💲 Get Price Recommendation</>
                    )}
                </button>

                {result && !result.error && (
                    <div className={`result-card mt-8 bg-gradient-to-br ${tierInfo?.bg} border ${tierInfo?.border}`}>
                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                                {result.price_score}
                            </div>
                            <p className="text-gray-300 text-lg">Price Score (out of 100)</p>
                        </div>

                        <div className="mb-6">
                            {renderGauge(result.price_score)}
                            <p className="text-xs text-gray-400 text-center mt-2">
                                {result.price_score >= 70 ? "Premium pricing strategy" 
                                    : result.price_score >= 50 ? "Competitive pricing" 
                                    : result.price_score >= 30 ? "Budget-friendly approach"
                                    : "Economy pricing model"}
                            </p>
                        </div>

                        <div className="border-t border-gray-600/30 pt-6 mb-6">
                            <div className="text-center mb-4">
                                <span className={`inline-block px-6 py-2 rounded-full border font-semibold text-sm ${tierInfo?.badge}`}>
                                    {result.price_tier} Tier
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 text-center">
                                Recommended pricing category based on market analysis
                            </p>
                        </div>

                        <div className="border-t border-gray-600/30 pt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Room Type</p>
                                    <p className="text-sm font-semibold text-white break-words">{result.room_type}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Guests</p>
                                    <p className="text-sm font-semibold text-white">{result.guests}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {result?.error && (
                    <div className="result-card mt-8 bg-gradient-to-br from-red-500/5 to-rose-500/5 border border-red-400/20">
                        <p className="text-red-300 text-center font-semibold">
                            ⚠️ Price prediction failed. Make sure the backend and ML models are running.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
