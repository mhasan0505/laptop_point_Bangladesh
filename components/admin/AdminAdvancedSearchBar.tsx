"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  Laptop,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Clock,
  LayoutDashboard,
  PlusCircle,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Settings,
  ExternalLink,
  Flame,
  Zap,
} from "lucide-react";
import type {
  AdminProductSearchResult,
  AdminOrderSearchResult,
  AdminSearchResponse,
} from "@/app/api/admin/search/route";

interface AdminNavigationItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  keywords: string[];
}

const ADMIN_NAVIGATION_ITEMS: AdminNavigationItem[] = [
  {
    id: "nav-dashboard",
    title: "Dashboard Overview",
    subtitle: "Console KPIs and sales trends",
    href: "/admin",
    icon: LayoutDashboard,
    keywords: ["dashboard", "home", "stats", "kpi", "sales", "overview"],
  },
  {
    id: "nav-products",
    title: "Products & Catalog",
    subtitle: "Manage laptops and accessories",
    href: "/admin/products",
    icon: Laptop,
    keywords: ["products", "catalog", "laptops", "accessories", "models"],
  },
  {
    id: "nav-products-new",
    title: "Add New Product",
    subtitle: "Create product listing",
    href: "/admin/products/new",
    icon: PlusCircle,
    keywords: ["add product", "new product", "create", "new laptop"],
  },
  {
    id: "nav-orders",
    title: "Orders & Fulfillment",
    subtitle: "Invoices and shipments",
    href: "/admin/orders",
    icon: ShoppingBag,
    keywords: ["orders", "fulfillment", "invoices", "challan", "deliveries"],
  },
  {
    id: "nav-inventory",
    title: "Inventory Center",
    subtitle: "Track on-hand stock and low-stock alerts",
    href: "/admin/inventory",
    icon: AlertTriangle,
    keywords: ["inventory", "stock", "low stock", "out of stock"],
  },
  {
    id: "nav-products-bulk",
    title: "Bulk Price Editor",
    subtitle: "Quickly adjust catalog prices",
    href: "/admin/products/bulk-prices",
    icon: Boxes,
    keywords: ["bulk prices", "change price", "pricing", "mass update"],
  },
  {
    id: "nav-analytics",
    title: "Sales Analytics",
    subtitle: "Revenue metrics and reports",
    href: "/admin/analytics",
    icon: TrendingUp,
    keywords: ["analytics", "revenue", "charts", "reports"],
  },
  {
    id: "nav-setup",
    title: "Store Setup & SEO",
    subtitle: "Profile, phone, and SEO tags",
    href: "/admin/setup",
    icon: Settings,
    keywords: ["setup", "settings", "seo", "store profile"],
  },
  {
    id: "nav-power-deals",
    title: "Power Deals CMS",
    subtitle: "Marquee deals and promotions",
    href: "/admin/power-deal",
    icon: Zap,
    keywords: ["power deal", "marquee", "banner deal", "promo"],
  },
  {
    id: "nav-hot-deals",
    title: "Flash Deals",
    subtitle: "Limited time hot sales",
    href: "/admin/hot-deal",
    icon: Flame,
    keywords: ["hot deals", "flash deals", "countdown", "discounts"],
  },
  {
    id: "nav-view-store",
    title: "View Storefront",
    subtitle: "Open customer website",
    href: "/",
    icon: ExternalLink,
    keywords: ["storefront", "website", "live", "store", "shop"],
  },
];

type SearchScope = "all" | "products" | "orders" | "navigation";

const SCOPE_TABS: { id: SearchScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "navigation", label: "Pages" },
];

export function AdminAdvancedSearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeScope, setActiveScope] = useState<SearchScope>("all");
  const [isSearching, setIsSearching] = useState(false);

  const [productResults, setProductResults] = useState<AdminProductSearchResult[]>([]);
  const [orderResults, setOrderResults] = useState<AdminOrderSearchResult[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/macintosh|mac os x/i.test(navigator.userAgent));
    try {
      const stored = localStorage.getItem("blg_admin_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 4));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((i) => i.toLowerCase() !== trimmed.toLowerCase())].slice(0, 4);
      try {
        localStorage.setItem("blg_admin_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("blg_admin_recent_searches");
    } catch {
      // ignore
    }
  }, []);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Autofocus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedItemIndex(0);
    } else {
      setQuery("");
      setProductResults([]);
      setOrderResults([]);
      setIsSearching(false);
      setActiveScope("all");
    }
  }, [isOpen]);

  // Matching Navigation Items
  const matchedNavItems = useMemo(() => {
    if (activeScope === "products" || activeScope === "orders") return [];

    const qLower = query.toLowerCase().trim();
    if (!qLower) {
      return activeScope === "navigation" ? ADMIN_NAVIGATION_ITEMS : ADMIN_NAVIGATION_ITEMS.slice(0, 4);
    }

    return ADMIN_NAVIGATION_ITEMS.filter((item) => {
      if (item.title.toLowerCase().includes(qLower)) return true;
      if (item.subtitle.toLowerCase().includes(qLower)) return true;
      if (item.keywords.some((k) => k.includes(qLower))) return true;
      return false;
    });
  }, [query, activeScope]);

  // Fetch Products & Orders from Backend (dynamic on tab switch & query changes)
  useEffect(() => {
    if (!isOpen) return;

    if (activeScope === "navigation") {
      setProductResults([]);
      setOrderResults([]);
      setIsSearching(false);
      return;
    }

    const trimmed = query.trim();
    let isMounted = true;
    setIsSearching(true);

    const limit = activeScope === "all" ? (trimmed ? "5" : "3") : "8";

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          scope: activeScope,
          limit,
        });

        const res = await fetch(`/api/admin/search?${params.toString()}`);
        if (res.ok) {
          const data: AdminSearchResponse = await res.json();
          if (isMounted) {
            setProductResults(data.products || []);
            setOrderResults(data.orders || []);
            setSelectedItemIndex(0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin search results:", err);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, trimmed ? 150 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, query, activeScope]);

  // Flat list for keyboard navigation
  interface FlatItem {
    type: "nav" | "product" | "order";
    id: string;
    action: () => void;
  }

  const flatItems = useMemo<FlatItem[]>(() => {
    const list: FlatItem[] = [];

    matchedNavItems.forEach((nav) => {
      list.push({
        type: "nav",
        id: nav.id,
        action: () => {
          saveRecentSearch(nav.title);
          setIsOpen(false);
          router.push(nav.href);
        },
      });
    });

    productResults.forEach((prod) => {
      list.push({
        type: "product",
        id: prod.id,
        action: () => {
          saveRecentSearch(prod.name);
          setIsOpen(false);
          router.push(`/admin/products/edit/${prod.id}`);
        },
      });
    });

    orderResults.forEach((ord) => {
      list.push({
        type: "order",
        id: ord.id,
        action: () => {
          saveRecentSearch(ord.orderNumber);
          setIsOpen(false);
          router.push(`/admin/orders?search=${encodeURIComponent(ord.orderNumber)}`);
        },
      });
    });

    return list;
  }, [matchedNavItems, productResults, orderResults, router, saveRecentSearch]);

  // Auto scroll highlighted item into view
  useEffect(() => {
    const selectedEl = scrollContainerRef.current?.querySelector(`[data-selected="true"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedItemIndex]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedItemIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedItemIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems.length > 0 && selectedItemIndex >= 0 && selectedItemIndex < flatItems.length) {
        flatItems[selectedItemIndex].action();
      } else if (query.trim()) {
        saveRecentSearch(query.trim());
        setIsOpen(false);
        if (activeScope === "orders") {
          router.push(`/admin/orders?search=${encodeURIComponent(query.trim())}`);
        } else {
          router.push(`/admin/products?q=${encodeURIComponent(query.trim())}`);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const currentIndex = SCOPE_TABS.findIndex((t) => t.id === activeScope);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + SCOPE_TABS.length) % SCOPE_TABS.length
        : (currentIndex + 1) % SCOPE_TABS.length;
      setActiveScope(SCOPE_TABS[nextIndex].id);
      setSelectedItemIndex(0);
    }
  };

  const placeholderText = useMemo(() => {
    switch (activeScope) {
      case "products":
        return "Search products by name, brand, SKU...";
      case "orders":
        return "Search orders by #number, customer, phone, status...";
      case "navigation":
        return "Search admin console pages & settings...";
      default:
        return "Search products, orders, pages... (Tab to switch)";
    }
  }, [activeScope]);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MINIMAL HEADER TRIGGER PILL
      ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center justify-between w-36 sm:w-48 md:w-56 h-8 px-2.5 rounded-full bg-zinc-100/70 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer focus:outline-none"
        aria-label="Search admin console"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search size={13} className="text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-colors" />
          <span className="truncate text-xs font-normal">Search...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-muted-foreground/70 shrink-0">
          {isMac ? "⌘" : "Ctrl"}K
        </kbd>
      </button>

      {/* ─────────────────────────────────────────────────────────────
          2. MINIMAL COMMAND PALETTE MODAL
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-card border border-border/80 rounded-xl shadow-xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
            >
              {/* ── Minimal Search Input Header ── */}
              <div className="relative flex items-center px-3.5 py-3 border-b border-border/60 gap-2.5 shrink-0">
                <Search size={16} className="text-muted-foreground/70 shrink-0 ml-0.5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={placeholderText}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none font-normal"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  {isSearching ? (
                    <Loader2 size={14} className="animate-spin text-muted-foreground" />
                  ) : query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded-sm text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Clear"
                    >
                      <X size={13} />
                    </button>
                  ) : null}

                  <span className="text-[10px] font-mono text-muted-foreground/50 px-1 py-0.5 rounded border border-border/40 select-none">
                    ESC
                  </span>
                </div>
              </div>

              {/* ── Discreet Scope Segment Selector ── */}
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-border/40 bg-muted/15 text-xs shrink-0 select-none">
                <div className="flex items-center gap-1" role="tablist" aria-label="Search scopes">
                  {SCOPE_TABS.map((tab) => {
                    const isActive = activeScope === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setActiveScope(tab.id);
                          setSelectedItemIndex(0);
                          inputRef.current?.focus();
                        }}
                        className={`px-2.5 py-0.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isActive
                            ? "bg-foreground text-background font-medium shadow-2xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-normal"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-muted-foreground/50 font-mono hidden sm:flex items-center gap-1">
                  <kbd className="px-1 py-0.2 rounded bg-muted/60 text-foreground/70 border border-border/40">Tab</kbd>
                  <span>to cycle</span>
                </div>
              </div>

              {/* ── Results List ── */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto divide-y divide-border/30 max-h-[50vh] p-1.5"
              >
                {/* ── Recent Searches (Shown in All Scope when empty) ── */}
                {activeScope === "all" && !query.trim() && recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Clock size={11} className="text-muted-foreground/60 shrink-0" />
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground/60">Recent:</span>
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setQuery(term);
                              inputRef.current?.focus();
                            }}
                            className="px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted text-foreground text-[10px] font-normal transition-colors cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[10px] text-muted-foreground/60 hover:text-red-500 cursor-pointer ml-2"
                      >
                        clear
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Navigation / Console Pages ── */}
                {matchedNavItems.length > 0 && (
                  <div className="p-1 space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                      {!query.trim() && activeScope === "all"
                        ? "Quick Links"
                        : activeScope === "navigation" && !query.trim()
                        ? `Console Pages (${ADMIN_NAVIGATION_ITEMS.length})`
                        : "Pages"}
                    </div>
                    {matchedNavItems.map((item) => {
                      const Icon = item.icon;
                      const globalIdx = flatItems.findIndex((f) => f.id === item.id);
                      const isSelected = selectedItemIndex === globalIdx;

                      return (
                        <div
                          key={item.id}
                          data-selected={isSelected}
                          onClick={() => {
                            saveRecentSearch(item.title);
                            setIsOpen(false);
                            router.push(item.href);
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon size={13} className="shrink-0 text-muted-foreground/70" />
                            <span className="font-medium text-foreground truncate">{item.title}</span>
                            <span className="text-[10px] text-muted-foreground/60 truncate hidden sm:inline">
                              {item.subtitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground/40 font-mono hidden md:inline">
                              {item.href}
                            </span>
                            <ArrowRight size={11} className="text-muted-foreground/40 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Products List ── */}
                {productResults.length > 0 && (
                  <div className="p-1 space-y-0.5">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                      <span>{!query.trim() ? "Recent Products" : "Products"}</span>
                      <Link
                        href={query.trim() ? `/admin/products?q=${encodeURIComponent(query)}` : "/admin/products"}
                        onClick={() => setIsOpen(false)}
                        className="text-muted-foreground hover:text-foreground normal-case font-normal"
                      >
                        view all in catalog →
                      </Link>
                    </div>

                    {productResults.map((product) => {
                      const globalIdx = flatItems.findIndex((f) => f.id === product.id);
                      const isSelected = selectedItemIndex === globalIdx;
                      const isOutOfStock = product.stockQty === 0;
                      const isLowStock = product.stockQty > 0 && product.stockQty <= 10;

                      return (
                        <div
                          key={product.id}
                          data-selected={isSelected}
                          onClick={() => {
                            saveRecentSearch(product.name);
                            setIsOpen(false);
                            router.push(`/admin/products/edit/${product.id}`);
                          }}
                          className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isSelected ? "bg-muted text-foreground" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative h-7 w-7 rounded border border-border/50 bg-background shrink-0 overflow-hidden flex items-center justify-center">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={28}
                                height={28}
                                className="object-contain max-h-full max-w-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate leading-tight">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 truncate mt-0.5">
                                <span className="font-mono">{product.sku}</span>
                                <span>•</span>
                                <span>{product.brand}</span>
                                <span>•</span>
                                {product.price !== null && product.price !== undefined ? (
                                  <span className="font-medium text-foreground">
                                    ৳{product.price.toLocaleString("en-BD")}
                                  </span>
                                ) : (
                                  <span>Call</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {isOutOfStock ? (
                              <span className="text-[10px] text-red-500 font-medium">Out</span>
                            ) : isLowStock ? (
                              <span className="text-[10px] text-amber-500 font-medium">{product.stockQty} left</span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60">{product.stockQty} in stock</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Orders List ── */}
                {orderResults.length > 0 && (
                  <div className="p-1 space-y-0.5">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                      <span>{!query.trim() ? "Recent Orders" : "Orders"}</span>
                      <Link
                        href={query.trim() ? `/admin/orders?search=${encodeURIComponent(query)}` : "/admin/orders"}
                        onClick={() => setIsOpen(false)}
                        className="text-muted-foreground hover:text-foreground normal-case font-normal"
                      >
                        view all in orders →
                      </Link>
                    </div>

                    {orderResults.map((order) => {
                      const globalIdx = flatItems.findIndex((f) => f.id === order.id);
                      const isSelected = selectedItemIndex === globalIdx;

                      return (
                        <div
                          key={order.id}
                          data-selected={isSelected}
                          onClick={() => {
                            saveRecentSearch(order.orderNumber);
                            setIsOpen(false);
                            router.push(`/admin/orders?search=${encodeURIComponent(order.orderNumber)}`);
                          }}
                          className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isSelected ? "bg-muted text-foreground" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-semibold text-foreground shrink-0">
                              #{order.orderNumber}
                            </span>
                            <span className="text-muted-foreground truncate">{order.customerName}</span>
                            <span className="text-[10px] text-muted-foreground/50 truncate hidden sm:inline">
                              {order.customerPhone}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ৳{(order.total ?? order.totalAmount ?? 0).toLocaleString("en-BD")}
                            </span>
                            <span
                              className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                                order.status === "Delivered"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : order.status === "Cancelled"
                                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                  : "bg-zinc-500/10 text-muted-foreground"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── Empty State ── */}
                {!isSearching &&
                  productResults.length === 0 &&
                  orderResults.length === 0 &&
                  matchedNavItems.length === 0 && (
                    <div className="py-8 px-4 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {query.trim()
                          ? `No results for "${query}" in ${
                              SCOPE_TABS.find((t) => t.id === activeScope)?.label || activeScope
                            }`
                          : `No items found in this section`}
                      </p>
                      {activeScope !== "all" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveScope("all");
                            inputRef.current?.focus();
                          }}
                          className="text-xs text-blue-500 hover:underline cursor-pointer"
                        >
                          Search across All scopes
                        </button>
                      )}
                    </div>
                  )}
              </div>

              {/* ── Minimal Footer Hint ── */}
              <div className="px-3 py-1.5 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground/60 shrink-0 select-none">
                <span>↑↓ navigate • ↵ select • esc close</span>
                <span className="hidden sm:inline">tab switch scope</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
