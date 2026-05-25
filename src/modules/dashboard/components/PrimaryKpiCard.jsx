import { motion } from "framer-motion";

const Sparkline = ({ values = [], color = "#10b981" }) => {
  if (!values.length) return null;

  const width = 88;
  const height = 36;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="primary-kpi-sparkline" viewBox={`0 0 ${width} ${height}`} role="presentation" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const ProgressRing = ({ value = 0, color = "#f59e0b" }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.max(0, Math.min(value, 100)) / 100) * circumference;

  return (
    <svg className="primary-kpi-ring" viewBox="0 0 64 64" role="presentation" aria-hidden="true">
      <circle cx="32" cy="32" r={radius} className="primary-kpi-ring-track" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        className="primary-kpi-ring-value"
        style={{
          stroke: color,
          strokeDasharray: circumference,
          strokeDashoffset: dashOffset,
        }}
      />
    </svg>
  );
};

const PrimaryKpiCard = ({
  title,
  value,
  trend,
  tone = "green",
  icon: Icon,
  sparkline,
  ringValue,
  ringColor,
  accentColor,
}) => (
  <motion.section
    className={`card primary-kpi-card primary-kpi-${tone}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="primary-kpi-head">
      <span className="primary-kpi-icon">
        <Icon size={20} />
      </span>
      <div className="primary-kpi-visual">
        {typeof ringValue === "number" ? (
          <ProgressRing value={ringValue} color={ringColor} />
        ) : (
          <Sparkline values={sparkline} color={accentColor} />
        )}
      </div>
    </div>
    <div className="primary-kpi-copy">
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{trend}</span>
    </div>
  </motion.section>
);

export default PrimaryKpiCard;
