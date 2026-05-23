import { useEffect, useState } from "react";
import api from "../../core/api/axios";
import Badge from "../../shared/components/Badge";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import StatCard from "../../shared/components/StatCard";
import { formatDate } from "../../shared/utils/format";

const AlertsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await api.get("/alerts");
        setData(response.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load alerts.");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  if (loading) return <Loader label="Loading alerts..." />;

  return (
    <div className="page-stack">
      <PageHeader
        title="Alerts"
        subtitle="Monitor low stock, expiry risk, damaged stock placeholders, and supplier return signals from one page."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stats-grid four-up">
        {data.alertCards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} tone={card.tone} />
        ))}
      </div>

      <div className="split-grid">
        <SectionCard title="Low-stock reorder alerts">
          <DataTable
            columns={[
              { key: "name", label: "Medicine" },
              { key: "stock", label: "Current stock" },
              { key: "minimumStock", label: "Minimum stock" },
              { key: "rackLocation", label: "Rack" },
            ]}
            rows={data.lowStock}
          />
        </SectionCard>

        <SectionCard title="Near-expiry medicines">
          <DataTable
            columns={[
              { key: "batchNumber", label: "Batch" },
              { key: "medicine", label: "Medicine", render: (row) => row.medicineId?.name || "-" },
              { key: "expiryDate", label: "Expiry" , render: (row) => formatDate(row.expiryDate)},
              { key: "quantity", label: "Qty" },
            ]}
            rows={data.nearExpiry}
          />
        </SectionCard>
      </div>

      <div className="split-grid">
        <SectionCard title="Expired stock">
          <DataTable
            columns={[
              { key: "batchNumber", label: "Batch" },
              { key: "medicine", label: "Medicine", render: (row) => row.medicineId?.name || "-" },
              { key: "expiryDate", label: "Expiry", render: (row) => formatDate(row.expiryDate) },
              { key: "quantity", label: "Qty" },
              { key: "status", label: "Status", render: () => <Badge tone="danger">Expired</Badge> },
            ]}
            rows={data.expired}
          />
        </SectionCard>

        <SectionCard title="Damaged stock and disposal">
          <DataTable
            columns={[
              { key: "title", label: "Alert" },
              { key: "status", label: "Status" },
              { key: "note", label: "Dispose/mark damaged stock placeholder" },
            ]}
            rows={data.damagedStock}
          />
        </SectionCard>
      </div>

      <SectionCard title="Auto expiry blocking and loss insight">
        <div className="feature-list">
          <div className="feature-item">{data.info.autoExpiryBlocking}</div>
          <div className="feature-item">{data.info.expiryClearanceDiscount}</div>
          <div className="feature-item">Expiry loss report rows: {data.expiryLossReport.length}</div>
        </div>
      </SectionCard>
    </div>
  );
};

export default AlertsPage;
