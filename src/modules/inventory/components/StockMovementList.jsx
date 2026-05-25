import Badge from "../../../shared/components/Badge";
import SectionCard from "../../../shared/components/SectionCard";

const toneMap = {
  "Stock In": "success",
  "Stock Out": "warning",
  Adjustment: "info",
  Return: "warning",
  "Expired Removal": "danger",
};

const StockMovementList = ({ movements }) => (
  <SectionCard
    title="Recent Stock Movements"
    action={<button type="button" className="inventory-inline-button">View Log</button>}
  >
    <div className="inventory-list-stack">
      {movements.map((movement) => (
        <article key={movement.id} className="inventory-list-item">
          <div>
            <strong>{movement.medicineName}</strong>
            <p>
              Batch {movement.batchNumber} • {movement.date}
            </p>
          </div>
          <div className="inventory-list-trailing">
            <Badge tone={toneMap[movement.type] || "neutral"}>{movement.type}</Badge>
            <strong className={movement.type === "Stock In" ? "inventory-positive" : "inventory-negative"}>
              {movement.type === "Stock In" || movement.type === "Adjustment" ? "+" : "-"}
              {movement.quantity}
            </strong>
          </div>
        </article>
      ))}
    </div>
  </SectionCard>
);

export default StockMovementList;
