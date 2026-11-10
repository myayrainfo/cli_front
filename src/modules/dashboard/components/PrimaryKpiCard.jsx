const PrimaryKpiCard = ({
  title,
  value,
  trend,
  tone = "green",
  icon: Icon,
}) => (
  <section
    className={`card primary-kpi-card primary-kpi-${tone}`}
  >
    <div className="primary-kpi-head">
      <span className="primary-kpi-icon">
        <Icon size={20} />
      </span>
    </div>
    <div className="primary-kpi-copy">
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{trend}</span>
    </div>
  </section>
);

export default PrimaryKpiCard;
