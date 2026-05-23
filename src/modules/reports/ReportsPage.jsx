import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../core/api/axios";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import StatCard from "../../shared/components/StatCard";
import { formatCurrency, formatDate } from "../../shared/utils/format";

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await api.get("/reports");
        setData(response.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) return <Loader label="Loading reports..." />;

  return (
    <div className="page-stack">
      <PageHeader
        title="Reports"
        subtitle="See daily and monthly performance, margin signals, stock value, due reports, GST, discounts, returns, and movement trends."
      />

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="stats-grid">
        {data.cards.map((card) => (
          <StatCard key={card.title} title={card.title} value={card.value} tone="default" />
        ))}
      </div>

      <div className="split-grid">
        <SectionCard title="Fast-moving medicines">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.fastMovingMedicines.map(([name, total]) => ({ name, total }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#1f8f6b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Slow-moving medicines">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.slowMovingMedicines.map(([name, total]) => ({ name, total }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2f6fed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="split-grid">
        <SectionCard title="Daily sales report">
          <DataTable
            columns={[
              { key: "invoiceNumber", label: "Invoice" },
              { key: "customerName", label: "Customer" },
              { key: "grandTotal", label: "Grand total", render: (row) => formatCurrency(row.grandTotal) },
              { key: "paymentStatus", label: "Payment status" },
            ]}
            rows={data.salesTable}
          />
        </SectionCard>

        <SectionCard title="Purchase report">
          <DataTable
            columns={[
              { key: "purchaseNumber", label: "Purchase" },
              { key: "supplierName", label: "Supplier" },
              { key: "grandTotal", label: "Grand total", render: (row) => formatCurrency(row.grandTotal) },
              { key: "paymentStatus", label: "Payment status" },
            ]}
            rows={data.purchasesTable}
          />
        </SectionCard>
      </div>

      <SectionCard title="Expiry report and low-stock placeholders">
        <DataTable
          columns={[
            { key: "medicine", label: "Medicine", render: (row) => row.medicineId?.name || row.medicine || "-" },
            { key: "batchNumber", label: "Batch" },
            { key: "expiryDate", label: "Expiry date", render: (row) => formatDate(row.expiryDate) },
            { key: "quantity", label: "Qty" },
          ]}
          rows={data.expiringTable}
        />
      </SectionCard>
    </div>
  );
};

export default ReportsPage;
