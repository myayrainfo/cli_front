import { Plus, ShoppingCart } from "lucide-react";

const DashboardHero = ({ userName, onNewBill, onAddMedicine, onPurchaseEntry }) => (
  <section
    className="dashboard-hero"
  >
    <div className="dashboard-hero-copy">
      <span className="dashboard-section-label">Operations overview</span>
      <h1>Welcome back, {userName}</h1>
      <p>Here is your pharmacy and clinic operations overview for today.</p>
    </div>

    <div className="dashboard-hero-actions">
      <div className="dashboard-quick-actions">
        <button type="button" className="primary-button" onClick={onNewBill}>
          <Plus size={16} />
          New Bill
        </button>
        <button type="button" className="ghost-button" onClick={onAddMedicine}>
          <Plus size={16} />
          Add Medicine
        </button>
        <button type="button" className="ghost-button" onClick={onPurchaseEntry}>
          <ShoppingCart size={16} />
          Purchase Entry
        </button>
      </div>
    </div>
  </section>
);

export default DashboardHero;
