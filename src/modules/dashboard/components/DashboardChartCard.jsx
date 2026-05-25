import { motion } from "framer-motion";

const DashboardChartCard = ({
  title,
  period = "This Week",
  icon: Icon,
  stats = [],
  children,
  accent = "green",
}) => (
  <motion.section
    className={`card dashboard-chart-card dashboard-chart-${accent}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="dashboard-card-head">
      <div className="dashboard-card-title">
        <span className="dashboard-card-icon">
          <Icon size={18} />
        </span>
        <div>
          <h3>{title}</h3>
        </div>
      </div>
      <button type="button" className="dashboard-filter-chip">
        {period}
      </button>
    </div>

    <div className="dashboard-chart-wrap">{children}</div>

    <div className="dashboard-mini-stats">
      {stats.map((item) => (
        <div key={item.label} className="dashboard-mini-stat">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  </motion.section>
);

export default DashboardChartCard;
