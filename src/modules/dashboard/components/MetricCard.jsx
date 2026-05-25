import { motion } from "framer-motion";

const MetricCard = ({
  title,
  value,
  detail,
  trendLabel,
  progress = 0,
  tone = "blue",
  icon: Icon,
}) => (
  <motion.section
    className={`card metric-card metric-card-${tone}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="metric-card-top">
      <span className="metric-card-icon">
        <Icon size={18} />
      </span>
      <span className="metric-card-trend">{trendLabel}</span>
    </div>
    <div className="metric-card-copy">
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{detail}</span>
    </div>
    <div className="metric-progress">
      <span style={{ width: `${Math.max(6, Math.min(progress, 100))}%` }} />
    </div>
  </motion.section>
);

export default MetricCard;
