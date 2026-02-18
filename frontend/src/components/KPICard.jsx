/**
 * Reusable KPI Card Component
 * Displays a single key performance indicator with icon, label, and value.
 */

export default function KPICard({ icon, label, value }) {
    return (
        <div className="kpi-card animate-in">
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
        </div>
    );
}
