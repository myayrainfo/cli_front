import { NavLink, Outlet } from "react-router-dom";
import { InventoryModuleProvider } from "./InventoryModuleContext";
import MedicineModal from "./components/MedicineModal";
import { InventoryConfirmDialog, InventoryDetailsDrawer, InventoryToastStack } from "./components/InventoryOverlay";

const inventoryRoutes = [
  { to: "/inventory/overview", label: "Overview" },
  { to: "/inventory/medicines", label: "Medicines" },
  { to: "/inventory/stock-movements", label: "Stock Movements" },
  { to: "/inventory/low-stock", label: "Low Stock" },
  { to: "/inventory/expiring-soon", label: "Expiring Soon" },
  { to: "/inventory/returns", label: "Returns" },
  { to: "/inventory/adjustments", label: "Adjustments" },
];

const InventoryPage = () => (
  <InventoryModuleProvider>
    <div className="page-stack inventory-module-shell">
      <section className="card inventory-subnav-card">
        <div>
          <span className="eyebrow">Inventory Workspace</span>
          <h2>Inventory</h2>
        </div>
        <nav className="inventory-subnav">
          {inventoryRoutes.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `inventory-subnav-link ${isActive ? "active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </section>

      <p className="inventory-local-note">Demo inventory: records and summary figures use sample data. Changes are kept only for this session and are not saved to the server.</p>
      <Outlet />
      <MedicineModal />
      <InventoryDetailsDrawer />
      <InventoryConfirmDialog />
      <InventoryToastStack />
    </div>
  </InventoryModuleProvider>
);

export default InventoryPage;
