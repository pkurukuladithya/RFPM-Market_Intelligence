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
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="loading">
                <p>⚠️ Could not load data. Make sure the backend is running.</p>
            </div>
        );
    }

    const { kpis, ratingDistribution, roomTypeDistribution, priceDistribution, ratingByRoomType } = data;

    return (
        <div>
            <div className="page-header">
                <h2>📊 Dashboard Overview</h2>
                <p>Sri Lanka accommodation market intelligence at a glance</p>
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
