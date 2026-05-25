import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../shared/components/Badge";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useInventoryModule } from "./InventoryModuleContext";

const movementTones = {
  "Stock In": "success",
  "Stock Out": "warning",
  Adjustment: "info",
  Return: "warning",
  "Expired Removal": "danger",
};

const emptyMovement = {
  date: "2025-08-01",
  medicineId: "",
  batchNumber: "",
  type: "Stock In",
  quantity: 1,
  reason: "",
  handledBy: "",
};

const InventoryStockMovementsPage = () => {
  const { movements, medicines, addMovement } = useInventoryModule();
  const [typeFilter, setTypeFilter] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyMovement);

  const filteredMovements = useMemo(
    () =>
      movements.filter((item) => {
        if (typeFilter && item.type !== typeFilter) return false;
        if (medicineFilter && item.medicineId !== medicineFilter) return false;
        if (dateFilter && item.date !== dateFilter) return false;
        return true;
      }),
    [dateFilter, medicineFilter, movements, typeFilter]
  );

  const summaryCards = [
    { label: "Movements Today", value: "46", helper: "Stock flow synced" },
    { label: "Stock In Entries", value: "18", helper: "Supplier receipts" },
    { label: "Stock Out Entries", value: "21", helper: "Dispensed & usage" },
    { label: "Audit Exceptions", value: "3", helper: "Need approval" },
  ];

  return (
    <div className="page-stack inventory-page">
      <PageHeader
        title="Stock Movements"
        subtitle="Track inventory in and out with batch, reason, and handler-level traceability."
        action={
          <button type="button" className="primary-button inventory-add-button" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Movement
          </button>
        }
      />

      <div className="inventory-summary-grid four-up">
        {summaryCards.map((card) => (
          <article key={card.label} className="inventory-summary-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </div>

      <SectionCard title="Movement Register">
        <div className="inventory-filter-row">
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">All Types</option>
            {["Stock In", "Stock Out", "Adjustment", "Return", "Expired Removal"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select value={medicineFilter} onChange={(event) => setMedicineFilter(event.target.value)}>
            <option value="">All Medicines</option>
            {medicines.map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.name}
              </option>
            ))}
          </select>
          <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
        </div>

        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Handled By</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.medicineName}</td>
                  <td>{item.batchNumber}</td>
                  <td>
                    <Badge tone={movementTones[item.type] || "neutral"}>{item.type}</Badge>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.reason}</td>
                  <td>{item.handledBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {modalOpen ? (
        <div className="inventory-modal-backdrop" onClick={() => setModalOpen(false)}>
          <section className="inventory-modal inventory-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="inventory-modal-head">
              <div>
                <h2>Add Movement</h2>
                <p>Record stock movement for inbound, outbound, return, adjustment, or expired removal.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="inventory-form-grid">
              <label className="inventory-field">
                <span>Date</span>
                <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </label>
              <label className="inventory-field">
                <span>Medicine</span>
                <select value={form.medicineId} onChange={(event) => setForm((current) => ({ ...current, medicineId: event.target.value }))}>
                  <option value="">Select medicine</option>
                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inventory-field">
                <span>Batch</span>
                <input value={form.batchNumber} onChange={(event) => setForm((current) => ({ ...current, batchNumber: event.target.value }))} />
              </label>
              <label className="inventory-field">
                <span>Type</span>
                <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                  {["Stock In", "Stock Out", "Adjustment", "Return", "Expired Removal"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inventory-field">
                <span>Quantity</span>
                <input type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} />
              </label>
              <label className="inventory-field">
                <span>Handled By</span>
                <input value={form.handledBy} onChange={(event) => setForm((current) => ({ ...current, handledBy: event.target.value }))} />
              </label>
              <label className="inventory-field inventory-field-full">
                <span>Reason</span>
                <textarea rows={3} value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
              </label>
            </div>
            <div className="inventory-confirm-actions">
              <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  addMovement(form);
                  setForm(emptyMovement);
                  setModalOpen(false);
                }}
              >
                Save Movement
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default InventoryStockMovementsPage;
