import { Pill } from "lucide-react";

const FastMovingMedicinesCard = ({ rows, onViewAll }) => (
  <section className="card dashboard-operations-card">
    <div className="dashboard-card-toolbar">
      <div className="dashboard-card-heading">
        <span className="dashboard-card-chip tone-green">
          <Pill size={16} />
        </span>
        <div>
          <h3>Top Fast-Moving Medicines</h3>
        </div>
      </div>
      <button type="button" className="dashboard-inline-button" onClick={onViewAll}>
        View All
      </button>
    </div>

    <div className="dashboard-table-wrap">
      <table className="dashboard-mini-table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Sold Qty</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.medicine}-${index}`}>
              <td>{row.medicine}</td>
              <td>{row.soldQty}</td>
              <td>{row.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default FastMovingMedicinesCard;
