import { AlertTriangle, CircleDollarSign, Package, ShieldAlert, Siren } from "lucide-react";

const iconMap = {
  blue: Package,
  teal: CircleDollarSign,
  amber: AlertTriangle,
  rose: ShieldAlert,
  sky: Siren,
};

const InventoryKpiCards = ({ cards }) => (
  <div className="inventory-kpi-grid">
    {cards.map((card) => {
      const Icon = iconMap[card.tone] || Package;
      return (
        <article key={card.label} className={`inventory-kpi-card inventory-kpi-${card.tone}`}>
          <div>
            <span className="inventory-kpi-label">{card.label}</span>
            <h3>{card.value}</h3>
            <p>{card.helper}</p>
          </div>
          <span className="inventory-kpi-icon">
            <Icon size={20} />
          </span>
        </article>
      );
    })}
  </div>
);

export default InventoryKpiCards;
