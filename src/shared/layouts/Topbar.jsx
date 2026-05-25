import { Building2, LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { navItems } from "../../core/config/navigation";
import GlobalClinicSearch from "../components/GlobalClinicSearch";
import NotificationsMenu from "../components/NotificationsMenu";

const Topbar = ({ onMenuToggle }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentItem = navItems.find((item) =>
    item.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.path)
  );

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button
          type="button"
          className="icon-button mobile-only"
          onClick={onMenuToggle}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="topbar-title-copy">
          <p className="topbar-breadcrumb">WORKSPACE</p>
          <h2>{user?.tenantName || "Arya Clinic Pharmacy"}</h2>
        </div>
      </div>

      <div className="topbar-search">
        <GlobalClinicSearch placeholder="Search medicines, bills, suppliers, customers, alerts..." />
      </div>

      <div className="topbar-actions">
        <NotificationsMenu badgeCountOverride={26} />
        <button type="button" className="icon-button" aria-label="Open clinic quick actions">
          <Building2 size={18} />
        </button>
        <div className="user-chip">
          <div>
            <strong>{user?.name || "Demo Owner"}</strong>
            <span>{user?.role || "TENANT_OWNER"}</span>
          </div>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
