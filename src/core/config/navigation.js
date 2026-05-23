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
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Billing", path: "/billing", icon: CircleDollarSign },
  { label: "Purchases", path: "/purchases", icon: ShoppingCart },
  { label: "People", path: "/people", icon: Users },
  { label: "Alerts", path: "/alerts", icon: AlertTriangle },
  { label: "Reports", path: "/reports", icon: Activity },
  { label: "Clinic", path: "/clinic", icon: ClipboardPlus },
  { label: "Settings", path: "/settings", icon: Settings },
];
