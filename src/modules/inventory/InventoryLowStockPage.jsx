import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import Badge from "../../shared/components/Badge";
import { useInventoryModule } from "./InventoryModuleContext";

const InventoryLowStockPage = () => {
  const { lowStockItems, addToast } = useInventoryModule();

  const cards = [
    { label: "Critical Count", value: "11", helper: "Below 50% threshold" },
    { label: "Reorder Value", value: "₹1,48,700", helper: "Suggested purchase value" },
    { label: "Suppliers Pending", value: "7", helper: "Awaiting PO confirmation" },
  ];

  return (
    <div className="page-stack inventory-page">
      <PageHeader
        title="Low Stock"
        subtitle="Prioritize reorder-needed items before they affect dispensing continuity."
      />

      <div className="inventory-summary-grid">
        {cards.map((card) => (
          <article key={card.label} className="inventory-summary-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </div>

      <SectionCard title="Reorder Queue">
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Current Stock</th>
                <th>Minimum Stock</th>
                <th>Reorder Quantity</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.minimumStock}</td>
                  <td>{Math.max(0, item.minimumStock * 2 - item.quantity)}</td>
                  <td>{item.supplier}</td>
                  <td>
                    <Badge tone={item.status === "Out of Stock" ? "danger" : "warning"}>{item.status}</Badge>
                  </td>
                  <td>
                    <button type="button" className="primary-button inventory-inline-primary" onClick={() => addToast(`Purchase request created for ${item.name}.`)}>
                      Create Purchase Request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default InventoryLowStockPage;
