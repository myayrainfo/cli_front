import { motion } from "framer-motion";

const StatCard = ({ title, value, subtitle, tone = "default" }) => (
  <motion.div
    className={`card stat-card tone-${tone}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <p className="eyebrow">{title}</p>
    <h3>{value}</h3>
    {subtitle ? <p className="muted">{subtitle}</p> : null}
  </motion.div>
);

export default StatCard;
