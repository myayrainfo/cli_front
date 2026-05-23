import { motion } from "framer-motion";
import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { navItems } from "../../core/config/navigation";

const Sidebar = ({ isOpen, onClose }) => (
  <>
    <div className={`sidebar-backdrop ${isOpen ? "show" : ""}`} onClick={onClose} />
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="brand-block">
        <span className="brand-mark">A</span>
        <div>
          <h2>ARYA Clinic ERP</h2>
          <p>Pharmacy-first SaaS</p>
        </div>
        <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="eyebrow">Care-ready workflow</span>
        <p>Inventory, clinic, billing, and alert operations stay in one compact workspace.</p>
      </div>
    </aside>
  </>
);

export default Sidebar;
