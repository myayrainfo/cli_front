import { MotionConfig } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDataProvider } from "./LayoutDataContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <LayoutDataProvider>
        <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="content-shell">
            <Topbar sidebarOpen={sidebarOpen} onMenuToggle={() => setSidebarOpen((current) => !current)} />
            <main className="page-content">
              <Outlet />
            </main>
          </div>
        </div>
      </LayoutDataProvider>
    </MotionConfig>
  );
};

export default MainLayout;
