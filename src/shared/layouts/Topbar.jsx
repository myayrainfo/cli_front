import { LogOut, Menu, Store } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { navItems } from "../../core/config/navigation";
import GlobalSearch from "../components/GlobalSearch";
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
        <div>
          <p className="eyebrow">{currentItem?.label || "Clinic ERP"}</p>
          <h2>{user?.tenantName || "Arya Clinic Pharmacy"}</h2>
        </div>
      </div>

      <div className="topbar-search">
        <GlobalSearch />
      </div>

      <div className="topbar-actions">
        <NotificationsMenu />
        <div className="user-chip">
          <span className="user-chip-icon">
            <Store size={16} />
          </span>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
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
