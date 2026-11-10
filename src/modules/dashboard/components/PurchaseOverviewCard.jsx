import EmptyState from "../../../shared/components/EmptyState";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PackagePlus } from "lucide-react";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #dbe7f0",
  boxShadow: "0 4px 12px rgba(16, 35, 63, 0.06)",
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
          <p>Recent purchase entries</p>
        </div>
      </div>
      <span className="dashboard-filter-pill">
        Latest 7 purchases
      </span>
    </div>

    <div className="dashboard-mini-analytics-chart">
      {data.length ? <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5edf5" strokeDasharray="3 3" />
          <XAxis axisLine={false} dataKey="label" tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar isAnimationActive={false} dataKey="total" fill="#647b96" radius={[4, 4, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer> : <EmptyState title="No activity yet" description="Recorded transactions will appear here." />}
    </div>

    <div className="dashboard-mini-card-stats">
      <div>
        <span>Total Purchases</span>
        <strong>{totalPurchases}</strong>
      </div>
      <div>
        <span>Average / Entry</span>
        <strong>{averagePurchases}</strong>
      </div>
    </div>
  </section>
);

export default PurchaseOverviewCard;
