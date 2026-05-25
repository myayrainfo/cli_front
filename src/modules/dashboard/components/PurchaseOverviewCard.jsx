import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PackagePlus } from "lucide-react";

const tooltipStyle = {
  borderRadius: 18,
  border: "1px solid #dbe7f0",
  boxShadow: "0 18px 32px rgba(16, 35, 63, 0.10)",
};

const PurchaseOverviewCard = ({ data, totalPurchases, averagePurchases }) => (
  <section className="card dashboard-analytics-card">
    <div className="dashboard-card-toolbar">
      <div className="dashboard-card-heading">
        <span className="dashboard-card-chip tone-blue">
          <PackagePlus size={16} />
        </span>
        <div>
          <h3>Purchase Overview</h3>
          <p>Weekly purchasing trend</p>
        </div>
      </div>
      <button type="button" className="dashboard-filter-pill">
        Weekly
      </button>
    </div>

    <div className="dashboard-mini-analytics-chart">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5edf5" strokeDasharray="3 3" />
          <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="total" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="dashboard-mini-card-stats">
      <div>
        <span>Total Purchases</span>
        <strong>{totalPurchases}</strong>
      </div>
      <div>
        <span>Average / Day</span>
        <strong>{averagePurchases}</strong>
      </div>
    </div>
  </section>
);

export default PurchaseOverviewCard;
