import { AlertTriangle } from "lucide-react";

const RecentAlertsCard = ({ alerts, onViewAll }) => (
  <section className="card dashboard-operations-card">
    <div className="dashboard-card-toolbar">
      <div className="dashboard-card-heading">
        <span className="dashboard-card-chip tone-red">
          <AlertTriangle size={16} />
        </span>
        <div>
          <h3>Recent Alerts</h3>
        </div>
      </div>
      <button type="button" className="dashboard-inline-button" onClick={onViewAll}>
        View All
      </button>
    </div>

    <div className="dashboard-alert-rows">
      {alerts.map((alert) => (
        <div key={`${alert.title}-${alert.time}`} className="dashboard-alert-item">
          <span className={`dashboard-alert-item-icon tone-${alert.tone || "red"}`}>
            <AlertTriangle size={14} />
          </span>
          <div className="dashboard-alert-item-copy">
            <strong>{alert.title}</strong>
            <p>{alert.description}</p>
          </div>
          <span className="dashboard-alert-item-time">{alert.time}</span>
        </div>
      ))}
    </div>
  </section>
);

export default RecentAlertsCard;
