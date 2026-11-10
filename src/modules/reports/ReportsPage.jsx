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
import Badge from "../../shared/components/Badge";
import EmptyState from "../../shared/components/EmptyState";
import DataTable from "../../shared/components/DataTable";
import Loader from "../../shared/components/Loader";
import PageHeader from "../../shared/components/PageHeader";
import SectionCard from "../../shared/components/SectionCard";
import StatCard from "../../shared/components/StatCard";
import { formatCurrency, formatDate } from "../../shared/utils/format";

// Describe the existing response accurately; no reporting calculations happen here.
const reportLabels = {
  "Daily sales report": ["Total sales", "All recorded invoices"],
  "Monthly sales report": ["Sales total (same scope)", "Same all-time total; monthly breakdown unavailable"],
  "Profit/loss report": ["Sales less purchases", "Not a net-profit calculation"],
  "Stock valuation": ["Purchase-price sum", "Not weighted by stock quantity"],
  "Expiry report": ["Expired batches", "Batch count"],
  "Purchase report": ["Total purchases", "All recorded purchases"],
  "Supplier due report": ["Supplier dues", "Outstanding supplier balances"],
  "Customer due report": ["Customer dues", "Outstanding customer balances"],
  "GST report": ["GST total", "All recorded invoices"],
  "Discount report": ["Discount records", "Record count, not discount amount"],
  "Return report": ["Return records", "Record count"],
  "Low-stock report": ["Stock thresholds set", "Medicines with a minimum-stock threshold"],
};
const countReports = new Set(["Expiry report", "Discount report", "Return report", "Low-stock report"]);

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
    <div className="page-stack reports-page">
      <PageHeader
        title="Reports"
        subtitle="Review recorded sales, purchases, medicine movement and expiry data."
      />

      {error ? <div className="error-banner" role="alert">{error}</div> : null}
      {!error && !data ? <EmptyState title="Reports unavailable" description="No report data was returned." /> : null}

      {!error && data ? (
        <>
          <p className="module-note">Totals cover all recorded data. Daily and monthly breakdowns are not available in this report.</p>

          <div className="stats-grid">
            {(data.cards || []).map((card) => (
              <StatCard
                key={card.title}
                title={reportLabels[card.title]?.[0] || card.title}
                value={card.value == null ? "Unavailable" : countReports.has(card.title) ? card.value : formatCurrency(card.value)}
                subtitle={reportLabels[card.title]?.[1]}
                tone="default"
              />
            ))}
          </div>

          <div className="split-grid">
            <SectionCard title="Fast-moving medicines">
              {data.fastMovingMedicines?.length ? (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart accessibilityLayer margin={{ top: 12, right: 12, bottom: 24, left: 0 }} data={data.fastMovingMedicines.map(([name, total]) => ({ name, total }))}>
                      <CartesianGrid stroke="#e7e9e6" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#717982", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#e7e9e6" }} interval="preserveStartEnd" tickFormatter={(name) => name.length > 16 ? `${name.slice(0, 16)}...` : name} />
                      <YAxis tick={{ fill: "#717982", fontSize: 11 }} tickLine={false} axisLine={false} width={44} label={{ value: "Quantity", angle: -90, position: "insideLeft", fill: "#717982", fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "#f3f5f2" }} contentStyle={{ border: "1px solid #e7e9e6", borderRadius: 8, fontSize: 12, color: "#20252b" }} />
                      <Bar dataKey="total" name="Quantity sold" fill="#63836c" radius={[3, 3, 0, 0]} maxBarSize={48} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState title="No movement recorded" description="Medicine movement will appear when report data is available." />}
            </SectionCard>

            <SectionCard title="Slow-moving medicines">
              {data.slowMovingMedicines?.length ? (
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart accessibilityLayer margin={{ top: 12, right: 12, bottom: 24, left: 0 }} data={data.slowMovingMedicines.map(([name, total]) => ({ name, total }))}>
                      <CartesianGrid stroke="#e7e9e6" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#717982", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#e7e9e6" }} interval="preserveStartEnd" tickFormatter={(name) => name.length > 16 ? `${name.slice(0, 16)}...` : name} />
                      <YAxis tick={{ fill: "#717982", fontSize: 11 }} tickLine={false} axisLine={false} width={44} label={{ value: "Quantity", angle: -90, position: "insideLeft", fill: "#717982", fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "#f3f5f2" }} contentStyle={{ border: "1px solid #e7e9e6", borderRadius: 8, fontSize: 12, color: "#20252b" }} />
                      <Bar dataKey="total" name="Quantity sold" fill="#758594" radius={[3, 3, 0, 0]} maxBarSize={48} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState title="No movement recorded" description="Medicine movement will appear when report data is available." />}
            </SectionCard>
          </div>

          <div className="module-records">
            <SectionCard title="Recent sales" className="report-money-table">
              <DataTable
                columns={[
                  { key: "invoiceNumber", label: "Invoice" },
                  { key: "customerName", label: "Customer" },
                  { key: "grandTotal", label: "Grand total", render: (row) => formatCurrency(row.grandTotal) },
                  { key: "paymentStatus", label: "Payment status", render: (row) => <Badge>{row.paymentStatus || "Not recorded"}</Badge> },
                ]}
                rows={data.salesTable}
                emptyText="No sales found"
                emptyDescription="No matching records were returned by the report."
              />
            </SectionCard>

            <SectionCard title="Purchase report" className="report-money-table">
              <DataTable
                columns={[
                  { key: "purchaseNumber", label: "Purchase" },
                  { key: "supplierName", label: "Supplier" },
                  { key: "grandTotal", label: "Grand total", render: (row) => formatCurrency(row.grandTotal) },
                  { key: "paymentStatus", label: "Payment status", render: (row) => <Badge>{row.paymentStatus || "Not recorded"}</Badge> },
                ]}
                rows={data.purchasesTable}
                emptyText="No purchases found"
                emptyDescription="No matching records were returned by the report."
              />
            </SectionCard>
          </div>

          <SectionCard title="Expired and upcoming expiry batches" className="report-expiry-table">
            <DataTable
              columns={[
                { key: "medicine", label: "Medicine", render: (row) => row.medicineId?.name || row.medicine || "-" },
                { key: "batchNumber", label: "Batch" },
                { key: "expiryDate", label: "Expiry date", render: (row) => formatDate(row.expiryDate) },
                { key: "quantity", label: "Qty" },
              ]}
              rows={data.expiringTable}
              emptyText="No expiry records found"
              emptyDescription="No matching records were returned by the report."
            />
          </SectionCard>
        </>
      ) : null}
    </div>
  );
};

export default ReportsPage;
