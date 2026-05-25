import Badge from "../../../shared/components/Badge";
import SectionCard from "../../../shared/components/SectionCard";

const toneMap = {
  "Low Stock": "warning",
  "Out of Stock": "danger",
};

const LowStockList = ({ items }) => (
  <SectionCard
    title="Top Low Stock Items"
    action={<button type="button" className="inventory-inline-button">Reorder View</button>}
  >
    <div className="inventory-list-stack">
      {items.map((item) => (
        <article key={item.id} className="inventory-list-item">
          <div>
            <strong>{item.name}</strong>
            <p>
              Current {item.quantity} • Minimum {item.minimumStock}
            </p>
          </div>
          <Badge tone={toneMap[item.status] || "warning"}>{item.status}</Badge>
        </article>
      ))}
    </div>
  </SectionCard>
);

export default LowStockList;
