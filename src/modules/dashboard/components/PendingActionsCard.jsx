import { ArrowRight, CircleDollarSign, PillBottle, ShieldAlert, ShoppingBasket } from "lucide-react";

const icons = [ShieldAlert, CircleDollarSign, PillBottle, ShoppingBasket];

const PendingActionsCard = ({ actions }) => (
  <section className="card dashboard-operations-card">
    <div className="dashboard-card-toolbar">
      <div className="dashboard-card-heading">
        <span className="dashboard-card-chip tone-purple">
          <ArrowRight size={16} />
        </span>
        <div>
          <h3>Pending Actions</h3>
        </div>
      </div>
    </div>

    <div className="dashboard-pending-actions">
      {actions.map((action, index) => {
        const Icon = icons[index] || ArrowRight;
        return (
          <button key={action.label} type="button" className="dashboard-pending-row" onClick={action.onClick}>
            <span className={`dashboard-pending-icon tone-${action.tone}`}>
              <Icon size={14} />
            </span>
            <span className="dashboard-pending-copy">{action.label}</span>
            <span className="dashboard-pending-badge">{action.count}</span>
            <ArrowRight size={14} />
          </button>
        );
      })}
    </div>
  </section>
);

export default PendingActionsCard;
