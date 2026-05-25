import { motion } from "framer-motion";
import { Plus, ShoppingCart } from "lucide-react";

const DashboardHero = ({ userName, onNewBill, onAddMedicine, onPurchaseEntry }) => (
  <motion.section
    className="dashboard-hero"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="dashboard-hero-copy">
      <span className="dashboard-section-label">Operations overview</span>
      <h1>Good evening, {userName} 👋</h1>
      <p>Here is your pharmacy and clinic operations overview for today.</p>
    </div>

    <div className="dashboard-hero-actions">
      <div className="dashboard-date-selector">
        <span>Date Range</span>
        <strong>19 May 2026 - 23 May 2026</strong>
      </div>
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
  </motion.section>
);

export default DashboardHero;
