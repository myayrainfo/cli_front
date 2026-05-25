import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";

const tooltipStyle = {
  borderRadius: 18,
  border: "1px solid #dbe7f0",
  boxShadow: "0 18px 32px rgba(16, 35, 63, 0.10)",
};

const RevenueSalesOverview = ({ data, totalSales, averageSales, bestDay }) => (
  <section className="card dashboard-analytics-card dashboard-revenue-card">
    <div className="dashboard-card-toolbar">
      <div className="dashboard-card-heading">
        <span className="dashboard-card-chip tone-green">
          <Activity size={16} />
        </span>
        <div>
          <h3>Revenue &amp; Sales Overview</h3>
          <p>Sales ₹ and Orders</p>
        </div>
      </div>
      <button type="button" className="dashboard-filter-pill">
        This Week
      </button>
    </div>

    <div className="dashboard-revenue-chart">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5edf5" strokeDasharray="3 3" />
          <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="sales" fill="#10b981" radius={[12, 12, 0, 0]} barSize={22} />
          <Line dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>

    <div className="dashboard-stat-boxes">
      <div className="dashboard-stat-box">
        <span>Total Sales</span>
        <strong>{totalSales}</strong>
      </div>
      <div className="dashboard-stat-box">
        <span>Average / Day</span>
        <strong>{averageSales}</strong>
      </div>
      <div className="dashboard-stat-box">
        <span>Best Day</span>
        <strong>{bestDay}</strong>
      </div>
    </div>
  </section>
);

export default RevenueSalesOverview;
