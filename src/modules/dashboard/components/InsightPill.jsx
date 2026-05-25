const InsightPill = ({ label, value, tone = "default" }) => (
  <div className={`insight-pill insight-pill-${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default InsightPill;
