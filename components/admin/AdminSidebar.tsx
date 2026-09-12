"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  ChartNoAxesCombined,
  ChevronDown,
  LayoutDashboard,
  Megaphone,
  PanelsTopLeft,
  Search,
  ShoppingBag,
  Truck,
  Warehouse,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAnalyticsActive = pathname.startsWith("/admin/analytics");
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const analyticsExpanded = userExpanded !== null ? userExpanded : isAnalyticsActive;

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
  ];

  const analyticsSubItems = [
    {
      href: "/admin/analytics/kpi-overview",
      label: "KPI Overview",
      icon: BarChart3,
    },
    {
      href: "/admin/analytics/orders-report",
      label: "Store Orders",
      icon: ShoppingBag,
    },
    {
      href: "/admin/analytics/ga4",
      label: "GA4 Traffic",
      icon: Activity,
    },
    {
      href: "/admin/analytics/gsc",
      label: "Search Console",
      icon: Search,
    },
    {
      href: "/admin/analytics/meta-ads",
      label: "Meta Ads",
      icon: Megaphone,
    },
  ];

  return (
    <nav className={cn("space-y-1.5", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <button
            type="button"
            key={item.href}
            onClick={() => {
              onNavigate?.();
              router.push(item.href);
            }}
            className={cn(
              "flex w-full items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm text-left",
              isActive
                ? "bg-black text-white shadow-md shadow-black/10"
                : "text-gray-600 hover:bg-gray-100 hover:text-black",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-colors",
                isActive
                  ? "text-white"
                  : "text-gray-500 group-hover:text-black",
              )}
            />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Analytics Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            if (!analyticsExpanded) {
              setUserExpanded(true);
              router.push("/admin/analytics/kpi-overview");
            } else {
              setUserExpanded(!analyticsExpanded);
            }
          }}
          className={cn(
            "flex w-full items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group font-medium text-sm text-left",
            isAnalyticsActive
              ? "bg-zinc-900 text-white shadow-md shadow-black/10"
              : "text-gray-600 hover:bg-gray-100 hover:text-black",
          )}
        >
          <div className="flex items-center space-x-3">
            <ChartNoAxesCombined
              className={cn(
                "w-5 h-5 transition-colors",
                isAnalyticsActive
                  ? "text-white"
                  : "text-gray-500 group-hover:text-black",
              )}
            />
            <span>Analytics</span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              analyticsExpanded ? "rotate-180 text-white" : "text-gray-400 group-hover:text-black",
            )}
          />
        </button>

        {analyticsExpanded && (
          <div className="mt-1.5 ml-4 pl-3 border-l border-zinc-200 space-y-1">
            {analyticsSubItems.map((sub) => {
              const isSubActive = pathname === sub.href;
              const SubIcon = sub.icon;
              return (
                <button
                  type="button"
                  key={sub.href}
                  onClick={() => {
                    onNavigate?.();
                    router.push(sub.href);
                  }}
                  className={cn(
                    "flex w-full items-center space-x-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left",
                    isSubActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  )}
                >
                  <SubIcon
                    className={cn(
                      "w-3.5 h-3.5",
                      isSubActive ? "text-indigo-600" : "text-zinc-400",
                    )}
                  />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
