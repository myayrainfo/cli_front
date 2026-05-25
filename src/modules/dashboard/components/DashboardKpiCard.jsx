import { motion } from "framer-motion";

const DashboardKpiCard = ({ title, value, detail, tone = "default", icon: Icon }) => (
  <motion.section
    className={`card dashboard-kpi-card dashboard-kpi-${tone}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="dashboard-kpi-top">
      <div>
        <p className="eyebrow">{title}</p>
        <h3>{value}</h3>
      </div>
      <span className="dashboard-kpi-icon">
        <Icon size={18} />
      </span>
    </div>
    <p className="dashboard-kpi-detail">{detail}</p>
  </motion.section>
);

export default DashboardKpiCard;
