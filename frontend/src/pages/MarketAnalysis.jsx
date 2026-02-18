/**
 * Market Analysis Page
 * Displays clustering/segmentation results with charts and segment detail cards.
 */

import { useState, useEffect } from "react";
import axios from "axios";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const API = "http://127.0.0.1:8000";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4"];

export default function MarketAnalysis() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/market_analysis`)
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Market analysis error:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading market analysis...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="loading">
                <p>⚠️ Could not load market analysis. Make sure backend and ML models are running.</p>
            </div>
        );
    }

    const { segments, clusterDistribution } = data;

    // Prepare radar chart data
    const radarData = segments.map((seg) => ({
        segment: seg.name.split(" ").slice(0, 2).join(" "),
        Guests: seg.avgGuests,
        Price: seg.avgPriceScore,
        Rating: (seg.avgStars || 0) * 20, // Scale to 0-100 for visualization
    }));

    // Prepare comparison bar chart
    const comparisonData = segments.map((seg) => ({
        name: seg.name.split(" ").slice(0, 2).join(" "),
        listings: seg.count,
        avgGuests: seg.avgGuests,
        avgPrice: seg.avgPriceScore,
    }));

    return (
        <div>
            <div className="page-header">
                <h2>🎯 Market Analysis</h2>
                <p>AI-powered market segmentation of Sri Lanka accommodations</p>
            </div>

            {/* Charts */}
            <div className="chart-grid">
                {/* Cluster Distribution Pie */}
                <div className="chart-card animate-in">
                    <h3>📊 Market Segment Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={clusterDistribution}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={60}
                                paddingAngle={2}
                                label={({ name, percent }) =>
                                    `${name.split(" ").slice(0, 2).join(" ")} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {clusterDistribution.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Segment Comparison Bar */}
                <div className="chart-card animate-in">
                    <h3>📈 Segment Comparison — Listings Count</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                            />
                            <Bar dataKey="listings" fill="url(#purpleGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Segment Detail Cards */}
            <div className="page-header" style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: 20 }}>🏷️ Segment Details</h2>
            </div>

            <div className="segments-grid">
                {segments.map((seg, i) => (
                    <div className="segment-card animate-in" key={seg.id}>
                        <div className="segment-header">
                            <div className="segment-number">{i + 1}</div>
                            <div className="segment-name">{seg.name}</div>
                        </div>

                        <div className="segment-stats">
                            <div className="segment-stat">
                                <div className="segment-stat-value">{seg.count}</div>
                                <div className="segment-stat-label">Listings</div>
                            </div>
                            <div className="segment-stat">
                                <div className="segment-stat-value">{seg.avgGuests}</div>
                                <div className="segment-stat-label">Avg Guests</div>
                            </div>
                            <div className="segment-stat">
                                <div className="segment-stat-value">{seg.avgPriceScore}</div>
                                <div className="segment-stat-label">Avg Price</div>
                            </div>
                        </div>

                        {seg.avgStars && (
                            <div className="segment-stat" style={{ textAlign: "center", marginBottom: 12 }}>
                                <div className="segment-stat-value" style={{ color: "#f59e0b" }}>
                                    ⭐ {seg.avgStars}
                                </div>
                                <div className="segment-stat-label">Avg Stars</div>
                            </div>
                        )}

                        {seg.topRoomTypes && Object.keys(seg.topRoomTypes).length > 0 && (
                            <div className="segment-types">
                                <h4>Top Room Types</h4>
                                {Object.entries(seg.topRoomTypes).map(([type, count]) => (
                                    <span className="type-tag" key={type}>
                                        {type} ({count})
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
