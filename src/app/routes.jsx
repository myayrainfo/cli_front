import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../core/auth/ProtectedRoute";
import LoginPage from "../modules/auth/LoginPage";
import AlertsPage from "../modules/alerts/AlertsPage";
import BillingPage from "../modules/billing/BillingPage";
import ClinicPage from "../modules/clinic/ClinicPage";
import DashboardPage from "../modules/dashboard/DashboardPage";
import InventoryPage from "../modules/inventory/InventoryPage";
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
      { path: "inventory", element: <InventoryPage /> },
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
