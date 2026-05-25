import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useInventoryModule } from "../InventoryModuleContext";

const fields = [
  ["name", "Medicine Name"],
  ["genericName", "Generic Name"],
  ["brand", "Brand/Company"],
  ["category", "Category"],
  ["composition", "Composition"],
  ["batchNumber", "Batch Number"],
  ["barcode", "Barcode"],
  ["supplier", "Supplier"],
  ["unitType", "Unit Type"],
  ["purchasePrice", "Purchase Price", "number"],
  ["sellingPrice", "Selling Price", "number"],
  ["mrp", "MRP", "number"],
  ["gst", "GST %", "number"],
  ["discount", "Discount %", "number"],
  ["quantity", "Quantity", "number"],
  ["minimumStock", "Minimum Stock Level", "number"],
  ["rackLocation", "Rack/Shelf Location"],
  ["manufacturingDate", "Manufacturing Date", "date"],
  ["expiryDate", "Expiry Date", "date"],
  ["imageUrl", "Medicine Image URL"],
];

const MedicineModal = () => {
  const { medicineModalState, closeMedicineModal, saveMedicine, normalizeValue } = useInventoryModule();
  const [draft, setDraft] = useState(medicineModalState.medicine);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDraft(medicineModalState.medicine);
    setErrors({});
  }, [medicineModalState.medicine]);

  if (!medicineModalState.open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = saveMedicine(draft);
    if (!result.ok) {
      setErrors(result.errors);
    }
  };

  return (
    <div className="inventory-modal-backdrop" onClick={closeMedicineModal}>
      <section className="inventory-modal inventory-form-modal" onClick={(event) => event.stopPropagation()}>
        <div className="inventory-modal-head">
          <div>
            <h2>{medicineModalState.mode === "edit" ? "Edit Medicine" : "Add Medicine"}</h2>
            <p>Maintain batch, pricing, supplier, and shelf-level information in one place.</p>
          </div>
          <button type="button" className="icon-button" onClick={closeMedicineModal} aria-label="Close medicine form">
            <X size={18} />
          </button>
        </div>

        <form className="inventory-modal-body" onSubmit={handleSubmit}>
          <div className="inventory-form-grid">
            {fields.map(([field, label, type = "text"]) => (
              <label key={field} className="inventory-field">
                <span>{label}</span>
                <input
                  type={type}
                  value={draft[field] ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [field]: normalizeValue(field, event.target.value),
                    }))
                  }
                />
                {errors[field] ? <small>{errors[field]}</small> : null}
              </label>
            ))}
            <label className="inventory-field inventory-field-full">
              <span>Notes</span>
              <textarea
                value={draft.notes ?? ""}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
              />
            </label>
          </div>

          <div className="inventory-modal-foot">
            <button type="button" className="ghost-button" onClick={closeMedicineModal}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {medicineModalState.mode === "edit" ? "Save Changes" : "Add Medicine"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default MedicineModal;
