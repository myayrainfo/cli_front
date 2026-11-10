import { useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { navItems } from "../../core/config/navigation";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? "show" : ""}`} onClick={onClose} />
      <aside id="workspace-navigation" aria-label="Workspace navigation" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            <Plus size={20} />
          </span>
          <div className="brand-copy">
            <strong>AYRA</strong>
            <strong>CLINIC ERP</strong>
            <p>Clinic workspace</p>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isParentActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

            return (
              <div
                key={item.path}
                className={`nav-group ${isParentActive ? "expanded" : ""}`}
              >
                {item.path === "/" || item.path === "/reports" || item.path === "/settings" ? (
                  <span className="nav-section-label">{item.path === "/" ? "Workspace" : item.path === "/reports" ? "Management" : "Administration"}</span>
                ) : null}
                <NavLink end={item.path === "/"} to={item.path} onClick={onClose} className={`nav-item ${isParentActive ? "active" : ""}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.children?.length ? <ChevronDown size={16} className="nav-item-chevron" /> : null}
                </NavLink>

                {item.children?.length && isParentActive ? (
                  <div className="nav-children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) => `nav-child ${isActive ? "active" : ""}`}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer-stack">
          <span className="eyebrow">AYRA Clinic ERP</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
