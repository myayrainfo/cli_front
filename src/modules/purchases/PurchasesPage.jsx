import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useLayoutData } from "../../shared/layouts/LayoutDataContext";
import { formatCurrency, formatDate } from "../../shared/utils/format";

const PurchasesPage = () => {
  const { refreshShellData } = useLayoutData();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    supplierId: "",
    amountPaid: 0,
    paymentStatus: "Paid",
    items: [
      {
        medicineId: "",
        batchNumber: "",
        manufacturingDate: "",
        expiryDate: "",
        quantity: 1,
        purchasePrice: 0,
        mrp: 0,
        sellingPrice: 0,
        gst: 0,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [purchasesRes, suppliersRes, medicinesRes] = await Promise.all([
        api.get("/purchases"),
        api.get("/people/suppliers"),
        api.get("/medicines"),
      ]);
      setPurchases(purchasesRes.data);
      setSuppliers(suppliersRes.data);
      setMedicines(medicinesRes.data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load purchases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supplier = suppliers.find((item) => item._id === form.supplierId);
      await api.post("/purchases", {
        ...form,
        supplierName: supplier?.name || "",
        items: form.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice),
          mrp: Number(item.mrp),
          sellingPrice: Number(item.sellingPrice),
          gst: Number(item.gst),
        })),
      });
      setForm({
        supplierId: "",
        amountPaid: 0,
        paymentStatus: "Paid",
        items: [
          {
            medicineId: "",
            batchNumber: "",
            manufacturingDate: "",
            expiryDate: "",
            quantity: 1,
            purchasePrice: 0,
            mrp: 0,
            sellingPrice: 0,
            gst: 0,
          },
        ],
      });
      loadData();
      refreshShellData();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to create purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading purchases..." />;

  return (
    <div className="page-stack purchases-page">
      <PageHeader
        title="Purchases"
        subtitle="Capture supplier purchases, batch-wise medicine entry, expiry-aware stock intake, and credit tracking."
      />

      {error ? <div className="error-banner" role="alert">{error}</div> : null}

      <div className="purchase-entry">
        <SectionCard title="New purchase">
          <form className="form-grid" onSubmit={handleSubmit}>
            <fieldset className="purchase-fields">
              <legend>Supplier & stock</legend>
              <label>
                <span>Supplier</span>
                <select value={form.supplierId} onChange={(e) => setForm((prev) => ({ ...prev, supplierId: e.target.value }))}>
              <option value="">Supplier details</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
              </label>
              <label>
                <span>Medicine</span>
                <select value={form.items[0].medicineId} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], medicineId: e.target.value }] }))}>
              <option value="">Select medicine</option>
              {medicines.map((medicine) => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </option>
              ))}
            </select>
              </label>
              <label>
                <span>Batch number</span>
                <input placeholder="Batch-wise medicine entry" value={form.items[0].batchNumber} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], batchNumber: e.target.value }] }))} />
              </label>
              <label>
                <span>Manufacturing date</span>
                <input type="date" value={form.items[0].manufacturingDate} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], manufacturingDate: e.target.value }] }))} />
              </label>
              <label>
                <span>Expiry date</span>
                <input type="date" value={form.items[0].expiryDate} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], expiryDate: e.target.value }] }))} />
              </label>
              <label>
                <span>Quantity</span>
                <input type="number" placeholder="Quantity" value={form.items[0].quantity} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], quantity: Number(e.target.value) }] }))} />
              </label>
            </fieldset>
            <fieldset className="purchase-fields">
              <legend>Pricing</legend>
              <label>
                <span>Purchase price</span>
                <input type="number" placeholder="Purchase price" value={form.items[0].purchasePrice} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], purchasePrice: Number(e.target.value) }] }))} />
              </label>
              <label>
                <span>MRP</span>
                <input type="number" placeholder="MRP" value={form.items[0].mrp} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], mrp: Number(e.target.value) }] }))} />
              </label>
              <label>
                <span>Selling price</span>
                <input type="number" placeholder="Selling price" value={form.items[0].sellingPrice} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], sellingPrice: Number(e.target.value) }] }))} />
              </label>
              <label>
                <span>GST (%)</span>
                <input type="number" placeholder="GST purchase report" value={form.items[0].gst} onChange={(e) => setForm((prev) => ({ ...prev, items: [{ ...prev.items[0], gst: Number(e.target.value) }] }))} />
              </label>
            </fieldset>
            <fieldset className="purchase-fields">
              <legend>Payment</legend>
              <label>
                <span>Payment status</span>
                <select value={form.paymentStatus} onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}>
              <option>Paid</option>
              <option>Partial</option>
              <option>Due</option>
            </select>
              </label>
              <label>
                <span>Amount paid</span>
                <input type="number" placeholder="Credit purchase tracking" value={form.amountPaid} onChange={(e) => setForm((prev) => ({ ...prev, amountPaid: Number(e.target.value) }))} />
              </label>
            </fieldset>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add Purchase"}
            </button>
          </form>
        </SectionCard>


      </div>

      <SectionCard title="Purchase history" className="purchase-history">
        <DataTable
          columns={[
            { key: "purchaseNumber", label: "Purchase" },
            { key: "supplierName", label: "Supplier" },
            {
              key: "items",
              label: "Medicine / batch",
              render: (row) => row.items?.map((item) => `${item.medicineName} / ${item.batchNumber}`).join(", "),
            },
            { key: "purchaseDate", label: "Date", render: (row) => formatDate(row.purchaseDate) },
            { key: "grandTotal", label: "Total", render: (row) => formatCurrency(row.grandTotal) },
            {
              key: "paymentStatus",
              label: "Payment",
              render: (row) => (
                <Badge tone={row.paymentStatus === "Paid" ? "success" : row.paymentStatus === "Due" ? "danger" : "warning"}>
                  {row.paymentStatus}
                </Badge>
              ),
            },
          ]}
          rows={purchases}
        />
      </SectionCard>
    </div>
  );
};

export default PurchasesPage;
