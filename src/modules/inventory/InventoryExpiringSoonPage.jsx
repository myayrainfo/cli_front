import { useMemo, useState } from "react";
import Badge from "../../shared/components/Badge";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useInventoryModule } from "./InventoryModuleContext";

const InventoryExpiringSoonPage = () => {
  const { medicines, getDaysUntil, addToast } = useInventoryModule();
  const [windowFilter, setWindowFilter] = useState("60");

  const filtered = useMemo(
    () =>
      medicines.filter((medicine) => {
        const daysLeft = getDaysUntil(medicine.expiryDate);
        if (windowFilter === "expired") return daysLeft < 0;
        if (daysLeft < 0) return false;
        return daysLeft <= Number(windowFilter);
      }),
    [getDaysUntil, medicines, windowFilter]
  );

  return (
    <div className="page-stack inventory-page">
      <PageHeader title="Expiring Soon" subtitle="Monitor near-expiry batches and act before inventory value is lost." />

      <div className="inventory-chip-row">
        {[
          ["30", "30 days"],
          ["60", "60 days"],
          ["90", "90 days"],
          ["expired", "Expired"],
        ].map(([value, label]) => (
          <button key={value} type="button" className={`inventory-chip ${windowFilter === value ? "active" : ""}`} onClick={() => setWindowFilter(value)}>
            {label}
          </button>
        ))}
      </div>

      <SectionCard title="Expiry Tracking">
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const daysLeft = getDaysUntil(item.expiryDate);
                const status = daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "Urgent" : "Monitor";
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.batchNumber}</td>
                    <td>{item.quantity}</td>
                    <td>{item.expiryDate}</td>
                    <td>{daysLeft < 0 ? "Expired" : `${daysLeft} days`}</td>
                    <td>
                      <Badge tone={daysLeft < 0 ? "danger" : daysLeft <= 30 ? "warning" : "info"}>{status}</Badge>
                    </td>
                    <td>
                      <div className="inventory-row-actions">
                        <button type="button" className="ghost-button inventory-inline-primary" onClick={() => addToast(`${item.name} marked for return.`)}>
                          Mark for Return
                        </button>
                        <button type="button" className="ghost-button inventory-inline-primary" onClick={() => addToast(`${item.name} flagged for discount clearance.`, "info")}>
                          Discount
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default InventoryExpiringSoonPage;
