"use client";

import { cn } from "@/lib/utils";
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  PanelsTopLeft,
  Truck,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/products",
      label: "Products",
      icon: PanelsTopLeft,
    },
    {
      href: "/admin/orders",
      label: "Orders & Delivery",
      icon: Truck,
    },
    {
      href: "/admin/inventory",
      label: "Inventory",
      icon: Warehouse,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <nav className={cn("space-y-1.5", className)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm",
              isActive
                ? "bg-black text-white shadow-md shadow-black/10"
                : "text-gray-600 hover:bg-gray-100 hover:text-black"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-gray-500 group-hover:text-black"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
