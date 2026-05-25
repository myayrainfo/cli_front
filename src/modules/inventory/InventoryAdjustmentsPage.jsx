import { Plus, X } from "lucide-react";
import { useState } from "react";
import Badge from "../../shared/components/Badge";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useInventoryModule } from "./InventoryModuleContext";

const emptyAdjustment = {
  date: "2025-08-01",
  medicineId: "",
  batchNumber: "",
  newQty: 0,
  reason: "",
  approvedBy: "",
};

const InventoryAdjustmentsPage = () => {
  const { adjustments, medicines, addAdjustment } = useInventoryModule();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyAdjustment);

  return (
    <div className="page-stack inventory-page">
      <PageHeader
        title="Adjustments"
        subtitle="Manual stock corrections with difference tracking and approval-ready records."
        action={
          <button type="button" className="primary-button inventory-add-button" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Adjustment
          </button>
        }
      />

      <div className="inventory-summary-grid">
        {[
          ["Adjustments Today", "6", "Cycle counts and corrections"],
          ["Pending Approval", "2", "Supervisor review needed"],
          ["Net Difference", "-13", "Across current period"],
        ].map(([label, value, helper]) => (
          <article key={label} className="inventory-summary-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{helper}</p>
          </article>
        ))}
      </div>

      <SectionCard title="Adjustment Log">
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Old Qty</th>
                <th>New Qty</th>
                <th>Difference</th>
                <th>Reason</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.medicineName}</td>
                  <td>{item.batchNumber}</td>
                  <td>{item.oldQty}</td>
                  <td>{item.newQty}</td>
                  <td>
                    <Badge tone={item.difference >= 0 ? "success" : "danger"}>
                      {item.difference >= 0 ? `+${item.difference}` : item.difference}
                    </Badge>
                  </td>
                  <td>{item.reason}</td>
                  <td>{item.approvedBy}</td>
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
                <h2>Add Adjustment</h2>
                <p>Capture corrected stock counts and route them through an approval-friendly flow.</p>
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
                <span>New Quantity</span>
                <input type="number" value={form.newQty} onChange={(event) => setForm((current) => ({ ...current, newQty: Number(event.target.value) }))} />
              </label>
              <label className="inventory-field">
                <span>Approved By</span>
                <input value={form.approvedBy} onChange={(event) => setForm((current) => ({ ...current, approvedBy: event.target.value }))} />
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
                  addAdjustment(form);
                  setForm(emptyAdjustment);
                  setModalOpen(false);
                }}
              >
                Save Adjustment
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default InventoryAdjustmentsPage;
