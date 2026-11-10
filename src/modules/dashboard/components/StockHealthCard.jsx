import { ShieldAlert } from "lucide-react";

const StockHealthCard = ({ items }) => (
  <section className="card dashboard-health-card">
    <div className="dashboard-card-heading">
      <span className="dashboard-card-chip tone-amber">
        <ShieldAlert size={16} />
      </span>
      <div>
        <h3>Stock Health</h3>
        <p>Current inventory condition</p>
      </div>
    </div>

    <div className="dashboard-stock-health-list">
      {items.map((item) => (
        <div key={item.label} className="dashboard-stock-health-row">
          <div className="dashboard-stock-health-copy">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default StockHealthCard;
