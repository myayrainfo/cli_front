import {
  AlertTriangle,
  CircleDollarSign,
  Clock3,
  PackageMinus,
  PillBottle,
  ShieldAlert,
  Zap,
} from "lucide-react";

const iconMap = {
  amber: AlertTriangle,
  blue: ShieldAlert,
  red: PackageMinus,
  green: CircleDollarSign,
  purple: PillBottle,
  teal: Zap,
  orange: Clock3,
};

const InsightStrip = ({ items }) => (
  <section className="card insight-strip">
    {items.map((item, index) => {
      const Icon = iconMap[item.icon] || CircleDollarSign;
      return (
        <div key={item.label} className="insight-strip-item">
          <span className={`insight-strip-icon tone-${item.tone}`}>
            <Icon size={16} />
          </span>
          <div className="insight-strip-copy">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          {index < items.length - 1 ? <span className="insight-strip-divider" aria-hidden="true" /> : null}
        </div>
      );
    })}
  </section>
);

export default InsightStrip;
