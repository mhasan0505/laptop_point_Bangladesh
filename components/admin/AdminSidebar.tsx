"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Cable,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessageSquare,
  PanelsTopLeft,
  Settings,
  Truck,
  Users,
  Warehouse,
  ExternalLink,
  Zap,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export interface SubItem {
  href: string;
  label: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  subItems?: SubItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;

  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/messages")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && typeof data.unreadCount === "number") {
          setUnreadMessages(data.unreadCount);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    "/admin/setup": true,
  });

  const toggleSubMenu = (href: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpenSubMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const navigationSections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: "Live",
        },
      ],
    },
    {
      title: "Store Management",
      items: [
        {
          href: "/admin/products",
          label: "Products",
          icon: PanelsTopLeft,
        },
        {
          href: "/admin/accessories",
          label: "Accessories",
          icon: Cable,
        },
        {
          href: "/admin/orders",
          label: "Orders & Delivery",
          icon: Truck,
        },
        {
          href: "/admin/messages",
          label: "Customer Messages",
          icon: Mail,
          badge: unreadMessages > 0 ? `${unreadMessages} New` : undefined,
        },
        {
          href: "/admin/media",
          label: "Media Library",
          icon: FolderOpen,
        },
        {
          href: "/admin/questions",
          label: "Q&A Questions",
          icon: MessageSquare,
        },
        {
          href: "/admin/inventory",
          label: "Inventory Center",
          icon: Warehouse,
        },
      ],
    },
    {
      title: "Marketing & Deals",
      items: [
        {
          href: "/admin/banners",
          label: "Banner Manager",
          icon: ImageIcon,
          badge: "Unified",
        },
        {
          href: "/admin/power-deal",
          label: "Power Deals CMS",
          icon: Zap,
          badge: "Hot",
        },
      ],
    },
    {
      title: "Insights & Reports",
      items: [
        {
          href: "/admin/analytics",
          label: "Sales Analytics",
          icon: ChartNoAxesCombined,
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          href: "/admin/setup",
          label: "Master Setup",
          icon: Settings,
          subItems: [
            { href: "/admin/setup/profile", label: "Store Profile" },
            { href: "/admin/setup/homepage", label: "Homepage Layout" },
            { href: "/admin/setup/menus", label: "Navigation & Menus" },
            { href: "/admin/setup/catalog", label: "Brands & Categories" },
            { href: "/admin/setup/product-standards", label: "Product Standards" },
            { href: "/admin/setup/delivery-payments", label: "Delivery & Payments" },
            { href: "/admin/setup/policies", label: "Policy Pages" },
            { href: "/admin/setup/seo", label: "SEO Defaults" },
            { href: "/admin/setup/integrations", label: "Tracking & Integrations" },
            { href: "/admin/users", label: "Users & Roles" },
          ],
        },
        {
          href: "/admin/users",
          label: "Admin Users",
          icon: Users,
        },
        {
          href: "/admin/jobs",
          label: "Background Jobs",
          icon: Clock,
        },
      ],
    },
  ];

  return (
    <div className={cn("flex flex-col h-full justify-between", className)}>
      <nav className="space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                const isSubMenuOpen = Boolean(openSubMenus[item.href]);

                if (hasSubItems && item.subItems) {
                  return (
                    <div key={item.href} className="space-y-0.5">
                      <div

                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                          isActive
                            ? "bg-[#57BA47]/10 text-[#57BA47] dark:bg-[#57BA47]/15 dark:text-[#57BA47]"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            onNavigate?.();
                            if (!isSubMenuOpen) {
                              setOpenSubMenus((prev) => ({ ...prev, [item.href]: true }));
                            }
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#57BA47]" : "text-muted-foreground")} />
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider",
                                item.badge === "Hot"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : item.badge === "Unified"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-[#57BA47]/15 text-[#57BA47]"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleSubMenu(item.href, e)}
                          className="h-6 w-6 p-0 hover:bg-muted/80 rounded-md text-muted-foreground hover:text-foreground"
                          title={isSubMenuOpen ? "Collapse sub-menus" : "Expand sub-menus"}
                        >
                          {isSubMenuOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>

                      {isSubMenuOpen && (
                        <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-border/70 ml-5 my-0.5 animate-in fade-in-50 duration-200">
                          {item.subItems.map((sub) => {
                            const isSubActive =
                              pathname === sub.href ||
                              (pathname === "/admin/setup" &&
                                ((currentTab && sub.href.includes(currentTab)) ||
                                  (!currentTab && sub.href === "/admin/setup/profile")));

                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => onNavigate?.()}
                                className={cn(
                                  "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                                  isSubActive
                                    ? "bg-[#57BA47]/15 text-[#57BA47] font-semibold"
                                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full shrink-0",
                                    isSubActive ? "bg-[#57BA47]" : "bg-muted-foreground/40"
                                  )}
                                />
                                <span className="truncate">{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onNavigate?.()}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      isActive
                        ? "bg-[#57BA47]/10 text-[#57BA47] dark:bg-[#57BA47]/15 dark:text-[#57BA47]"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#57BA47]" : "text-muted-foreground")} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider",
                          item.badge.includes("New")
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                            : item.badge === "Hot"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-[#57BA47]/15 text-[#57BA47]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Storefront Link at bottom */}
      <div className="pt-4 border-t border-border mt-auto">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            View Live Store
          </span>
          <span className="text-[10px] text-muted-foreground">↗</span>
        </Link>
      </div>
    </div>
  );
}
