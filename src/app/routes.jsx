import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../core/auth/ProtectedRoute";
import LoginPage from "../modules/auth/LoginPage";
import AlertsPage from "../modules/alerts/AlertsPage";
import BillingPage from "../modules/billing/BillingPage";
import ClinicPage from "../modules/clinic/ClinicPage";
import DashboardPage from "../modules/dashboard/DashboardPage";
import InventoryAdjustmentsPage from "../modules/inventory/InventoryAdjustmentsPage";
import InventoryExpiringSoonPage from "../modules/inventory/InventoryExpiringSoonPage";
import InventoryLowStockPage from "../modules/inventory/InventoryLowStockPage";
import InventoryMedicinesPage from "../modules/inventory/InventoryMedicinesPage";
import InventoryPage from "../modules/inventory/InventoryPage";
import InventoryOverviewPage from "../modules/inventory/InventoryOverviewPage";
import InventoryReturnsPage from "../modules/inventory/InventoryReturnsPage";
import InventoryStockMovementsPage from "../modules/inventory/InventoryStockMovementsPage";
import PeoplePage from "../modules/people/PeoplePage";
import PurchasesPage from "../modules/purchases/PurchasesPage";
import ReportsPage from "../modules/reports/ReportsPage";
import SettingsPage from "../modules/settings/SettingsPage";
import MainLayout from "../shared/layouts/MainLayout";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "inventory",
        element: <InventoryPage />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: "overview", element: <InventoryOverviewPage /> },
          { path: "medicines", element: <InventoryMedicinesPage /> },
          { path: "stock-movements", element: <InventoryStockMovementsPage /> },
          { path: "low-stock", element: <InventoryLowStockPage /> },
          { path: "expiring-soon", element: <InventoryExpiringSoonPage /> },
          { path: "returns", element: <InventoryReturnsPage /> },
          { path: "adjustments", element: <InventoryAdjustmentsPage /> },
        ],
      },
      { path: "billing", element: <BillingPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "people", element: <PeoplePage /> },
      { path: "alerts", element: <AlertsPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "clinic", element: <ClinicPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

export default router;
