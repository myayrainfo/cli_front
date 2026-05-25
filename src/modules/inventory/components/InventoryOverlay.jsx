import { X } from "lucide-react";
import Badge from "../../../shared/components/Badge";
import { formatCurrency } from "../../../shared/utils/format";
import { useInventoryModule } from "../InventoryModuleContext";

const toneMap = {
  "In Stock": "success",
  "Low Stock": "warning",
  "Out of Stock": "danger",
  Expired: "danger",
  "Expiring Soon": "info",
};

export const InventoryDetailsDrawer = () => {
  const { detailsMedicine, closeMedicineDetails } = useInventoryModule();

  if (!detailsMedicine) return null;

  return (
    <div className="inventory-modal-backdrop" onClick={closeMedicineDetails}>
      <aside className="inventory-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="inventory-modal-head">
          <div>
            <h2>Medicine Details</h2>
            <p>Audit-friendly medicine information with pricing, shelf, and batch details.</p>
          </div>
          <button type="button" className="icon-button" onClick={closeMedicineDetails}>
            <X size={18} />
          </button>
        </div>
        <div className="inventory-details-grid">
          <div className="inventory-details-hero">
            <img src={detailsMedicine.imageUrl} alt={detailsMedicine.name} />
            <div>
              <h3>{detailsMedicine.name}</h3>
              <p>{detailsMedicine.genericName}</p>
              <Badge tone={toneMap[detailsMedicine.status] || "neutral"}>{detailsMedicine.status}</Badge>
            </div>
          </div>
          <div className="inventory-details-list">
            {[
              ["Code", detailsMedicine.code],
              ["Category", detailsMedicine.category],
              ["Supplier", detailsMedicine.supplier],
              ["Stock", detailsMedicine.quantity],
              ["Min Stock", detailsMedicine.minimumStock],
              ["Batch Number", detailsMedicine.batchNumber],
              ["Barcode", detailsMedicine.barcode],
              ["Rack Location", detailsMedicine.rackLocation],
              ["Purchase Price", formatCurrency(detailsMedicine.purchasePrice)],
              ["Selling Price", formatCurrency(detailsMedicine.sellingPrice)],
              ["MRP", formatCurrency(detailsMedicine.mrp)],
              ["GST", `${detailsMedicine.gst}%`],
              ["Discount", `${detailsMedicine.discount}%`],
              ["Manufacturing Date", detailsMedicine.manufacturingDate],
              ["Expiry Date", detailsMedicine.expiryDate],
              ["Notes", detailsMedicine.notes || "-"],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export const InventoryConfirmDialog = () => {
  const { deleteCandidate, cancelDeleteMedicine, confirmDeleteMedicine } = useInventoryModule();

  if (!deleteCandidate) return null;

  return (
    <div className="inventory-modal-backdrop" onClick={cancelDeleteMedicine}>
      <section className="inventory-modal inventory-confirm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="inventory-modal-head">
          <div>
            <h2>Delete Medicine</h2>
            <p>This will remove {deleteCandidate.name} from the mock inventory state.</p>
          </div>
          <button type="button" className="icon-button" onClick={cancelDeleteMedicine}>
            <X size={18} />
          </button>
        </div>
        <div className="inventory-confirm-actions">
          <button type="button" className="ghost-button" onClick={cancelDeleteMedicine}>
            Cancel
          </button>
          <button type="button" className="primary-button inventory-danger-button" onClick={confirmDeleteMedicine}>
            Delete
          </button>
        </div>
      </section>
    </div>
  );
};

export const InventoryToastStack = () => {
  const { toasts } = useInventoryModule();

  if (!toasts.length) return null;

  return (
    <div className="inventory-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`inventory-toast inventory-toast-${toast.tone}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
};
