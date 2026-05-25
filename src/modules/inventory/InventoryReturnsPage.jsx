import { Plus, X } from "lucide-react";
import { useState } from "react";
import Badge from "../../shared/components/Badge";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useInventoryModule } from "./InventoryModuleContext";

const emptyReturn = {
  date: "2025-08-01",
  medicineId: "",
  batchNumber: "",
  quantity: 1,
  returnType: "Supplier Return",
  partner: "",
  reason: "",
  status: "Pending",
};

const toneMap = {
  Pending: "warning",
  Approved: "info",
  Completed: "success",
  Rejected: "danger",
};

const InventoryReturnsPage = () => {
  const { returns, medicines, addReturn } = useInventoryModule();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyReturn);

  return (
    <div className="page-stack inventory-page">
      <PageHeader
        title="Returns"
        subtitle="Track supplier and customer returns with status visibility and reason codes."
        action={
          <button type="button" className="primary-button inventory-add-button" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Return
          </button>
        }
      />

      <div className="inventory-summary-grid">
        {[
          ["Pending Returns", "14", "Waiting approval"],
          ["Approved Returns", "9", "Ready for dispatch"],
          ["Completed Returns", "24", "Closed this month"],
        ].map(([label, value, helper]) => (
          <article key={label} className="inventory-summary-card">
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{helper}</p>
          </article>
        ))}
      </div>

      <SectionCard title="Return Register">
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Quantity</th>
                <th>Return Type</th>
                <th>Supplier/Customer</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.medicineName}</td>
                  <td>{item.batchNumber}</td>
                  <td>{item.quantity}</td>
                  <td>{item.returnType}</td>
                  <td>{item.partner}</td>
                  <td>{item.reason}</td>
                  <td>
                    <Badge tone={toneMap[item.status] || "neutral"}>{item.status}</Badge>
                  </td>
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
                <h2>Add Return</h2>
                <p>Create supplier or customer return records without leaving the inventory workspace.</p>
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
                <span>Quantity</span>
                <input type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))} />
              </label>
              <label className="inventory-field">
                <span>Return Type</span>
                <select value={form.returnType} onChange={(event) => setForm((current) => ({ ...current, returnType: event.target.value }))}>
                  {["Supplier Return", "Customer Return"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inventory-field">
                <span>Supplier / Customer</span>
                <input value={form.partner} onChange={(event) => setForm((current) => ({ ...current, partner: event.target.value }))} />
              </label>
              <label className="inventory-field">
                <span>Status</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  {["Pending", "Approved", "Completed", "Rejected"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
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
                  addReturn(form);
                  setForm(emptyReturn);
                  setModalOpen(false);
                }}
              >
                Save Return
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default InventoryReturnsPage;
