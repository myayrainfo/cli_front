import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import { formatCurrency } from "../../shared/utils/format";

const PeoplePage = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const [customersRes, suppliersRes] = await Promise.all([
          api.get("/people/customers"),
          api.get("/people/suppliers"),
        ]);
        setCustomers(customersRes.data);
        setSuppliers(suppliersRes.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load people data.");
      } finally {
        setLoading(false);
      }
    };

    loadPeople();
  }, []);

  if (loading) return <Loader label="Loading customers and suppliers..." />;

  return (
    <div className="page-stack">
      <PageHeader
        title="People"
        subtitle="Group customer and supplier operations into one clean workspace with due tracking, contact details, reminders, and history placeholders."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="tab-row">
        <button className={`tab-button ${activeTab === "customers" ? "active" : ""}`} type="button" onClick={() => setActiveTab("customers")}>
          Customers
        </button>
        <button className={`tab-button ${activeTab === "suppliers" ? "active" : ""}`} type="button" onClick={() => setActiveTab("suppliers")}>
          Suppliers
        </button>
      </div>

      {activeTab === "customers" ? (
        <SectionCard title="Customer features">
          <DataTable
            columns={[
              { key: "name", label: "Customer profile" },
              { key: "phone", label: "Phone number" },
              { key: "address", label: "Address" },
              { key: "dueAmount", label: "Due amount", render: (row) => formatCurrency(row.dueAmount) },
              { key: "loyaltyPoints", label: "Loyalty points" },
              { key: "regularCustomerDiscount", label: "Regular customer discount" },
              {
                key: "reminders",
                label: "Reminders and tracking",
                render: (row) =>
                  `${row.reminderPreference || "Reminder preference pending"} / Chronic medicine customer tracking: ${
                    row.chronicTracking ? "Yes" : "No"
                  }`,
              },
            ]}
            rows={customers}
          />
          <div className="feature-list compact-list">
            <div className="feature-item">Purchase history and prescription upload are represented as grouped placeholders for the next phase.</div>
            <div className="feature-item">Customer refill reminder and WhatsApp/SMS reminder are internally planned and surfaced in this page.</div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Supplier features">
          <DataTable
            columns={[
              { key: "name", label: "Supplier profile" },
              { key: "contactPerson", label: "Contact person details" },
              { key: "phone", label: "Contact details" },
              { key: "companiesSupplied", label: "Medicine companies supplied", render: (row) => row.companiesSupplied?.join(", ") },
              { key: "paymentDue", label: "Payment due", render: (row) => formatCurrency(row.paymentDue) },
              { key: "gstNumber", label: "GST number" },
              { key: "performance", label: "Supplier performance" },
            ]}
            rows={suppliers}
          />
          <div className="feature-list compact-list">
            <div className="feature-item">Purchase history, return history, and supplier return management are grouped here as workflow placeholders.</div>
            <div className="feature-item">This view is designed to expand into detailed supplier-ledger flows without changing the sidebar.</div>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default PeoplePage;
