import { motion } from "framer-motion";
import { ChevronDown, Headphones, Plus, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { navItems } from "../../core/config/navigation";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="brand-block">
          <span className="brand-mark" aria-hidden="true">
            <Plus size={20} />
          </span>
          <div className="brand-copy">
            <strong>AYRA</strong>
            <strong>CLINIC ERP</strong>
            <p>Pharmacy-first SaaS</p>
          </div>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isParentActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

            return (
              <motion.div
                key={item.path}
                className={`nav-group ${isParentActive ? "expanded" : ""}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <NavLink to={item.path} onClick={onClose} className={`nav-item ${isParentActive ? "active" : ""}`}>
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
              </motion.div>
            );
          })}
        </nav>

        <div className="sidebar-footer-stack">
          <div className="sidebar-footer">
            <span className="eyebrow">CARE-READY WORKFLOW</span>
            <p>Inventory, clinic, billing, and alert operations stay in one compact workspace.</p>
          </div>
          <div className="sidebar-footer sidebar-footer-help">
            <div className="sidebar-help-head">
              <span className="sidebar-help-icon">
                <Headphones size={16} />
              </span>
              <span className="eyebrow">Need Help?</span>
            </div>
            <p>Use the support workspace when your team needs help with workflow or setup.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
