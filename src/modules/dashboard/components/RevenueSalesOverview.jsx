import EmptyState from "../../../shared/components/EmptyState";
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #dbe7f0",
  boxShadow: "0 4px 12px rgba(16, 35, 63, 0.06)",
};

const RevenueSalesOverview = ({ data, totalSales, averageSales, bestDay }) => (
  <section className="card dashboard-analytics-card dashboard-revenue-card">
    <div className="dashboard-card-toolbar">
      <div className="dashboard-card-heading">
        <span className="dashboard-card-chip tone-green">
          <Activity size={16} />
        </span>
        <div>
          <h3>Recent Sales</h3>
          <p>Recent bill totals (INR)</p>
        </div>
      </div>
      <span className="dashboard-filter-pill">
        Latest 7 bills
      </span>
    </div>

    <div className="dashboard-revenue-chart">
      {data.length ? <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5edf5" strokeDasharray="3 3" />
          <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar isAnimationActive={false} dataKey="sales" fill="#537b72" radius={[4, 4, 0, 0]} barSize={22} />
        </ComposedChart>
      </ResponsiveContainer> : <EmptyState title="No activity yet" description="Recorded transactions will appear here." />}
    </div>

    <div className="dashboard-stat-boxes">
      <div className="dashboard-stat-box">
        <span>Total Sales</span>
        <strong>{totalSales}</strong>
      </div>
      <div className="dashboard-stat-box">
        <span>Average / Entry</span>
        <strong>{averageSales}</strong>
      </div>
      <div className="dashboard-stat-box">
        <span>Largest Bill Date</span>
        <strong>{bestDay}</strong>
      </div>
    </div>
  </section>
);

export default RevenueSalesOverview;
