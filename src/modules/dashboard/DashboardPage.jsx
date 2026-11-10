import { useMemo } from "react";
import {
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import EmptyState from "../../shared/components/EmptyState";
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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shellData, loading, errors } = useLayoutData();

  const dashboard = shellData.dashboard || {};
  const kpis = dashboard.kpis || {};

  const revenueChartData = (dashboard.salesSummaryChart || []).map((item) => ({
    label: item.label,
    sales: item.total,
  }));
  const purchaseChartData = dashboard.purchaseSummaryChart || [];
  const currency = (value) => value == null ? "Unavailable" : formatCurrency(value);

  const totalSales = revenueChartData.reduce((sum, item) => sum + item.sales, 0);
  const averageSales = revenueChartData.length ? totalSales / revenueChartData.length : 0;
  const bestDay = revenueChartData.reduce(
    (best, item) => (item.sales > best.sales ? item : best),
    revenueChartData[0] || { label: "No records", sales: 0 }
  );
  const totalPurchases = purchaseChartData.reduce((sum, item) => sum + item.total, 0);
  const averagePurchases = purchaseChartData.length ? totalPurchases / purchaseChartData.length : 0;

  const stockHealthItems = [
    { label: "Low-stock medicines", value: kpis.lowStockMedicines ?? "Unavailable", tone: "amber" },
    { label: "Near-expiry batches", value: kpis.nearExpiryMedicines ?? "Unavailable", tone: "amber" },
    { label: "Expired batches", value: kpis.expiredMedicines ?? "Unavailable", tone: "red" },
  ];
  const stockRisk = [kpis.lowStockMedicines, kpis.nearExpiryMedicines, kpis.expiredMedicines];
  const stockRiskValue = stockRisk.every((value) => typeof value === "number")
    ? stockRisk.reduce((sum, value) => sum + value, 0) : "Unavailable";
  const profitValue = kpis.profitSummary;

  const kpiCards = [
    {
      title: "Sales Today",
      value: currency(kpis.totalSalesToday),
      trend: "Today",
      tone: "green",
      icon: TrendingUp,
    },
    {
      title: "Purchases Today",
      value: currency(kpis.totalPurchaseToday),
      trend: "Today",
      tone: "blue",
      icon: ShoppingCart,
    },
    {
      title: "Net Position",
      value: currency(profitValue),
      trend: "All-time sales less purchases",
      tone: "blue",
      icon: WalletCards,
    },
    {
      title: "Stock Risk",
      value: `${stockRiskValue}`,
      trend: "Medicine and batch flags",
      tone: "orange",
      icon: AlertTriangle,
    },
  ];

  const insightItems = [
    { label: "Low Stock", value: kpis.lowStockMedicines ?? "Unavailable", tone: "amber", icon: "amber" },
    { label: "Near Expiry", value: kpis.nearExpiryMedicines ?? "Unavailable", tone: "blue", icon: "blue" },
    { label: "Expired", value: kpis.expiredMedicines ?? "Unavailable", tone: "red", icon: "red" },
    { label: "Supplier Payments", value: currency(kpis.pendingSupplierPayments), tone: "green", icon: "green" },
    { label: "Customer Dues", value: currency(kpis.customerDues), tone: "purple", icon: "purple" },
    { label: "Fast Moving", value: kpis.fastMovingMedicines?.length ?? "Unavailable", tone: "teal", icon: "teal" },
    { label: "Slow Moving", value: kpis.slowMovingMedicines?.length ?? "Unavailable", tone: "orange", icon: "orange" },
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

    return rows;
  }, [shellData.sales]);

  const recentAlerts = useMemo(() => {
    const rows = [];

    const expiredBatch = shellData.alerts?.expired?.[0];
    if (expiredBatch) {
      rows.push({
        title: "Expired medicine alert",
        description: `${shellData.alerts.expired.length} expired batches require review.`,
        time: "",
        tone: "red",
      });
    }

    const lowStockItems = shellData.alerts?.lowStock || [];
    if (lowStockItems.length) {
      rows.push({
        title: "Low stock alert",
        description: `${lowStockItems.length} medicines are running low on stock.`,
        time: "",
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
        time: "",
        tone: "blue",
      });
    }

    return rows;
  }, [shellData.alerts, shellData.suppliers]);

  const pendingActions = [
    {
      label: "Remove expired medicine",
      count: kpis.expiredMedicines ?? "Unavailable",
      tone: "red",
      onClick: () => navigate("/alerts"),
    },
    {
      label: "Clear supplier payment",
      count: errors.suppliers ? "Unavailable" : (shellData.suppliers || []).filter((supplier) => Number(supplier.paymentDue) > 0).length,
      tone: "blue",
      onClick: () => navigate("/purchases"),
    },
    {
      label: "Review customer dues",
      count: errors.customers ? "Unavailable" : (shellData.customers || []).filter((customer) => Number(customer.dueAmount) > 0).length,
      tone: "purple",
      onClick: () => navigate("/people"),
    },
    {
      label: "Restock low-stock medicines",
      count: kpis.lowStockMedicines ?? "Unavailable",
      tone: "amber",
      onClick: () => navigate("/inventory/low-stock"),
    },
  ];

  if (loading && !shellData.dashboard) {
    return <Loader label="Loading dashboard..." />;
  }

  if (!shellData.dashboard || errors.dashboard) {
    return <EmptyState title="Dashboard unavailable" description={errors.dashboard || "No dashboard data was returned."} />;
  }

  return (
    <div className="dashboard-main">
      <div className="dashboard-content">
        <DashboardHero
          userName={user?.name || "there"}
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
            totalSales={revenueChartData.length ? formatCurrency(totalSales) : "No records"}
            averageSales={revenueChartData.length ? formatCurrency(averageSales) : "No records"}
            bestDay={bestDay.label}
          />

          <div className="dashboard-analytics-side-premium">
            <PurchaseOverviewCard
              data={purchaseChartData}
              totalPurchases={purchaseChartData.length ? formatCurrency(totalPurchases) : "No records"}
              averagePurchases={purchaseChartData.length ? formatCurrency(averagePurchases) : "No records"}
            />
          </div>
        </section>

        <section className="dashboard-health-grid">
          <ProfitHealthCard
            profitValue={currency(profitValue)}
            supplierDues={currency(kpis.pendingSupplierPayments)}
            customerDues={currency(kpis.customerDues)}
          />
          <StockHealthCard items={stockHealthItems} />
        </section>

        <section className="dashboard-operations-grid-premium">
          <RecentAlertsCard error={errors.alerts || errors.suppliers} alerts={recentAlerts} onViewAll={() => navigate("/alerts")} />
          <FastMovingMedicinesCard error={errors.sales} rows={fastMovingRows} onViewAll={() => navigate("/reports")} />
          <PendingActionsCard actions={pendingActions} />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
