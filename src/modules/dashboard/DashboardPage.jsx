import { useMemo } from "react";
import {
  AlertTriangle,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import Loader from "../../shared/components/Loader";
import { useLayoutData } from "../../shared/layouts/LayoutDataContext";
import { formatCurrency } from "../../shared/utils/format";
import DashboardHero from "./components/DashboardHero";
import FastMovingMedicinesCard from "./components/FastMovingMedicinesCard";
import InsightStrip from "./components/InsightStrip";
import PendingActionsCard from "./components/PendingActionsCard";
import PrimaryKpiCard from "./components/PrimaryKpiCard";
import ProfitHealthCard from "./components/ProfitHealthCard";
import PurchaseOverviewCard from "./components/PurchaseOverviewCard";
import RecentAlertsCard from "./components/RecentAlertsCard";
import RevenueSalesOverview from "./components/RevenueSalesOverview";
import StockHealthCard from "./components/StockHealthCard";

const fallbackRevenueChart = [
  { label: "19 May", sales: 142, orders: 3, purchases: 980 },
  { label: "20 May", sales: 286, orders: 7, purchases: 1840 },
  { label: "21 May", sales: 124, orders: 2, purchases: 1325 },
  { label: "22 May", sales: 110, orders: 2, purchases: 1245 },
  { label: "23 May", sales: 200.05, orders: 4, purchases: 1500 },
];

const fallbackFastMovingRows = [
  { medicine: "Paracetamol 650mg", soldQty: 120, revenue: formatCurrency(1200) },
  { medicine: "Azithromycin 500mg", soldQty: 85, revenue: formatCurrency(1020) },
  { medicine: "Cetirizine 10mg", soldQty: 78, revenue: formatCurrency(780) },
  { medicine: "Pantoprazole 40mg", soldQty: 65, revenue: formatCurrency(650) },
];

const fallbackAlerts = [
  {
    title: "Expired medicine alert",
    description: "1 expired medicine found. Review and remove.",
    time: "7d ago",
    tone: "red",
  },
  {
    title: "Low stock alert",
    description: "5 medicines are running low on stock.",
    time: "2d ago",
    tone: "amber",
  },
  {
    title: "Supplier payment due",
    description: "₹5,000 pending payment to suppliers.",
    time: "1d ago",
    tone: "blue",
  },
];

const formatCompactDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "-");

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const toRelativeTime = (value, fallback = "1d ago") => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const diffHours = Math.max(1, Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shellData, loading, errors } = useLayoutData();

  const dashboard = shellData.dashboard || {};
  const kpis = dashboard.kpis || {};

  const revenueChartData = useMemo(() => {
    const sales = Array.isArray(dashboard.salesSummaryChart) ? dashboard.salesSummaryChart : [];
    const purchases = Array.isArray(dashboard.purchaseSummaryChart) ? dashboard.purchaseSummaryChart : [];

    if (!sales.length && !purchases.length) {
      return fallbackRevenueChart;
    }

    return sales.map((item, index) => ({
      label: formatCompactDate(item.label),
      sales: Number(item.total) || 0,
      orders: Math.max(1, Math.round((Number(item.total) || 0) / 120)),
      purchases: Number(purchases[index]?.total) || 0,
    }));
  }, [dashboard.purchaseSummaryChart, dashboard.salesSummaryChart]);

  const purchaseChartData = useMemo(
    () =>
      revenueChartData.map((item) => ({
        label: item.label,
        total: item.purchases,
      })),
    [revenueChartData]
  );

  const totalSales = revenueChartData.reduce((sum, item) => sum + item.sales, 0);
  const averageSales = revenueChartData.length ? totalSales / revenueChartData.length : 0;
  const bestDay = revenueChartData.reduce(
    (best, item) => (item.sales > best.sales ? item : best),
    revenueChartData[0] || { label: "20/5/2026", sales: 0 }
  );
  const totalPurchases = purchaseChartData.reduce((sum, item) => sum + item.total, 0);
  const averagePurchases = purchaseChartData.length ? totalPurchases / purchaseChartData.length : 0;

  const availableStock = (shellData.medicines || []).reduce(
    (sum, medicine) => sum + (Number(medicine.totalStock) || Number(medicine.quantity) || 0),
    0
  );

  const stockHealthItems = [
    {
      label: "Available Stock",
      value: availableStock || 127,
      progress: 100,
      tone: "green",
    },
    {
      label: "Low Stock",
      value: kpis.lowStockMedicines ?? 5,
      progress: availableStock ? Math.min(100, ((kpis.lowStockMedicines || 0) / availableStock) * 1000) : 22,
      tone: "amber",
    },
    {
      label: "Near Expiry",
      value: kpis.nearExpiryMedicines ?? 5,
      progress: availableStock ? Math.min(100, ((kpis.nearExpiryMedicines || 0) / availableStock) * 1000) : 22,
      tone: "blue",
    },
    {
      label: "Expired",
      value: kpis.expiredMedicines ?? 1,
      progress: availableStock ? Math.min(100, ((kpis.expiredMedicines || 0) / availableStock) * 1000) : 12,
      tone: "red",
    },
  ];

  const stockRisk = (kpis.lowStockMedicines || 0) + (kpis.nearExpiryMedicines || 0) + (kpis.expiredMedicines || 0);
  const stockRiskValue = stockRisk || 11;
  const profitValue = kpis.profitSummary ?? -4845.75;

  const kpiCards = [
    {
      title: "Sales Today",
      value: formatCurrency(kpis.totalSalesToday ?? 862.05),
      trend: "↑ 12.5% from yesterday",
      tone: "green",
      icon: TrendingUp,
      sparkline: [32, 44, 28, 52, 46, 64],
      accentColor: "#10b981",
    },
    {
      title: "Purchases Today",
      value: formatCurrency(kpis.totalPurchaseToday ?? 0),
      trend: "↓ 100% from yesterday",
      tone: "blue",
      icon: ShoppingCart,
      sparkline: [64, 40, 35, 28, 16, 8],
      accentColor: "#3b82f6",
    },
    {
      title: "Net Profit",
      value: formatCurrency(profitValue),
      trend: "↓ 100% from yesterday",
      tone: "purple",
      icon: WalletCards,
      sparkline: [44, 38, 28, 22, 16, 10],
      accentColor: "#8b5cf6",
    },
    {
      title: "Stock Risk",
      value: `${stockRiskValue}`,
      trend: "Needs your attention",
      tone: "orange",
      icon: AlertTriangle,
      ringValue: Math.min(100, stockRiskValue * 9),
      ringColor: "#f59e0b",
    },
  ];

  const insightItems = [
    { label: "Low Stock", value: kpis.lowStockMedicines ?? 5, tone: "amber", icon: "amber" },
    { label: "Near Expiry", value: kpis.nearExpiryMedicines ?? 5, tone: "blue", icon: "blue" },
    { label: "Expired", value: kpis.expiredMedicines ?? 1, tone: "red", icon: "red" },
    { label: "Supplier Payments", value: formatCurrency(kpis.pendingSupplierPayments ?? 5000), tone: "green", icon: "green" },
    { label: "Customer Dues", value: formatCurrency(kpis.customerDues ?? 750), tone: "purple", icon: "purple" },
    { label: "Fast Moving", value: kpis.fastMovingMedicines?.length ?? 5, tone: "teal", icon: "teal" },
    { label: "Slow Moving", value: kpis.slowMovingMedicines?.length ?? 5, tone: "orange", icon: "orange" },
  ];

  const fastMovingRows = useMemo(() => {
    const movementMap = new Map();

    (shellData.sales || []).forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const key = item.medicineName || "Unknown medicine";
        const current = movementMap.get(key) || { medicine: key, soldQty: 0, revenue: 0 };
        current.soldQty += Number(item.quantity) || 0;
        current.revenue += Number(item.total) || 0;
        movementMap.set(key, current);
      });
    });

    const rows = [...movementMap.values()]
      .sort((left, right) => right.soldQty - left.soldQty)
      .slice(0, 4)
      .map((row) => ({
        medicine: row.medicine,
        soldQty: row.soldQty,
        revenue: formatCurrency(row.revenue),
      }));

    return rows.length
      ? [...rows, ...fallbackFastMovingRows.filter((fallback) => !rows.some((row) => row.medicine === fallback.medicine))].slice(0, 4)
      : fallbackFastMovingRows;
  }, [shellData.sales]);

  const recentAlerts = useMemo(() => {
    const rows = [];

    const expiredBatch = shellData.alerts?.expired?.[0];
    if (expiredBatch) {
      rows.push({
        title: "Expired medicine alert",
        description: `1 expired medicine found. Review and remove.`,
        time: toRelativeTime(expiredBatch.expiryDate, "7d ago"),
        tone: "red",
      });
    }

    const lowStockItems = shellData.alerts?.lowStock || [];
    if (lowStockItems.length) {
      rows.push({
        title: "Low stock alert",
        description: `${lowStockItems.length} medicines are running low on stock.`,
        time: "2d ago",
        tone: "amber",
      });
    }

    const supplierDue = (shellData.suppliers || []).reduce(
      (sum, supplier) => sum + (Number(supplier.paymentDue) || 0),
      0
    );
    if (supplierDue > 0) {
      rows.push({
        title: "Supplier payment due",
        description: `${formatCurrency(supplierDue)} pending payment to suppliers.`,
        time: "1d ago",
        tone: "blue",
      });
    }

    if (!rows.length) {
      return fallbackAlerts;
    }

    return [...rows, ...fallbackAlerts.filter((fallback) => !rows.some((row) => row.title === fallback.title))].slice(0, 3);
  }, [shellData.alerts, shellData.suppliers]);

  const pendingActions = [
    {
      label: "Remove expired medicine",
      count: kpis.expiredMedicines ?? 1,
      tone: "red",
      onClick: () => navigate("/alerts"),
    },
    {
      label: "Clear supplier payment",
      count: (shellData.suppliers || []).filter((supplier) => Number(supplier.paymentDue) > 0).length || 1,
      tone: "blue",
      onClick: () => navigate("/purchases"),
    },
    {
      label: "Review customer dues",
      count: (shellData.customers || []).filter((customer) => Number(customer.dueAmount) > 0).length || 1,
      tone: "purple",
      onClick: () => navigate("/people"),
    },
    {
      label: "Restock low-stock medicines",
      count: kpis.lowStockMedicines ?? 5,
      tone: "amber",
      onClick: () => navigate("/inventory/low-stock"),
    },
  ];

  if (loading && !shellData.dashboard) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <main className="dashboard-main">
      <div className="dashboard-content">
        {errors.dashboard ? <div className="error-banner">{errors.dashboard}</div> : null}

        <DashboardHero
          userName={user?.name || "Demo Owner"}
          onNewBill={() => navigate("/billing")}
          onAddMedicine={() => navigate("/inventory/medicines")}
          onPurchaseEntry={() => navigate("/purchases")}
        />

        <section className="dashboard-primary-kpis">
          {kpiCards.map((card) => (
            <PrimaryKpiCard key={card.title} {...card} />
          ))}
        </section>

        <InsightStrip items={insightItems} />

        <section className="dashboard-analytics-grid-premium">
          <RevenueSalesOverview
            data={revenueChartData}
            totalSales={formatCurrency(totalSales || 862.05)}
            averageSales={formatCurrency(averageSales || 172.41)}
            bestDay={bestDay?.label || "20/5/2026"}
          />

          <div className="dashboard-analytics-side-premium">
            <PurchaseOverviewCard
              data={purchaseChartData}
              totalPurchases={formatCurrency(totalPurchases || 6890)}
              averagePurchases={formatCurrency(averagePurchases || 1378)}
            />

            <div className="dashboard-health-grid">
              <ProfitHealthCard
                profitValue={formatCurrency(profitValue)}
                supplierDues={formatCurrency(kpis.pendingSupplierPayments ?? 5000)}
                customerDues={formatCurrency(kpis.customerDues ?? 750)}
              />
              <StockHealthCard items={stockHealthItems} />
            </div>
          </div>
        </section>

        <section className="dashboard-operations-grid-premium">
          <RecentAlertsCard alerts={recentAlerts} onViewAll={() => navigate("/alerts")} />
          <FastMovingMedicinesCard rows={fastMovingRows} onViewAll={() => navigate("/reports")} />
          <PendingActionsCard actions={pendingActions} />
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
