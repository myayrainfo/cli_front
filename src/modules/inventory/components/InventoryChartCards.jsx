import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SectionCard from "../../../shared/components/SectionCard";
import { formatCurrency } from "../../../shared/utils/format";

const palette = ["#2f6fed", "#1a9a84", "#d89225", "#7a53cf", "#d14d4d"];

const tooltipStyle = {
  borderRadius: 18,
  border: "1px solid #dbe7ef",
  boxShadow: "0 18px 32px rgba(18, 36, 56, 0.12)",
};

const InventoryChartCards = ({ data }) => (
  <SectionCard
    title="Stock Value by Category"
    action={<button type="button" className="inventory-inline-button">This Month</button>}
    className="inventory-chart-card"
  >
    <div className="inventory-chart-wrap">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
          <XAxis axisLine={false} dataKey="category" tickLine={false} tick={{ fill: "#6b7f92", fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7f92", fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
            {data.map((item, index) => (
              <Cell key={item.category} fill={palette[index % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="inventory-chart-legend">
      {data.map((item, index) => (
        <div key={item.category}>
          <span className="inventory-chart-dot" style={{ backgroundColor: palette[index % palette.length] }} />
          <strong>{item.category}</strong>
          <span>{formatCurrency(item.value)}</span>
        </div>
      ))}
    </div>
  </SectionCard>
);

export default InventoryChartCards;
