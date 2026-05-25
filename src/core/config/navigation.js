import {
  Activity,
  AlertTriangle,
  CircleDollarSign,
  ClipboardPlus,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package,
    children: [
      { label: "Overview", path: "/inventory/overview" },
      { label: "Medicines", path: "/inventory/medicines" },
      { label: "Stock Movements", path: "/inventory/stock-movements" },
      { label: "Low Stock", path: "/inventory/low-stock" },
      { label: "Expiring Soon", path: "/inventory/expiring-soon" },
      { label: "Returns", path: "/inventory/returns" },
      { label: "Adjustments", path: "/inventory/adjustments" },
    ],
  },
  { label: "Billing", path: "/billing", icon: CircleDollarSign },
  { label: "Purchases", path: "/purchases", icon: ShoppingCart },
  { label: "People", path: "/people", icon: Users },
  { label: "Alerts", path: "/alerts", icon: AlertTriangle },
  { label: "Reports", path: "/reports", icon: Activity },
  { label: "Clinic", path: "/clinic", icon: ClipboardPlus },
  { label: "Settings", path: "/settings", icon: Settings },
];
