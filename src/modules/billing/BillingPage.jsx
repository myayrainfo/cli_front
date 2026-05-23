import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useLayoutData } from "../../shared/layouts/LayoutDataContext";
import { formatCurrency, formatDate } from "../../shared/utils/format";

const BillingPage = () => {
  const { refreshShellData } = useLayoutData();
  const [sales, setSales] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    customerName: "Walk-in Customer",
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    amountPaid: 0,
    items: [{ medicineId: "", batchId: "", quantity: 1, discount: 0 }],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [salesRes, medicinesRes, customersRes] = await Promise.all([
        api.get("/billing/sales"),
        api.get("/medicines"),
        api.get("/people/customers"),
      ]);
      setSales(salesRes.data);
      setMedicines(medicinesRes.data);
      setCustomers(customersRes.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load billing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedMedicine = medicines.find((medicine) => medicine._id === form.items[0].medicineId);
  const batchOptions = selectedMedicine?.batches || [];
  const selectedBatch = batchOptions.find((batch) => batch._id === form.items[0].batchId);
  const nearExpiry =
    selectedBatch &&
    new Date(selectedBatch.expiryDate) <= new Date(new Date().setDate(new Date().getDate() + 90)) &&
    new Date(selectedBatch.expiryDate) >= new Date();
  const isExpiredBatch = selectedBatch && new Date(selectedBatch.expiryDate) < new Date();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedMedicine || !selectedBatch) return;
    setSubmitting(true);
    setError("");

    try {
      const quantity = Number(form.items[0].quantity);
      const discount = Number(form.items[0].discount);
      const salePayload = {
        customerId: form.customerId || null,
        customerName:
          customers.find((customer) => customer._id === form.customerId)?.name || form.customerName,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        amountPaid: Number(form.amountPaid),
        items: [
          {
            medicineId: selectedMedicine._id,
            batchId: selectedBatch._id,
            quantity,
            mrp: selectedMedicine.mrp,
            discount,
            gst: selectedMedicine.gst,
          },
        ],
      };

      await api.post("/billing/sales", salePayload);
      setForm({
        customerId: "",
        customerName: "Walk-in Customer",
        paymentMethod: "Cash",
        paymentStatus: "Paid",
        amountPaid: 0,
        items: [{ medicineId: "", batchId: "", quantity: 1, discount: 0 }],
      });
      loadData();
      refreshShellData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to create sale.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading billing..." />;

  return (
    <div className="page-stack">
      <PageHeader
        title="Billing"
        subtitle="Fast billing with expiry blocking, batch selection, GST, discount, due tracking, and invoice placeholders."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="split-grid billing-layout">
        <SectionCard title="Fast billing screen">
          <form className="form-grid" onSubmit={handleSubmit}>
            <select value={form.customerId} onChange={(e) => setForm((prev) => ({ ...prev, customerId: e.target.value }))}>
              <option value="">Walk-in customer billing</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <input placeholder="Barcode scanner billing input" value={selectedMedicine?.barcodeValue || ""} readOnly />
            <input placeholder="QR scan billing placeholder" value="QR placeholder" readOnly />
            <select value={form.items[0].medicineId} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], medicineId: e.target.value, batchId: "" }] }))}>
              <option value="">Search by medicine name/generic/company</option>
              {medicines.map((medicine) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name} / {medicine.genericName} / {medicine.company}
                </option>
              ))}
            </select>
            <select value={form.items[0].batchId} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], batchId: e.target.value }] }))}>
              <option value="">Batch selection</option>
              {batchOptions.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchNumber} | Qty {batch.quantity} | Exp {formatDate(batch.expiryDate)}
                </option>
              ))}
            </select>
            <input type="number" min="1" placeholder="Quantity" value={form.items[0].quantity} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], quantity: Number(e.target.value) }] }))} />
            <input type="number" min="0" placeholder="Discount apply" value={form.items[0].discount} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], discount: Number(e.target.value) }] }))} />
            <select value={form.paymentMethod} onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
            <select value={form.paymentStatus} onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
              <option>Paid</option>
              <option>Partial</option>
              <option>Due</option>
            </select>
            <input type="number" min="0" placeholder="Partial payment" value={form.amountPaid} onChange={(e) => setForm((prev) => ({ ...prev, amountPaid: Number(e.target.value) }))} />
            <button className="primary-button" type="submit" disabled={submitting || !selectedBatch || isExpiredBatch}>
              {submitting ? "Creating..." : "Create Bill"}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Billing rules and placeholders">
          <div className="feature-list">
            <div className="feature-item">Auto expiry blocking: expired batches cannot be billed.</div>
            <div className="feature-item">Near-expiry warning: highlighted when selected batch expires within 90 days.</div>
            <div className="feature-item">Prescription-based billing placeholder</div>
            <div className="feature-item">Print invoice placeholder</div>
            <div className="feature-item">PDF invoice placeholder</div>
            <div className="feature-item">Sales return placeholder</div>
          </div>
          {selectedBatch ? (
            <div className="status-strip">
              <Badge tone={isExpiredBatch ? "danger" : nearExpiry ? "warning" : "success"}>
                {isExpiredBatch
                  ? "Expired batch blocked"
                  : nearExpiry
                    ? "Near-expiry warning"
                    : "Billable batch"}
              </Badge>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard title="Billing table">
        <DataTable
          columns={[
            { key: "medicine", label: "Medicine", render: (row) => row.items?.[0]?.medicineName || "-" },
            { key: "batch", label: "Batch", render: (row) => row.items?.[0]?.batchNumber || "-" },
            { key: "expiry", label: "Expiry", render: (row) => formatDate(row.items?.[0]?.expiryDate) },
            { key: "quantity", label: "Quantity", render: (row) => row.items?.[0]?.quantity || 0 },
            { key: "mrp", label: "MRP", render: (row) => formatCurrency(row.items?.[0]?.mrp) },
            { key: "discount", label: "Discount", render: (row) => formatCurrency(row.discountTotal) },
            { key: "gst", label: "GST", render: (row) => formatCurrency(row.gstTotal) },
            { key: "total", label: "Total", render: (row) => formatCurrency(row.grandTotal) },
          ]}
          rows={sales}
        />
      </SectionCard>
    </div>
  );
};

export default BillingPage;
