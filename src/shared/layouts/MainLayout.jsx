import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LayoutDataProvider } from "./LayoutDataContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LayoutDataProvider>
      <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="content-shell">
          <Topbar onMenuToggle={() => setSidebarOpen((current) => !current)} />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              className="page-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </LayoutDataProvider>
  );
};

export default MainLayout;
