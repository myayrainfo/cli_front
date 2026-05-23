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

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/dashboard/summary");
        setData(response.data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <div className="error-banner">{error}</div>;

  const kpis = data?.kpis || {};
  const statCards = [
    ["Total sales today", formatCurrency(kpis.totalSalesToday), "success"],
    ["Total purchase today", formatCurrency(kpis.totalPurchaseToday), "info"],
    ["Profit summary", formatCurrency(kpis.profitSummary), "default"],
    ["Low stock medicines", kpis.lowStockMedicines, "warning"],
    ["Near-expiry medicines", kpis.nearExpiryMedicines, "info"],
    ["Expired medicines", kpis.expiredMedicines, "danger"],
    ["Pending supplier payments", formatCurrency(kpis.pendingSupplierPayments), "warning"],
    ["Customer dues", formatCurrency(kpis.customerDues), "warning"],
    ["Fast-moving medicines", kpis.fastMovingMedicines?.length || 0, "success"],
    ["Slow-moving medicines", kpis.slowMovingMedicines?.length || 0, "default"],
  ];

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Track sales, purchases, stock health, and recent activity from one clean control room."
      />

      <div className="stats-grid dashboard-kpis">
        {statCards.map(([title, value, tone]) => (
          <StatCard key={title} title={title} value={value} tone={tone} />
        ))}
      </div>

      <div className="split-grid dashboard-section">
        <SectionCard title="Sales summary chart">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.salesSummaryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#1f8f6b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Purchase summary chart">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.purchaseSummaryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2f6fed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="split-grid dashboard-section">
        <SectionCard title="Recent bills table">
          <DataTable
            columns={[
              { key: "invoiceNumber", label: "Invoice" },
              { key: "customerName", label: "Customer" },
              { key: "grandTotal", label: "Total", render: (row) => formatCurrency(row.grandTotal) },
              { key: "paymentStatus", label: "Payment" },
              { key: "saleDate", label: "Date", render: (row) => formatDate(row.saleDate) },
            ]}
            rows={data.recentBills}
          />
        </SectionCard>

        <SectionCard title="Recent stock updates table">
          <DataTable
            columns={[
              { key: "medicine", label: "Medicine", render: (row) => row.medicineId?.name || "-" },
              { key: "type", label: "Type" },
              { key: "quantity", label: "Qty" },
              { key: "reason", label: "Reason" },
              { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
            ]}
            rows={data.recentStockUpdates}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardPage;
