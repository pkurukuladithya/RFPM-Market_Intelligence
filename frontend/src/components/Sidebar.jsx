/**
 * Sidebar Navigation Component
 * Provides navigation links to all dashboard pages with active state highlighting.
 */

import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/predict-rating", label: "Rating Predictor", icon: "⭐" },
  { path: "/predict-price", label: "Price Recommender", icon: "💰" },
  { path: "/market-analysis", label: "Market Analysis", icon: "🎯" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Market Intelligence</h1>
        <span>Sri Lanka · Dashboard</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-glass)" }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
          v1.0 · ML-Powered
        </p>
      </div>
    </aside>
  );
}
