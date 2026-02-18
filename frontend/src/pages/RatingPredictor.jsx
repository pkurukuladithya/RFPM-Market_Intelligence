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
        <div className="space-y-8">
            <div className="page-header">
                <h2 className="text-3xl font-bold text-white mb-2">⭐ Rating Predictor</h2>
                <p className="text-gray-400">Use AI to predict accommodation star ratings based on room type and capacity</p>
            </div>

            <div className="max-w-2xl form-card animate-in">
                <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/20 rounded-xl">
                    <p className="text-sm text-amber-200">
                        💡 <span className="font-semibold">Pro Tip:</span> Our ML model analyzes market trends to predict realistic guest ratings based on accommodation type and capacity.
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
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-500 mt-2">Typically between 1-20 guests</p>
                </div>

                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-300 mb-3">🏠 Room Type</label>
                    <select 
                        value={roomType} 
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    >
                        {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Select the accommodation type</p>
                </div>

                <button 
                    className="btn-predict w-full py-3 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handlePredict} 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="inline-block animate-spin">⏳</span>
                            Predicting...
                        </>
                    ) : (
                        <>🔮 Predict Rating</>
                    )}
                </button>

                {result && !result.error && (
                    <div className="result-card mt-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-400/20">
                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                                {result.predicted_rating.toFixed(1)}
                            </div>
                            <div className="text-4xl text-yellow-400 tracking-widest mb-3">
                                {renderStars(result.predicted_rating)}
                            </div>
                            <p className="text-gray-300 font-semibold text-lg">Predicted Star Rating</p>
                        </div>

                        <div className="border-t border-blue-400/10 pt-6 mt-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 text-center">
                                    <p className="text-xs text-blue-300 uppercase tracking-wider mb-2">Confidence</p>
                                    <p className="text-lg font-bold text-blue-300">{result.confidence}</p>
                                </div>
                                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-400/20 text-center">
                                    <p className="text-xs text-purple-300 uppercase tracking-wider mb-2">Room Type</p>
                                    <p className="text-sm font-bold text-purple-300 break-words">{result.room_type}</p>
                                </div>
                                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-400/20 text-center">
                                    <p className="text-xs text-cyan-300 uppercase tracking-wider mb-2">Guests</p>
                                    <p className="text-lg font-bold text-cyan-300">{result.guests}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {result?.error && (
                    <div className="result-card mt-8 bg-gradient-to-br from-red-500/5 to-rose-500/5 border border-red-400/20">
                        <p className="text-red-300 text-center font-semibold">
                            ⚠️ Prediction failed. Make sure the backend and ML models are running.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
