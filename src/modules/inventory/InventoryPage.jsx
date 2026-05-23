import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import StatCard from "../../shared/components/StatCard";
import { useLayoutData } from "../../shared/layouts/LayoutDataContext";
import { formatCurrency, formatDate } from "../../shared/utils/format";

const initialMedicine = {
  name: "",
  genericName: "",
  company: "",
  category: "",
  composition: "",
  mrp: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  gst: 0,
  discountRule: "",
  rackLocation: "",
  barcodeValue: "",
  imageUrl: "https://placehold.co/120x120",
  minimumStock: 0,
  batches: [
    {
      batchNumber: "",
      manufacturingDate: "",
      expiryDate: "",
      quantity: 0,
    },
  ],
};

const InventoryPage = () => {
  const { refreshShellData } = useLayoutData();
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(initialMedicine);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadMedicines = async () => {
    try {
      const response = await api.get("/medicines");
      setMedicines(response.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, form);
      } else {
        await api.post("/medicines", form);
      }
      setForm(initialMedicine);
      setEditingId("");
      loadMedicines();
      refreshShellData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to save medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMedicine = async (id) => {
    await api.delete(`/medicines/${id}`);
    loadMedicines();
    refreshShellData();
  };

  const editMedicine = (medicine) => {
    setEditingId(medicine._id);
    setForm({
      name: medicine.name || "",
      genericName: medicine.genericName || "",
      company: medicine.company || "",
      category: medicine.category || "",
      composition: medicine.composition || "",
      mrp: medicine.mrp || 0,
      purchasePrice: medicine.purchasePrice || 0,
      sellingPrice: medicine.sellingPrice || 0,
      gst: medicine.gst || 0,
      discountRule: medicine.discountRule || "",
      rackLocation: medicine.rackLocation || "",
      barcodeValue: medicine.barcodeValue || "",
      imageUrl: medicine.imageUrl || "https://placehold.co/120x120",
      minimumStock: medicine.minimumStock || 0,
      batches: medicine.batches?.length
        ? [
            {
              batchNumber: medicine.batches[0].batchNumber || "",
              manufacturingDate: medicine.batches[0].manufacturingDate?.slice(0, 10) || "",
              expiryDate: medicine.batches[0].expiryDate?.slice(0, 10) || "",
              quantity: medicine.batches[0].quantity || 0,
            },
          ]
        : initialMedicine.batches,
    });
  };

  const lowStock = medicines.filter((medicine) => medicine.totalStock <= medicine.minimumStock);

  if (loading) return <Loader label="Loading inventory..." />;

  return (
    <div className="page-stack">
      <PageHeader
        title="Inventory"
        subtitle="Manage medicines, batches, stock movement, racks, barcodes, and substitute-ready catalog data."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="split-grid inventory-layout">
        <SectionCard title={editingId ? "Edit medicine" : "Add medicine form/modal"}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input placeholder="Medicine name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <input placeholder="Generic name" value={form.genericName} onChange={(e) => setForm((prev) => ({ ...prev, genericName: e.target.value }))} />
            <input placeholder="Brand/company" value={form.company} onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} />
            <input placeholder="Medicine category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
            <input placeholder="Composition" value={form.composition} onChange={(e) => setForm((prev) => ({ ...prev, composition: e.target.value }))} />
            <input placeholder="MRP" type="number" value={form.mrp} onChange={(e) => setForm((prev) => ({ ...prev, mrp: Number(e.target.value) }))} />
            <input placeholder="Purchase price" type="number" value={form.purchasePrice} onChange={(e) => setForm((prev) => ({ ...prev, purchasePrice: Number(e.target.value) }))} />
            <input placeholder="Selling price" type="number" value={form.sellingPrice} onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: Number(e.target.value) }))} />
            <input placeholder="GST/tax" type="number" value={form.gst} onChange={(e) => setForm((prev) => ({ ...prev, gst: Number(e.target.value) }))} />
            <input placeholder="Discount rules" value={form.discountRule} onChange={(e) => setForm((prev) => ({ ...prev, discountRule: e.target.value }))} />
            <input placeholder="Rack/shelf location" value={form.rackLocation} onChange={(e) => setForm((prev) => ({ ...prev, rackLocation: e.target.value }))} />
            <input placeholder="Barcode value" value={form.barcodeValue} onChange={(e) => setForm((prev) => ({ ...prev, barcodeValue: e.target.value }))} />
            <input placeholder="Medicine image URL" value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
            <input placeholder="Minimum stock" type="number" value={form.minimumStock} onChange={(e) => setForm((prev) => ({ ...prev, minimumStock: Number(e.target.value) }))} />
            <input placeholder="Batch number" value={form.batches[0].batchNumber} onChange={(e) => setForm((prev) => ({ ...prev, batches: [{ ...prev.batches[0], batchNumber: e.target.value }] }))} />
            <input type="date" value={form.batches[0].manufacturingDate} onChange={(e) => setForm((prev) => ({ ...prev, batches: [{ ...prev.batches[0], manufacturingDate: e.target.value }] }))} />
            <input type="date" value={form.batches[0].expiryDate} onChange={(e) => setForm((prev) => ({ ...prev, batches: [{ ...prev.batches[0], expiryDate: e.target.value }] }))} />
            <input placeholder="Stock quantity" type="number" value={form.batches[0].quantity} onChange={(e) => setForm((prev) => ({ ...prev, batches: [{ ...prev.batches[0], quantity: Number(e.target.value) }] }))} />
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Medicine" : "Add Medicine"}
            </button>
            {editingId ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setEditingId("");
                  setForm(initialMedicine);
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </form>
        </SectionCard>

        <div className="page-stack compact-gap">
          <StatCard title="Low-stock reorder alerts" value={lowStock.length} tone="warning" />
          <StatCard title="Batch-wise stock tracking" value={medicines.reduce((sum, medicine) => sum + (medicine.batches?.length || 0), 0)} tone="info" />
          <StatCard title="Rack-wise stock tracking" value={new Set(medicines.map((medicine) => medicine.rackLocation)).size} tone="default" />
          <SectionCard title="Stock audit placeholder">
            <p className="muted">
              Track stock in/out, stock adjustment, barcode generation, and substitute suggestions
              from this grouped inventory hub.
            </p>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Medicine table">
        <DataTable
          columns={[
            { key: "name", label: "Medicine name" },
            { key: "genericName", label: "Generic name" },
            { key: "company", label: "Company" },
            { key: "category", label: "Category" },
            { key: "mrp", label: "MRP", render: (row) => formatCurrency(row.mrp) },
            { key: "sellingPrice", label: "Selling price", render: (row) => formatCurrency(row.sellingPrice) },
            { key: "totalStock", label: "Total stock" },
            { key: "rackLocation", label: "Rack" },
            {
              key: "expiryStatus",
              label: "Expiry status",
              render: (row) => (
                <Badge
                  tone={
                    row.expiryStatus === "Expired"
                      ? "danger"
                      : row.expiryStatus === "Near Expiry"
                        ? "warning"
                        : "success"
                  }
                >
                  {row.expiryStatus}
                </Badge>
              ),
            },
            {
              key: "action",
              label: "Action",
              render: (row) => (
                <div className="action-row">
                  <button className="text-button" type="button" onClick={() => editMedicine(row)}>
                    Edit
                  </button>
                  <button className="text-button danger" type="button" onClick={() => deleteMedicine(row._id)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={medicines}
        />
      </SectionCard>

      <div className="split-grid">
        <SectionCard title="Batch-wise stock tracking">
          <DataTable
            columns={[
              { key: "medicine", label: "Medicine", render: (row) => row.name },
              {
                key: "batchSummary",
                label: "Batch summary",
                render: (row) =>
                  row.batches?.map((batch) => `${batch.batchNumber} (${batch.quantity})`).join(", ") || "-",
              },
              {
                key: "expiryDates",
                label: "Expiry dates",
                render: (row) =>
                  row.batches?.map((batch) => formatDate(batch.expiryDate)).join(", ") || "-",
              },
            ]}
            rows={medicines}
          />
        </SectionCard>

        <SectionCard title="Rack-wise stock tracking">
          <DataTable
            columns={[
              { key: "name", label: "Medicine" },
              { key: "rackLocation", label: "Rack/shelf" },
              { key: "barcodeValue", label: "Barcode generation" },
              {
                key: "substituteSuggestions",
                label: "Substitute suggestions",
                render: (row) => row.substituteSuggestions?.join(", ") || "Not set",
              },
            ]}
            rows={medicines}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default InventoryPage;
