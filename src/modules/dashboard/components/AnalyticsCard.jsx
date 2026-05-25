import { motion } from "framer-motion";

const AnalyticsCard = ({ title, action, children, className = "" }) => (
  <motion.section
    className={`card analytics-card ${className}`.trim()}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="analytics-card-head">
      <h3>{title}</h3>
      {action ? <div>{action}</div> : null}
    </div>
    {children}
  </motion.section>
);

export default AnalyticsCard;
