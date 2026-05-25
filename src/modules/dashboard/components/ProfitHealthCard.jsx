import { Wallet } from "lucide-react";

const ProfitHealthCard = ({ profitValue, supplierDues, customerDues }) => (
  <section className="card dashboard-health-card dashboard-health-profit">
    <div className="dashboard-card-heading">
      <span className="dashboard-card-chip tone-rose">
        <Wallet size={16} />
      </span>
      <div>
        <h3>Profit Health</h3>
        <p>Net Position</p>
      </div>
    </div>
    <strong className="dashboard-health-value">{profitValue}</strong>
    <p className="dashboard-health-note">Below purchase spend today</p>
    <div className="dashboard-mini-card-stats compact">
      <div>
        <span>Supplier Dues</span>
        <strong>{supplierDues}</strong>
      </div>
      <div>
        <span>Customer Dues</span>
        <strong>{customerDues}</strong>
      </div>
    </div>
  </section>
);

export default ProfitHealthCard;
