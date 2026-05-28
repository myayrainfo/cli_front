import { useDeferredValue, useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  Plus,
  Printer,
  QrCode,
  ReceiptText,
  RotateCcw,
  Save,
  ScanLine,
  Search,
  Trash2,
} from "lucide-react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { useLayoutData } from "../../shared/layouts/LayoutDataContext";
import { formatCurrency, formatDate } from "../../shared/utils/format";

const createEmptySelection = () => ({
  medicineId: "",
  batchId: "",
  quantity: 1,
  discount: 0,
});

const createBillingForm = () => ({
  billingType: "Walk-in",
  customerId: "",
  customerName: "",
  customerMobile: "",
  doctorName: "",
  prescriptionId: "",
  paymentMode: "Cash",
  paidAmount: 0,
  transactionRef: "",
  notes: "",
});

const createSplitPayments = () => ({
  Cash: "",
  UPI: "",
  Card: "",
});

const roundCurrency = (value) => Number((Number(value) || 0).toFixed(2));

const getBatchStatus = (expiryDate) => {
  if (!expiryDate) return "Available";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  const nearExpiry = new Date(today);
  nearExpiry.setDate(nearExpiry.getDate() + 90);

  if (expiry < today) return "Expired";
  if (expiry <= nearExpiry) return "Near Expiry";
  return "Available";
};

const getBatchTone = (status) => {
  if (status === "Expired") return "danger";
  if (status === "Near Expiry") return "warning";
  return "success";
};

const calculateLine = (item) => {
  const grossAmount = roundCurrency((Number(item.mrp) || 0) * (Number(item.quantity) || 0));
  const discount = roundCurrency(item.discount);
  const taxableAmount = roundCurrency(Math.max(grossAmount - discount, 0));
  const gstAmount = roundCurrency((taxableAmount * (Number(item.gstPercent) || 0)) / 100);
  const totalAmount = roundCurrency(taxableAmount + gstAmount);

  return {
    grossAmount,
    discount,
    taxableAmount,
    gstAmount,
    totalAmount,
  };
};

const calculateSummary = (cartItems, paidAmount) => {
  const subtotal = roundCurrency(cartItems.reduce((sum, item) => sum + calculateLine(item).grossAmount, 0));
  const discountTotal = roundCurrency(cartItems.reduce((sum, item) => sum + calculateLine(item).discount, 0));
  const gstTotal = roundCurrency(cartItems.reduce((sum, item) => sum + calculateLine(item).gstAmount, 0));
  const rawGrandTotal = roundCurrency(cartItems.reduce((sum, item) => sum + calculateLine(item).totalAmount, 0));
  const grandTotal = roundCurrency(Math.round(rawGrandTotal));
  const roundOff = roundCurrency(grandTotal - rawGrandTotal);
  const normalizedPaid = roundCurrency(paidAmount);
  const dueAmount = roundCurrency(Math.max(grandTotal - normalizedPaid, 0));
  const paymentStatus = normalizedPaid >= grandTotal ? "Paid" : normalizedPaid > 0 ? "Partial" : "Due";

  return {
    subtotal,
    discountTotal,
    gstTotal,
    roundOff,
    grandTotal,
    dueAmount,
    paymentStatus,
  };
};

const BillingPage = () => {
  const { refreshShellData } = useLayoutData();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");
  const [medicineQuery, setMedicineQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [medicineSelection, setMedicineSelection] = useState(createEmptySelection());
  const [billingForm, setBillingForm] = useState(createBillingForm());
  const [splitPayments, setSplitPayments] = useState(createSplitPayments());
  const [cartItems, setCartItems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dues, setDues] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [returnOpen, setReturnOpen] = useState(false);
  const [duePayment, setDuePayment] = useState({ dueId: "", amount: "", paymentMode: "Cash", transactionRef: "" });
  const [returnForm, setReturnForm] = useState({
    invoiceId: "",
    medicineId: "",
    quantity: 1,
    reason: "",
  });
  const [activeInvoice, setActiveInvoice] = useState(null);
  const deferredMedicineQuery = useDeferredValue(medicineQuery);
  const deferredCustomerQuery = useDeferredValue(customerQuery);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medicineRes, customerRes, patientRes, prescriptionRes, invoiceRes, dueRes] = await Promise.all([
        api.get("/medicines"),
        api.get("/people/customers"),
        api.get("/clinic/patients"),
        api.get("/clinic/prescriptions"),
        api.get("/billing/invoices"),
        api.get("/billing/dues"),
      ]);

      setMedicines(medicineRes.data || []);
      setCustomers(customerRes.data || []);
      setPatients(patientRes.data || []);
      setPrescriptions(prescriptionRes.data || []);
      setInvoices(invoiceRes.data || []);
      setDues(dueRes.data || []);
      setActiveInvoice((current) => {
        if (!current?._id) return invoiceRes.data?.[0] || null;
        return invoiceRes.data?.find((invoice) => invoice._id === current._id) || invoiceRes.data?.[0] || null;
      });
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load billing workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMedicines = medicines.filter((medicine) => {
    const searchText = [
      medicine.name,
      medicine.genericName,
      medicine.company,
      medicine.barcodeValue,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(deferredMedicineQuery.trim().toLowerCase());
  });

  const filteredCustomers = customers.filter((customer) => {
    const searchText = [customer.name, customer.phone].join(" ").toLowerCase();
    return searchText.includes(deferredCustomerQuery.trim().toLowerCase());
  });

  const selectedMedicine = medicines.find((medicine) => medicine._id === medicineSelection.medicineId) || null;
  const selectedBatch =
    selectedMedicine?.batches?.find((batch) => batch._id === medicineSelection.batchId) || null;
  const selectedBatchStatus = getBatchStatus(selectedBatch?.expiryDate);
  const selectedCustomer = customers.find((customer) => customer._id === billingForm.customerId) || null;
  const selectedPrescription =
    prescriptions.find((prescription) => prescription._id === billingForm.prescriptionId) || null;
  const selectedReturnInvoice =
    invoices.find((invoice) => invoice._id === returnForm.invoiceId) || null;
  const selectedReturnItem =
    selectedReturnInvoice?.items?.find((item) => String(item.medicineId) === returnForm.medicineId) || null;
  const summary = calculateSummary(cartItems, billingForm.paidAmount);

  useEffect(() => {
    if (!selectedCustomer) return;

    setBillingForm((current) => ({
      ...current,
      customerName: selectedCustomer.name || "",
      customerMobile: selectedCustomer.phone || "",
    }));
  }, [selectedCustomer]);

  useEffect(() => {
    if (!selectedPrescription) return;

    const linkedPatient = patients.find((patient) => patient._id === selectedPrescription.patientId);

    setBillingForm((current) => ({
      ...current,
      billingType: "Prescription Based",
      doctorName: selectedPrescription.doctorName || current.doctorName,
      customerName: linkedPatient?.name || current.customerName,
      customerMobile: linkedPatient?.phone || current.customerMobile,
    }));
  }, [patients, selectedPrescription]);

  const resetWorkspace = ({ clearMessages = true } = {}) => {
    setMedicineSelection(createEmptySelection());
    setBillingForm(createBillingForm());
    setSplitPayments(createSplitPayments());
    setCartItems([]);
    setMedicineQuery("");
    setCustomerQuery("");
    if (clearMessages) {
      setError("");
      setSuccessMessage("");
    }
  };

  const handleSelectMedicine = (medicine) => {
    const firstBillableBatch =
      medicine.batches?.find((batch) => getBatchStatus(batch.expiryDate) !== "Expired") || null;

    setMedicineSelection({
      medicineId: medicine._id,
      batchId: firstBillableBatch?._id || "",
      quantity: 1,
      discount: medicine.discountRule ? 0 : 0,
    });
    setMedicineQuery(medicine.name);
  };

  const handleAddToCart = () => {
    setError("");
    setSuccessMessage("");

    if (!selectedMedicine || !selectedBatch) {
      setError("Select a medicine and batch before adding to cart.");
      return;
    }

    if (selectedBatchStatus === "Expired") {
      setError("Expired batches cannot be added to cart.");
      return;
    }

    const quantity = Number(medicineSelection.quantity);
    const discount = Number(medicineSelection.discount) || 0;

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (quantity > Number(selectedBatch.quantity || 0)) {
      setError("Insufficient stock in the selected batch.");
      return;
    }

    const nextItem = {
      medicineId: selectedMedicine._id,
      medicineName: selectedMedicine.name,
      genericName: selectedMedicine.genericName || "",
      company: selectedMedicine.company || "",
      batchId: selectedBatch._id,
      batchNo: selectedBatch.batchNumber,
      expiry: selectedBatch.expiryDate,
      quantity,
      mrp: Number(selectedBatch.mrp || selectedMedicine.mrp || 0),
      discount,
      gstPercent: Number(selectedMedicine.gst || 0),
      availableStock: Number(selectedBatch.quantity || 0),
    };

    setCartItems((current) => {
      const existingIndex = current.findIndex(
        (item) => item.medicineId === nextItem.medicineId && item.batchId === nextItem.batchId
      );

      if (existingIndex === -1) {
        return [...current, nextItem];
      }

      const updated = [...current];
      const mergedQuantity = updated[existingIndex].quantity + quantity;

      if (mergedQuantity > updated[existingIndex].availableStock) {
        setError("Merged quantity exceeds available batch stock.");
        return current;
      }

      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: mergedQuantity,
        discount: roundCurrency(updated[existingIndex].discount + discount),
      };

      return updated;
    });

    setMedicineSelection((current) => ({
      ...current,
      quantity: 1,
      discount: 0,
    }));
  };

  const handleUpdateCartItem = (index, field, value) => {
    setCartItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "batchId") {
          const medicine = medicines.find((medicineEntry) => medicineEntry._id === item.medicineId);
          const batch = medicine?.batches?.find((batchEntry) => batchEntry._id === value);

          if (!batch) return item;

          return {
            ...item,
            batchId: batch._id,
            batchNo: batch.batchNumber,
            expiry: batch.expiryDate,
            mrp: Number(batch.mrp || medicine?.mrp || 0),
            availableStock: Number(batch.quantity || 0),
            quantity: Math.min(item.quantity, Number(batch.quantity || 0)) || 1,
          };
        }

        return {
          ...item,
          [field]: field === "quantity" || field === "discount" ? Number(value) : value,
        };
      })
    );
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSaveDraft = () => {
    const payload = {
      billingForm,
      splitPayments,
      cartItems,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("ayra_billing_draft", JSON.stringify(payload));
    setSuccessMessage("Bill draft saved locally.");
  };

  const handleLoadDraft = () => {
    const draft = localStorage.getItem("ayra_billing_draft");
    if (!draft) {
      setError("No saved draft bill was found.");
      return;
    }

    const parsed = JSON.parse(draft);
    setBillingForm(parsed.billingForm || createBillingForm());
    setSplitPayments(parsed.splitPayments || createSplitPayments());
    setCartItems(parsed.cartItems || []);
    setSuccessMessage("Held bill restored.");
  };

  const buildCreatePayload = () => {
    const paidAmount = Number(billingForm.paidAmount) || 0;
    const splitPayload =
      billingForm.paymentMode === "Split Payment"
        ? Object.entries(splitPayments)
            .map(([mode, amount]) => ({
              mode,
              amount: Number(amount) || 0,
            }))
            .filter((entry) => entry.amount > 0)
        : [];

    return {
      billingType: billingForm.billingType,
      customerId: billingForm.customerId || null,
      customerName: billingForm.customerName,
      customerMobile: billingForm.customerMobile,
      doctorName: billingForm.doctorName,
      prescriptionId: billingForm.prescriptionId || null,
      paymentMode: billingForm.paymentMode,
      paidAmount,
      transactionRef: billingForm.transactionRef,
      splitPayments: splitPayload,
      notes: billingForm.notes,
      items: cartItems.map((item) => ({
        medicineId: item.medicineId,
        batchId: item.batchId,
        quantity: Number(item.quantity),
        mrp: Number(item.mrp),
        discount: Number(item.discount) || 0,
        gstPercent: Number(item.gstPercent) || 0,
      })),
    };
  };

  const handleCreateBill = async () => {
    if (!cartItems.length) {
      setError("Add at least one medicine to the cart.");
      return;
    }

    if (summary.dueAmount > 0 && !billingForm.customerName.trim() && !billingForm.customerMobile.trim()) {
      setError("Customer name or mobile is required for due billing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const response = await api.post("/billing/create", buildCreatePayload());
      const createdInvoice = response.data.invoice;

      setActiveInvoice(createdInvoice);
      resetWorkspace({ clearMessages: false });
      await loadData();
      await refreshShellData();
      setSuccessMessage(`${response.data.message} Invoice No: ${response.data.invoiceNo}`);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to create bill.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (invoiceId) => {
    if (!invoiceId) {
      setError("Create or select an invoice before downloading PDF.");
      return;
    }

    try {
      setDownloadingId(invoiceId);
      const response = await api.get(`/billing/invoices/${invoiceId}/pdf`, { responseType: "blob" });
      const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `${activeInvoice?.invoiceNo || "invoice"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (downloadError) {
      setError(downloadError.response?.data?.message || "Unable to download invoice PDF.");
    } finally {
      setDownloadingId("");
    }
  };

  const handlePrintInvoice = () => {
    if (!activeInvoice) {
      setError("Create or select an invoice before printing.");
      return;
    }

    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      setError("Popup blocked. Allow popups to print the invoice.");
      return;
    }

    const itemRows = activeInvoice.items
      .map(
        (item) => `
          <tr>
            <td>${item.medicineName}</td>
            <td>${item.batchNo}</td>
            <td>${new Date(item.expiry).toLocaleDateString("en-IN")}</td>
            <td>${item.quantity}</td>
            <td>${item.mrp.toFixed(2)}</td>
            <td>${item.discount.toFixed(2)}</td>
            <td>${item.gstPercent}%</td>
            <td>${item.totalAmount.toFixed(2)}</td>
          </tr>
        `
      )
      .join("");

    popup.document.write(`
      <html>
        <head>
          <title>${activeInvoice.invoiceNo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1, h2, p { margin: 0 0 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #d7e0ee; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f4f7fb; }
            .summary { margin-top: 20px; width: 280px; margin-left: auto; }
            .summary div { display: flex; justify-content: space-between; padding: 4px 0; }
          </style>
        </head>
        <body>
          <h1>AYRA Clinic ERP</h1>
          <p>Invoice No: ${activeInvoice.invoiceNo}</p>
          <p>Date: ${new Date(activeInvoice.createdAt).toLocaleString("en-IN")}</p>
          <p>Customer: ${activeInvoice.customerName || "Walk-in Customer"}</p>
          <p>Mobile: ${activeInvoice.customerMobile || "-"}</p>
          <p>Doctor: ${activeInvoice.doctorName || "-"}</p>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Discount</th>
                <th>GST</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div class="summary">
            <div><span>Subtotal</span><strong>${activeInvoice.subtotal.toFixed(2)}</strong></div>
            <div><span>Discount</span><strong>${activeInvoice.discountTotal.toFixed(2)}</strong></div>
            <div><span>GST</span><strong>${activeInvoice.gstTotal.toFixed(2)}</strong></div>
            <div><span>Grand Total</span><strong>${activeInvoice.grandTotal.toFixed(2)}</strong></div>
            <div><span>Paid</span><strong>${activeInvoice.paidAmount.toFixed(2)}</strong></div>
            <div><span>Due</span><strong>${activeInvoice.dueAmount.toFixed(2)}</strong></div>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const handlePayDue = async () => {
    if (!duePayment.dueId) {
      setError("Select a due invoice before recording payment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.post(`/billing/dues/${duePayment.dueId}/pay`, {
        amount: Number(duePayment.amount) || 0,
        paymentMode: duePayment.paymentMode,
        transactionRef: duePayment.transactionRef,
      });
      setDuePayment({ dueId: "", amount: "", paymentMode: "Cash", transactionRef: "" });
      setSuccessMessage("Due payment recorded successfully.");
      await loadData();
      await refreshShellData();
    } catch (paymentError) {
      setError(paymentError.response?.data?.message || "Unable to record due payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessReturn = async () => {
    try {
      setSubmitting(true);
      setError("");
      await api.post("/billing/returns", {
        invoiceId: returnForm.invoiceId,
        medicineId: returnForm.medicineId,
        quantity: Number(returnForm.quantity),
        reason: returnForm.reason,
      });
      setReturnForm({ invoiceId: "", medicineId: "", quantity: 1, reason: "" });
      setSuccessMessage("Sales return processed successfully.");
      await loadData();
      await refreshShellData();
    } catch (returnError) {
      setError(returnError.response?.data?.message || "Unable to process sales return.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading pharmacy billing workspace..." />;
  }

  return (
    <div className="page-stack billing-page">
      <PageHeader
        title="Sales & Billing"
        subtitle="Create pharmacy bills with batch selection, expiry blocking, GST, payments, returns, and invoice workflows."
        action={
          <div className="action-row billing-header-actions">
            <button type="button" className="ghost-button" onClick={resetWorkspace}>
              <Plus size={16} />
              <span>New Bill</span>
            </button>
            <button type="button" className="ghost-button" onClick={() => document.getElementById("billing-barcode-input")?.focus()}>
              <ScanLine size={16} />
              <span>Scan Barcode</span>
            </button>
            <button type="button" className="ghost-button" onClick={() => setSuccessMessage("QR scanner workflow placeholder is ready for device integration.")}>
              <QrCode size={16} />
              <span>Scan QR</span>
            </button>
            <button type="button" className="ghost-button" onClick={() => setReturnOpen((current) => !current)}>
              <RotateCcw size={16} />
              <span>Sales Return</span>
            </button>
          </div>
        }
      />

      {error ? <div className="error-banner">{error}</div> : null}
      {successMessage ? <div className="billing-success-banner">{successMessage}</div> : null}

      <div className="billing-workspace-grid">
        <div className="billing-column">
          <SectionCard title="Customer & Prescription" className="billing-card">
            <div className="billing-form-grid">
              <label className="billing-field">
                <span>Billing Type</span>
                <select
                  value={billingForm.billingType}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      billingType: event.target.value,
                    }))
                  }
                >
                  <option>Walk-in</option>
                  <option>Registered Customer</option>
                  <option>Prescription Based</option>
                </select>
              </label>

              <label className="billing-field billing-field-full">
                <span>Customer Search</span>
                <input
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                  placeholder="Search customer by name or mobile"
                />
              </label>

              {filteredCustomers.slice(0, 5).length ? (
                <div className="billing-search-results billing-field-full">
                  {filteredCustomers.slice(0, 5).map((customer) => (
                    <button
                      key={customer._id}
                      type="button"
                      className={`billing-search-item ${billingForm.customerId === customer._id ? "active" : ""}`}
                      onClick={() =>
                        setBillingForm((current) => ({
                          ...current,
                          customerId: customer._id,
                          billingType: "Registered Customer",
                        }))
                      }
                    >
                      <strong>{customer.name}</strong>
                      <span>{customer.phone || "No mobile"}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              <label className="billing-field">
                <span>Customer Name</span>
                <input
                  value={billingForm.customerName}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      customerName: event.target.value,
                    }))
                  }
                  placeholder="Walk-in or registered customer"
                />
              </label>

              <label className="billing-field">
                <span>Mobile Number</span>
                <input
                  value={billingForm.customerMobile}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      customerMobile: event.target.value,
                    }))
                  }
                  placeholder="Customer mobile"
                />
              </label>

              <label className="billing-field">
                <span>Doctor Name</span>
                <input
                  value={billingForm.doctorName}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      doctorName: event.target.value,
                    }))
                  }
                  placeholder="Prescribing doctor"
                />
              </label>

              <label className="billing-field">
                <span>Prescription ID</span>
                <select
                  value={billingForm.prescriptionId}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      prescriptionId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select prescription</option>
                  {prescriptions.map((prescription) => (
                    <option key={prescription._id} value={prescription._id}>
                      {prescription._id.slice(-6)} | {prescription.doctorName || "Doctor not set"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="billing-inline-badges">
              <Badge tone={selectedCustomer?.dueAmount > 0 ? "warning" : "info"}>
                Existing Due: {formatCurrency(selectedCustomer?.dueAmount || 0)}
              </Badge>
              <Badge tone={billingForm.billingType === "Prescription Based" ? "info" : "neutral"}>
                {billingForm.billingType}
              </Badge>
            </div>
          </SectionCard>

          <SectionCard title="Due Tracking" className="billing-card">
            <div className="billing-dues-list">
              {dues.slice(0, 4).map((due) => (
                <button
                  key={due._id}
                  type="button"
                  className={`billing-due-item ${duePayment.dueId === due._id ? "active" : ""}`}
                  onClick={() =>
                    setDuePayment((current) => ({
                      ...current,
                      dueId: due._id,
                      amount: due.dueAmount,
                    }))
                  }
                >
                  <div>
                    <strong>{due.invoiceNo}</strong>
                    <span>{due.customerName || "Walk-in Customer"}</span>
                  </div>
                  <Badge tone={due.status === "Closed" ? "success" : "warning"}>
                    {formatCurrency(due.dueAmount)}
                  </Badge>
                </button>
              ))}
              {!dues.length ? <div className="feature-item">No open dues right now.</div> : null}
            </div>

            <div className="billing-form-grid billing-due-form">
              <label className="billing-field">
                <span>Pay Amount</span>
                <input
                  type="number"
                  min="0"
                  value={duePayment.amount}
                  onChange={(event) => setDuePayment((current) => ({ ...current, amount: event.target.value }))}
                />
              </label>
              <label className="billing-field">
                <span>Payment Mode</span>
                <select
                  value={duePayment.paymentMode}
                  onChange={(event) =>
                    setDuePayment((current) => ({
                      ...current,
                      paymentMode: event.target.value,
                    }))
                  }
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>
              </label>
              <label className="billing-field billing-field-full">
                <span>Transaction Ref</span>
                <input
                  value={duePayment.transactionRef}
                  onChange={(event) =>
                    setDuePayment((current) => ({
                      ...current,
                      transactionRef: event.target.value,
                    }))
                  }
                  placeholder="Optional UPI/card reference"
                />
              </label>
            </div>
            <button type="button" className="primary-button" onClick={handlePayDue} disabled={submitting}>
              Record Due Payment
            </button>
          </SectionCard>
        </div>

        <div className="billing-column">
          <SectionCard title="Medicine Billing Workspace" className="billing-card">
            <div className="billing-search-bar">
              <Search size={16} />
              <input
                id="billing-barcode-input"
                value={medicineQuery}
                onChange={(event) => setMedicineQuery(event.target.value)}
                placeholder="Search medicine name, generic, company, or barcode"
              />
            </div>

            <div className="billing-search-results">
              {filteredMedicines.slice(0, 8).map((medicine) => (
                <button
                  key={medicine._id}
                  type="button"
                  className={`billing-search-item ${selectedMedicine?._id === medicine._id ? "active" : ""}`}
                  onClick={() => handleSelectMedicine(medicine)}
                >
                  <div>
                    <strong>{medicine.name}</strong>
                    <span>
                      {medicine.genericName || "Generic not set"} • {medicine.company || "Company not set"}
                    </span>
                  </div>
                  <Badge tone={Number(medicine.totalStock) > 0 ? "success" : "danger"}>
                    Stock {medicine.totalStock || 0}
                  </Badge>
                </button>
              ))}
            </div>

            {selectedMedicine ? (
              <div className="billing-medicine-shell">
                <div className="billing-medicine-meta">
                  <div>
                    <h4>{selectedMedicine.name}</h4>
                    <p>
                      {selectedMedicine.genericName || "Generic not set"} • {selectedMedicine.company || "Company not set"}
                    </p>
                  </div>
                  <div className="billing-inline-badges">
                    <Badge tone="info">GST {selectedMedicine.gst || 0}%</Badge>
                    <Badge tone="neutral">Available {selectedMedicine.totalStock || 0}</Badge>
                  </div>
                </div>

                <div className="billing-batch-grid">
                  {(selectedMedicine.batches || []).map((batch) => {
                    const status = getBatchStatus(batch.expiryDate);
                    return (
                      <button
                        key={batch._id}
                        type="button"
                        className={`billing-batch-card ${medicineSelection.batchId === batch._id ? "active" : ""} ${
                          status === "Expired" ? "blocked" : ""
                        }`}
                        onClick={() =>
                          status !== "Expired" &&
                          setMedicineSelection((current) => ({
                            ...current,
                            batchId: batch._id,
                          }))
                        }
                      >
                        <div className="billing-batch-head">
                          <strong>{batch.batchNumber}</strong>
                          <Badge tone={getBatchTone(status)}>{status}</Badge>
                        </div>
                        <span>Expiry: {formatDate(batch.expiryDate)}</span>
                        <span>Stock: {batch.quantity || 0}</span>
                        <span>MRP: {formatCurrency(batch.mrp || selectedMedicine.mrp || 0)}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedBatchStatus === "Near Expiry" ? (
                  <div className="status-strip billing-warning-strip">
                    <AlertTriangle size={16} />
                    <span>This batch expires within 90 days. Continue with pharmacist review.</span>
                  </div>
                ) : null}

                <div className="billing-form-grid">
                  <label className="billing-field">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      value={medicineSelection.quantity}
                      onChange={(event) =>
                        setMedicineSelection((current) => ({
                          ...current,
                          quantity: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="billing-field">
                    <span>Discount</span>
                    <input
                      type="number"
                      min="0"
                      value={medicineSelection.discount}
                      onChange={(event) =>
                        setMedicineSelection((current) => ({
                          ...current,
                          discount: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="action-row">
                  <button type="button" className="primary-button" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setCartItems([])}>
                    Clear Cart
                  </button>
                  <button type="button" className="ghost-button" onClick={handleLoadDraft}>
                    Hold Bill
                  </button>
                </div>
              </div>
            ) : (
              <div className="feature-item">Select a medicine to view live batches, expiry, GST, and pricing.</div>
            )}
          </SectionCard>

          <SectionCard title="Billing Cart" className="billing-card">
            <div className="table-wrap">
              <table className="data-table billing-cart-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Generic</th>
                    <th>Company</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th>Quantity</th>
                    <th>MRP</th>
                    <th>Discount</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length ? (
                    cartItems.map((item, index) => {
                      const medicine = medicines.find((medicineEntry) => medicineEntry._id === item.medicineId);
                      const line = calculateLine(item);
                      const batchStatus = getBatchStatus(item.expiry);

                      return (
                        <tr key={`${item.medicineId}-${item.batchId}`}>
                          <td>{item.medicineName}</td>
                          <td>{item.genericName || "-"}</td>
                          <td>{item.company || "-"}</td>
                          <td>
                            <select
                              value={item.batchId}
                              onChange={(event) => handleUpdateCartItem(index, "batchId", event.target.value)}
                            >
                              {(medicine?.batches || []).map((batch) => (
                                <option
                                  key={batch._id}
                                  value={batch._id}
                                  disabled={getBatchStatus(batch.expiryDate) === "Expired"}
                                >
                                  {batch.batchNumber} | {batch.quantity || 0} pcs
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <div className="billing-expiry-cell">
                              <span>{formatDate(item.expiry)}</span>
                              <Badge tone={getBatchTone(batchStatus)}>{batchStatus}</Badge>
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              max={item.availableStock}
                              value={item.quantity}
                              onChange={(event) => handleUpdateCartItem(index, "quantity", event.target.value)}
                            />
                          </td>
                          <td>{formatCurrency(item.mrp)}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(event) => handleUpdateCartItem(index, "discount", event.target.value)}
                            />
                          </td>
                          <td>{item.gstPercent}%</td>
                          <td>{formatCurrency(line.totalAmount)}</td>
                          <td>
                            <button type="button" className="text-button danger" onClick={() => handleRemoveCartItem(index)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="11">
                        <div className="empty-state">
                          <ReceiptText className="empty-state-icon" size={18} />
                          <div>
                            <strong>Cart is empty</strong>
                            <p>Search a medicine, select a valid batch, and add it to the billing cart.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <div className="billing-column">
          <SectionCard title="Bill Summary & Payment" className="billing-card billing-summary-card">
            <div className="billing-summary-list">
              <div><span>Subtotal</span><strong>{formatCurrency(summary.subtotal)}</strong></div>
              <div><span>Discount Total</span><strong>{formatCurrency(summary.discountTotal)}</strong></div>
              <div><span>GST Total</span><strong>{formatCurrency(summary.gstTotal)}</strong></div>
              <div><span>Round Off</span><strong>{formatCurrency(summary.roundOff)}</strong></div>
              <div className="billing-summary-total"><span>Grand Total</span><strong>{formatCurrency(summary.grandTotal)}</strong></div>
            </div>

            <div className="billing-form-grid">
              <label className="billing-field">
                <span>Payment Mode</span>
                <select
                  value={billingForm.paymentMode}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      paymentMode: event.target.value,
                    }))
                  }
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Split Payment</option>
                </select>
              </label>
              <label className="billing-field">
                <span>Paid Amount</span>
                <input
                  type="number"
                  min="0"
                  value={billingForm.paidAmount}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      paidAmount: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="billing-field billing-field-full">
                <span>Transaction Ref</span>
                <input
                  value={billingForm.transactionRef}
                  onChange={(event) =>
                    setBillingForm((current) => ({
                      ...current,
                      transactionRef: event.target.value,
                    }))
                  }
                  placeholder="UPI / card reference"
                />
              </label>
            </div>

            {billingForm.paymentMode === "Split Payment" ? (
              <div className="billing-form-grid">
                {Object.keys(splitPayments).map((mode) => (
                  <label key={mode} className="billing-field">
                    <span>{mode}</span>
                    <input
                      type="number"
                      min="0"
                      value={splitPayments[mode]}
                      onChange={(event) =>
                        setSplitPayments((current) => ({
                          ...current,
                          [mode]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            ) : null}

            <div className="billing-inline-badges">
              <Badge tone={summary.paymentStatus === "Paid" ? "success" : summary.paymentStatus === "Partial" ? "warning" : "danger"}>
                {summary.paymentStatus}
              </Badge>
              <Badge tone={summary.dueAmount > 0 ? "warning" : "info"}>
                Due {formatCurrency(summary.dueAmount)}
              </Badge>
            </div>

            <label className="billing-field billing-field-full">
              <span>Notes</span>
              <textarea
                className="billing-notes-input"
                value={billingForm.notes}
                onChange={(event) =>
                  setBillingForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Optional billing note, prescription note, or pharmacist comment"
              />
            </label>

            <div className="billing-summary-actions">
              <button type="button" className="primary-button" onClick={handleCreateBill} disabled={submitting || !cartItems.length}>
                {submitting ? "Creating..." : "Complete Payment / Create Bill"}
              </button>
              <button type="button" className="ghost-button" onClick={handlePrintInvoice}>
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => handleDownloadPdf(activeInvoice?._id)}
                disabled={!activeInvoice?._id || downloadingId === activeInvoice?._id}
              >
                <Download size={16} />
                <span>{downloadingId === activeInvoice?._id ? "Downloading..." : "Download PDF"}</span>
              </button>
              <button type="button" className="ghost-button" onClick={handleSaveDraft}>
                <Save size={16} />
                <span>Save Draft</span>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Invoice Preview" className="billing-card">
            {activeInvoice ? (
              <div className="billing-invoice-preview">
                <div className="billing-preview-head">
                  <div>
                    <h4>{activeInvoice.invoiceNo}</h4>
                    <p>{formatDate(activeInvoice.createdAt)}</p>
                  </div>
                  <Badge tone={activeInvoice.paymentStatus === "Paid" ? "success" : activeInvoice.paymentStatus === "Partial" ? "warning" : "danger"}>
                    {activeInvoice.paymentStatus}
                  </Badge>
                </div>

                <div className="billing-preview-meta">
                  <span>Customer: {activeInvoice.customerName || "Walk-in Customer"}</span>
                  <span>Mobile: {activeInvoice.customerMobile || "-"}</span>
                  <span>Doctor: {activeInvoice.doctorName || "-"}</span>
                </div>

                <div className="billing-preview-items">
                  {activeInvoice.items.map((item) => (
                    <div key={`${item.medicineId}-${item.batchId}`} className="billing-preview-item">
                      <div>
                        <strong>{item.medicineName}</strong>
                        <span>
                          Batch {item.batchNo} • Qty {item.quantity} • GST {item.gstPercent}%
                        </span>
                      </div>
                      <strong>{formatCurrency(item.totalAmount)}</strong>
                    </div>
                  ))}
                </div>

                <div className="billing-summary-list compact">
                  <div><span>Subtotal</span><strong>{formatCurrency(activeInvoice.subtotal)}</strong></div>
                  <div><span>Discount</span><strong>{formatCurrency(activeInvoice.discountTotal)}</strong></div>
                  <div><span>GST</span><strong>{formatCurrency(activeInvoice.gstTotal)}</strong></div>
                  <div><span>Grand Total</span><strong>{formatCurrency(activeInvoice.grandTotal)}</strong></div>
                  <div><span>Paid</span><strong>{formatCurrency(activeInvoice.paidAmount)}</strong></div>
                  <div><span>Due</span><strong>{formatCurrency(activeInvoice.dueAmount)}</strong></div>
                </div>
                <div className="feature-item">Thank you. Returns are subject to pharmacy policy and item condition.</div>
              </div>
            ) : (
              <div className="feature-item">Your latest invoice preview will appear here after billing.</div>
            )}
          </SectionCard>
        </div>
      </div>

      {returnOpen ? (
        <SectionCard title="Sales Return" className="billing-card">
          <div className="billing-form-grid">
            <label className="billing-field">
              <span>Invoice</span>
              <select
                value={returnForm.invoiceId}
                onChange={(event) =>
                  setReturnForm((current) => ({
                    ...current,
                    invoiceId: event.target.value,
                    medicineId: "",
                  }))
                }
              >
                <option value="">Search invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNo} | {invoice.customerName || "Walk-in Customer"}
                  </option>
                ))}
              </select>
            </label>
            <label className="billing-field">
              <span>Medicine</span>
              <select
                value={returnForm.medicineId}
                onChange={(event) =>
                  setReturnForm((current) => ({
                    ...current,
                    medicineId: event.target.value,
                  }))
                }
              >
                <option value="">Select medicine</option>
                {(selectedReturnInvoice?.items || []).map((item) => (
                  <option key={`${item.medicineId}-${item.batchId}`} value={item.medicineId}>
                    {item.medicineName} | Batch {item.batchNo}
                  </option>
                ))}
              </select>
            </label>
            <label className="billing-field">
              <span>Return Quantity</span>
              <input
                type="number"
                min="1"
                max={
                  selectedReturnItem
                    ? selectedReturnItem.quantity - (selectedReturnItem.returnedQuantity || 0)
                    : 1
                }
                value={returnForm.quantity}
                onChange={(event) =>
                  setReturnForm((current) => ({
                    ...current,
                    quantity: event.target.value,
                  }))
                }
              />
            </label>
            <label className="billing-field billing-field-full">
              <span>Return Reason</span>
              <input
                value={returnForm.reason}
                onChange={(event) =>
                  setReturnForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                placeholder="Customer issue, wrong medicine, damage, etc."
              />
            </label>
          </div>

          {selectedReturnItem ? (
            <div className="billing-inline-badges">
              <Badge tone="info">
                Refund Preview {formatCurrency((selectedReturnItem.totalAmount / selectedReturnItem.quantity) * Number(returnForm.quantity || 0))}
              </Badge>
              <Badge tone="warning">
                Returnable {selectedReturnItem.quantity - (selectedReturnItem.returnedQuantity || 0)}
              </Badge>
            </div>
          ) : null}

          <div className="action-row">
            <button type="button" className="primary-button" onClick={handleProcessReturn} disabled={submitting}>
              Process Return
            </button>
            <button type="button" className="ghost-button" onClick={() => setReturnOpen(false)}>
              Close Return
            </button>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Sales Records" className="billing-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Items</th>
                <th>GST</th>
                <th>Grand Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} onClick={() => setActiveInvoice(invoice)} className="billing-row-clickable">
                  <td>{invoice.invoiceNo}</td>
                  <td>{invoice.customerName || "Walk-in Customer"}</td>
                  <td>{invoice.items?.length || 0}</td>
                  <td>{formatCurrency(invoice.gstTotal)}</td>
                  <td>{formatCurrency(invoice.grandTotal)}</td>
                  <td>{formatCurrency(invoice.paidAmount)}</td>
                  <td>{formatCurrency(invoice.dueAmount)}</td>
                  <td>
                    <Badge tone={invoice.paymentStatus === "Paid" ? "success" : invoice.paymentStatus === "Partial" ? "warning" : "danger"}>
                      {invoice.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

export default BillingPage;
