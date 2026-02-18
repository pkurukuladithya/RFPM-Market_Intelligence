/**
 * Home / Dashboard Page
 * Shows KPI cards and summary charts using data from /dashboard_data endpoint.
 */

import { useState, useEffect } from "react";
import axios from "axios";
import KPICard from "../components/KPICard";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area, CartesianGrid
} from "recharts";

const API = "http://127.0.0.1:8000";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
    "#f43f5e", "#ec4899", "#f97316", "#84cc16", "#14b8a6"];

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        // Auto-hide welcome after 5 seconds
        const timer = setTimeout(() => setShowWelcome(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        axios.get(`${API}/dashboard_data`)
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Dashboard data error:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p className="text-gray-400">Loading dashboard data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="loading">
                <p className="text-yellow-400">⚠️ Could not load data. Make sure the backend is running.</p>
            </div>
        );
    }

    const { kpis, ratingDistribution, roomTypeDistribution, priceDistribution, ratingByRoomType } = data;

    return (
        <div className="space-y-8">
            {/* Welcome Hero Section */}
            {showWelcome && (
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-12 mb-8 animate-fade-in">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="relative z-10 max-w-3xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">🌴</span>
                            <span className="text-4xl">📊</span>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                            Sri Lanka Market Intelligence
                        </h1>
                        <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                            Welcome to your AI-powered tourism market analysis dashboard. Discover actionable insights about accommodation pricing, ratings, and market trends across Sri Lanka.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-6 py-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                                <p className="text-sm text-gray-300"><span className="text-blue-300 font-semibold">200+</span> ML Models</p>
                            </div>
                            <div className="px-6 py-3 bg-purple-500/20 border border-purple-400/30 rounded-lg">
                                <p className="text-sm text-gray-300"><span className="text-purple-300 font-semibold">Real-time</span> Analytics</p>
                            </div>
                            <div className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/30 rounded-lg">
                                <p className="text-sm text-gray-300"><span className="text-cyan-300 font-semibold">Instant</span> Predictions</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <h2 className="text-3xl font-bold text-white mb-2">📊 Dashboard Overview</h2>
                <p className="text-gray-400">Real-time market intelligence and key performance indicators</p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard icon="🏠" label="Total Listings" value={kpis.totalAccommodations.toLocaleString()} />
                <KPICard icon="⭐" label="Average Rating" value={kpis.avgRating} />
                <KPICard icon="👥" label="Avg Guests" value={kpis.avgGuests} />
                <KPICard icon="🏷️" label="Room Types" value={kpis.totalRoomTypes} />
                <KPICard icon="📈" label="Rated %" value={`${kpis.ratedPercentage}%`} />
            </div>

            {/* Charts */}
            <div className="chart-grid">
                {/* Rating Distribution */}
                <div className="chart-card animate-in">
                    <h3>⭐ Rating Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                                labelStyle={{ color: "#f1f5f9" }}
                            />
                            <Bar dataKey="count" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Room Type Distribution */}
                <div className="chart-card animate-in">
                    <h3>🏠 Top Room Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={roomTypeDistribution}
                                dataKey="count"
                                nameKey="roomType"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={50}
                                paddingAngle={2}
                                label={({ roomType, percent }) =>
                                    `${roomType.substring(0, 15)}${roomType.length > 15 ? '…' : ''} ${(percent * 100).toFixed(0)}%`
                                }
                                labelLine={false}
                            >
                                {roomTypeDistribution.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Price Tier Distribution */}
                <div className="chart-card animate-in">
                    <h3>💰 Price Tier Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={priceDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="tier" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                            />
                            <Bar dataKey="count" fill="url(#greenGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Rating by Room Type */}
                <div className="chart-card animate-in">
                    <h3>📈 Avg Rating by Room Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingByRoomType} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" domain={[0, 5]} stroke="#64748b" fontSize={12} />
                            <YAxis
                                type="category"
                                dataKey="roomType"
                                width={140}
                                stroke="#64748b"
                                fontSize={11}
                                tickFormatter={(v) => v.length > 20 ? v.substring(0, 20) + '…' : v}
                            />
                            <Tooltip
                                contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}
                            />
                            <Bar dataKey="avgRating" fill="url(#amberGrad)" radius={[0, 6, 6, 0]} />
                            <defs>
                                <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#f59e0b" />
                                    <stop offset="100%" stopColor="#f97316" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
