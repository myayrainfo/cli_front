import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
import EmptyState from "../../shared/components/EmptyState";
import { formatDate } from "../../shared/utils/format";
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
    <div className="page-stack settings-page">
      <PageHeader
        title="Settings"
        subtitle="View store configuration, account details and recent audit activity."
      />

      {error ? <div className="error-banner" role="alert">{error}</div> : null}
      {!error && !settings ? <EmptyState title="Settings unavailable" description="No configuration data was returned." /> : null}

      {!error && settings ? (
        <>
          <p className="module-note">Read-only view. Configuration changes cannot be saved from this page.</p>

          <div className="split-grid">
            <SectionCard title="Store configuration">
              <dl className="settings-grid">
                <div><dt>Store name</dt><dd>{store?.storeName || "Not configured"}</dd></div>
                <div><dt>GST rate</dt><dd>{store?.settings?.gstPercentage == null ? "Not configured" : `${store.settings.gstPercentage}%`}</dd></div>
                <div><dt>Invoice template</dt><dd>{store?.settings?.invoiceTemplate || "Not configured"}</dd></div>
                <div><dt>Default discount</dt><dd>{store?.settings?.defaultDiscount == null ? "Not configured" : `${store.settings.defaultDiscount}%`}</dd></div>
                <div><dt>Medicine categories</dt><dd>{store?.settings?.medicineCategories?.join(", ") || "Not configured"}</dd></div>
                <div><dt>Racks / shelves</dt><dd>{store?.settings?.racks?.join(", ") || "Not configured"}</dd></div>
                <div><dt>Backup setting</dt><dd>{store?.settings?.backupEnabled == null ? "Not configured" : store.settings.backupEnabled ? "Enabled" : "Disabled"}</dd></div>
                <div><dt>Branches</dt><dd>{store?.settings?.branches?.map((branch) => branch.name).join(", ") || "Not configured"}</dd></div>
              </dl>
            </SectionCard>

            <SectionCard title="Account information">
              <dl className="settings-grid">
                <div><dt>Current plan</dt><dd>{settings?.payment?.currentPlan || "Unavailable"}</dd></div>
                <div><dt>Payment status</dt><dd><Badge>{settings?.payment?.paymentStatus || "Unavailable"}</Badge></dd></div>
              </dl>
              <p className="module-note">Plan upgrades, payment processing and account invoice downloads are not available here.</p>
            </SectionCard>
          </div>

          <div className="module-records">
            <SectionCard title="Payment history">
              <EmptyState title="Payment history unavailable" description="The service currently supplies sample payment history. Actual payment records are not connected to this view." />
            </SectionCard>

            <SectionCard title="Audit logs">
              <DataTable
                columns={[
                  { key: "module", label: "Module" },
                  { key: "action", label: "Action" },
                  { key: "message", label: "Message" },
                  { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
                ]}
                rows={settings?.auditLogs || []}
                emptyText="No audit activity"
                emptyDescription="No audit logs were returned for this account."
              />
            </SectionCard>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SettingsPage;
