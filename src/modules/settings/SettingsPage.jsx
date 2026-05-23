import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get("/settings");
        setSettings(response.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) return <Loader label="Loading settings..." />;

  const store = settings?.storeProfile;

  return (
    <div className="page-stack">
      <PageHeader
        title="Settings"
        subtitle="Control store profile, GST, invoice template, category setup, rack setup, backups, branches, audit logs, and payment UI placeholders."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="split-grid">
        <SectionCard title="Store profile and operational settings">
          <div className="settings-grid">
            <div><strong>Store profile:</strong> {store?.storeName}</div>
            <div><strong>GST settings:</strong> {store?.settings?.gstPercentage}%</div>
            <div><strong>Invoice template:</strong> {store?.settings?.invoiceTemplate}</div>
            <div><strong>Discount settings:</strong> {store?.settings?.defaultDiscount}% default</div>
            <div><strong>Medicine category setup:</strong> {store?.settings?.medicineCategories?.join(", ")}</div>
            <div><strong>Rack/shelf setup:</strong> {store?.settings?.racks?.join(", ")}</div>
            <div><strong>Backup settings:</strong> {store?.settings?.backupEnabled ? "Enabled" : "Disabled"}</div>
            <div><strong>Branch settings:</strong> {store?.settings?.branches?.map((branch) => branch.name).join(", ")}</div>
          </div>
        </SectionCard>

        <SectionCard title="Payment system UI">
          <div className="settings-grid">
            <div><strong>Current plan:</strong> {settings?.payment?.currentPlan}</div>
            <div><strong>Payment status:</strong> {settings?.payment?.paymentStatus}</div>
            <div><strong>Upgrade plan button:</strong> Placeholder</div>
            <div><strong>Invoice download:</strong> Placeholder</div>
            <div><strong>Payment gateway:</strong> UI only for now</div>
          </div>
        </SectionCard>
      </div>

      <div className="split-grid">
        <SectionCard title="Payment history table">
          <DataTable
            columns={[
              { key: "id", label: "Ref" },
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount" },
              { key: "status", label: "Status" },
              { key: "invoice", label: "Invoice download placeholder" },
            ]}
            rows={settings?.payment?.paymentHistory || []}
          />
        </SectionCard>

        <SectionCard title="Audit logs">
          <DataTable
            columns={[
              { key: "module", label: "Module" },
              { key: "action", label: "Action" },
              { key: "message", label: "Message" },
              { key: "createdAt", label: "Created at" },
            ]}
            rows={settings?.auditLogs || []}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default SettingsPage;
