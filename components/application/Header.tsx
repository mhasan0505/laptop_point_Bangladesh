"use client";
import MobileMenu from "@/components/application/MobileMenu";

import { navigationLinks, departmentMenuItems } from "@/app/data/menu-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { SearchItem } from "@/lib/search-index";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Facebook,
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  User,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";


import type {
  MegaMenuFeaturedProduct,
  StorefrontContact,
  StorefrontNavigation,
} from "@/lib/public-content";
import MegaMenu from "../navigation/MegaMenu";

const superDealMarqueeItems = [
  {
    icon: "🔥",
    tag: "SUPER DEAL",
    text: "Extra Up to ৳5,000 OFF on Certified Laptops",
    code: "LPDEAL5K",
    href: "/deals",
  },
  {
    icon: "🎁",
    tag: "FREE GIFTS",
    text: "Laptop Bag + Wireless Mouse + Pad + Skin with Every Laptop",
    href: "/deals",
  },
  {
    icon: "⚡",
    tag: "IN STOCK",
    text: "HP EliteBook, Dell Latitude & ThinkPad from ৳22,990",
    href: "/shop?category=Laptop",
  },
  {
    icon: "💳",
    tag: "0% EMI",
    text: "3 to 12 Months Flexible EMI Available on 30+ Banks",
    href: "/EMI",
  },
  {
    icon: "🛡️",
    tag: "WARRANTY",
    text: "15 Days Replacement Guarantee & 5 Years Free Servicing",
    href: "/deals",
  },
  {
    icon: "📍",
    tag: "SHOWROOM",
    text: "Mirpur-10 Showroom Open 10:30 AM – 9:00 PM (Madbar Mansion)",
    href: "/contact",
  },
];

const Header = ({
  navigation,
  megaMenuFeatured,
  contact,
}: {
  navigation?: StorefrontNavigation;
  megaMenuFeatured?: Record<string, MegaMenuFeaturedProduct[]>;
  contact?: StorefrontContact;
}) => {
  const router = useRouter();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMegaMenuHovered, setIsMegaMenuHovered] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [activeDepartmentSub, setActiveDepartmentSub] = useState<string | null>(null);
  const departmentMenuRef = useRef<HTMLDivElement>(null);
  const [isSearchCategoryDropdownOpen, setIsSearchCategoryDropdownOpen] =
    useState(false);
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const departmentCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchIndex, setSearchIndex] = useState<SearchItem[] | null>(null);

  const categorySubmenu =
    navigationLinks.find((link) => link.name === "Categories")?.submenu ?? [];

  const searchCategoryOptions = [
    { label: "All Categories", value: "all" },
    ...categorySubmenu.map((item) => {
      const match = item.href.match(/[?&]category=([^&]+)/);
      return {
        label: item.name,
        value: match?.[1] ? decodeURIComponent(match[1]) : item.name,
      };
    }),
  ];

  const selectedCategoryLabel =
    searchCategoryOptions.find(
      (option) => option.value === selectedSearchCategory,
    )?.label ?? "All Categories";

  // Department menu items are imported from @/app/data/menu-config.ts
  // Edit menu-config.ts to manage departments, categories, and all navigation items

  // Lazy load search data only when search is opened
  const loadSearchIndex = useCallback(async () => {
    if (searchIndex) return; // Already loaded

    try {
      const { getSearchIndex } = await import("@/lib/search-index");
      const index = await getSearchIndex();
      setSearchIndex(index);
    } catch (error) {
      console.error("Failed to load search index:", error);
    }
  }, [searchIndex]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && searchIndex) {
      const normalizedQuery = query.toLowerCase().trim();
      const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
      const normalizedCategory = selectedSearchCategory.toLowerCase();

      const filtered = searchIndex
        .filter((product) => {
          const categoryMatches =
            selectedSearchCategory === "all" ||
            product.category.toLowerCase().includes(normalizedCategory);
          if (!categoryMatches) return false;

          const pName = product.name.toLowerCase();
          const pBrand = product.brand.toLowerCase();
          const pCat = product.category.toLowerCase();
          const searchable = `${pName} ${pBrand} ${pCat}`;

          return tokens.every((token) => {
            if (token.length <= 2) {
              const rx = new RegExp(`\\b${token}\\b`, "i");
              return rx.test(pName) || rx.test(pBrand);
            }
            return searchable.includes(token);
          });
        })
        .slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearchExpanded(false);
      const params = new URLSearchParams({
        search: searchQuery.trim(),
      });

      if (selectedSearchCategory !== "all") {
        params.set("category", selectedSearchCategory);
      }

      router.push(`/shop?${params.toString()}`);
    }
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const navLinks = (
    navigation && navigation.topNavMenus.length > 0
      ? navigation.topNavMenus.map((item) => ({
          name: item.label,
          href: item.href || (item.dropdownItems?.[0]?.href ?? "#"),
          hasDropdown: Boolean(item.dropdownItems && item.dropdownItems.length > 0),
          submenu: item.dropdownItems?.map((s) => ({
            name: s.name,
            href: s.href,
            icon: (s as unknown as { icon?: string }).icon,
          })),
          badge: item.badge,
        }))
      : navigationLinks
  ).filter((item) => {
    const lower = item.name.trim().toLowerCase();
    return (
      lower !== "home" &&
      lower !== "compare" &&
      lower !== "contact" &&
      lower !== "contacts"
    );
  });

  const departmentItems =
    navigation && navigation.shopCategories.length > 0
      ? navigation.shopCategories.map((item) => ({
          name: item.label,
          href: item.href,
          badge: undefined as string | undefined,
          sub:
            item.subitems && item.subitems.length > 0
              ? [
                  {
                    title: item.label.toUpperCase(),
                    items: item.subitems.map((s) => ({
                      name: s.name,
                      href: s.href,
                    })),
                  },
                ]
              : undefined,
        }))
      : departmentMenuItems;

  // Handle click outside search and load search index when opened
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
      searchInputRef.current?.focus();
      loadSearchIndex(); // Load search data only when search is opened
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isSearchExpanded, searchIndex, loadSearchIndex]);

  // Timer ref for closing delay
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMegaMenuOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsMegaMenuOpen(false);
  };

  const handleDepartmentMenuEnter = () => {
    if (departmentCloseTimerRef.current) {
      clearTimeout(departmentCloseTimerRef.current);
      departmentCloseTimerRef.current = null;
    }
    setIsDepartmentMenuOpen(true);
  };

  const handleDepartmentMenuLeave = () => {
    if (departmentCloseTimerRef.current) {
      clearTimeout(departmentCloseTimerRef.current);
    }
    departmentCloseTimerRef.current = setTimeout(() => {
      setIsDepartmentMenuOpen(false);
      setActiveDepartmentSub(null);
      departmentCloseTimerRef.current = null;
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (departmentCloseTimerRef.current) {
        clearTimeout(departmentCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
    // Recalculate visible results when category changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSearchCategory, searchIndex]);

  useEffect(() => {
    const handleGlobalClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        searchCategoryDropdownRef.current &&
        !searchCategoryDropdownRef.current.contains(target)
      ) {
        setIsSearchCategoryDropdownOpen(false);
      }
      if (
        departmentMenuRef.current &&
        !departmentMenuRef.current.contains(target)
      ) {
        setIsDepartmentMenuOpen(false);
        setActiveDepartmentSub(null);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchCategoryDropdownOpen(false);
        setIsDepartmentMenuOpen(false);
        setActiveDepartmentSub(null);
      }
    };

    document.addEventListener("mousedown", handleGlobalClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleGlobalClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && y > 40) return true;
        if (prev && y < 15) return false;
        return prev;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90 transition-all duration-300 ${
        isScrolled
          ? "shadow-[0_8px_30px_rgba(15,23,42,0.10)]"
          : "shadow-[0_6px_24px_rgba(15,23,42,0.04)]"
      }`}
    >
      <div
        className={`border-b border-white/10 bg-linear-to-r from-[#001e42] via-[#002b60] to-[#001e42] text-xs text-white transition-all duration-300 ease-in-out ${
          isScrolled
            ? "max-h-0 opacity-0 overflow-hidden py-0 border-transparent"
            : "max-h-12 opacity-100 py-0"
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex min-h-9 items-center justify-between gap-2 sm:gap-4 py-1.5">
            {/* ── LEFT/CENTER: SUPER DEALS MARQUEE TICKER ───────────────── */}
            <div className="flex items-center min-w-0 flex-1 overflow-hidden">
              <Link
                href="/deals"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[10.5px] font-extrabold uppercase tracking-wider text-white shrink-0 shadow-2xs transition-colors group mr-2 cursor-pointer"
                title="Browse Super Deals & Offers"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                <span>Super Deals</span>
                <span className="text-[10px] text-white/70 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>

              {/* Seamless Infinite Marquee with refined edge fade */}
              <div className="flex-1 min-w-0 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]">
                <div className="animate-marquee-deals items-center gap-6 whitespace-nowrap">
                  {[...superDealMarqueeItems, ...superDealMarqueeItems].map(
                    (deal, idx) => (
                      <Link
                        key={idx}
                        href={deal.href}
                        className="inline-flex items-center gap-2 text-[12px] font-medium text-white/90 hover:text-white transition-colors group/deal cursor-pointer min-h-[44px] py-2"
                      >
                        <span className="text-xs">{deal.icon}</span>
                        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/15">
                          {deal.tag}
                        </span>
                        <span className="group-hover/deal:underline underline-offset-2">
                          {deal.text}
                        </span>
                        {deal.code && (
                          <span className="font-mono text-[10.5px] font-extrabold px-1.5 py-0.5 rounded bg-white/15 border border-white/25 text-white tracking-wider">
                            {deal.code}
                          </span>
                        )}
                        <span className="text-white/30 text-xs font-light mx-2">
                          ✦
                        </span>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: STORE UTILITIES ──────────────────────────────── */}
            <div className="flex items-center gap-2.5 sm:gap-4 text-white/85 shrink-0 text-xs pl-2 border-l border-white/10">
              <Link
                href="/contact"
                className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-white/70" />
                <span className="hidden lg:inline">Store Locator</span>
              </Link>
              <Link
                href="/track-order"
                className="hidden xl:inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Truck className="h-3.5 w-3.5 text-white/70" />
                <span>Track Order</span>
              </Link>
              <a
                href={`tel:${(contact?.hotline || "+8801612182408").replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors font-medium"
              >
                <Phone className="h-3.5 w-3.5 text-white/70" />
                <span className="hidden sm:inline">{contact?.hotline || "+880 1612-182408"}</span>
              </a>
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
                <Link
                  href={contact?.social?.facebook || "https://www.facebook.com/laptoppointbd"}
                  target="_blank"
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={contact?.social?.youtube || "https://www.youtube.com/@LaptopPointBD"}
                  target="_blank"
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3 lg:gap-5 transition-all duration-300 ease-in-out ${
              isScrolled ? "min-h-16 py-1.5 sm:py-2" : "min-h-20 sm:min-h-22 py-3"
            }`}
          >
            <Link href="/" className="shrink-0 pr-1 lg:pr-2">
              <div
                className={`relative transition-all duration-300 ${
                  isScrolled
                    ? "h-8 w-28 sm:h-9 sm:w-34"
                    : "h-10 w-34 sm:h-12 sm:w-40"
                }`}
              >
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point Bangladesh"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <div
              ref={searchContainerRef}
              className={`transition-all duration-300 ease-in-out ${
                isSearchExpanded
                  ? "fixed inset-0 z-50 flex items-start justify-center bg-white/95 p-4 backdrop-blur-sm"
                  : "relative hidden w-full lg:block"
              }`}
            >
              {isSearchExpanded ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative w-full max-w-2xl"
                >
                  <div className="relative">
                    <Input
                      ref={searchInputRef}
                      type="text"
                      aria-label="Search for products, laptops and accessories"
                      placeholder="Search products..."
                      className="w-full rounded-xl border border-gray-200 bg-white/90 py-3.5 pl-12 pr-10 text-base shadow-sm focus:border-primary/70 focus:ring-1 focus:ring-primary/20 focus:outline-none"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsSearchExpanded(false);
                        setSearchQuery("");
                        if (searchInputRef.current) {
                          searchInputRef.current.value = "";
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                      aria-label="Close search"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {searchQuery ? (
                      <>
                        <p className="mb-2 px-2 text-sm font-medium text-gray-500">
                          Search Results
                        </p>
                        {searchResults.length > 0 ? (
                          <div className="space-y-1">
                            {searchResults.map((product) => {
                              const href =
                                product.type === "accessory"
                                  ? `/accessories/${product.slug}`
                                  : `/product/${product.slug}`;
                              return (
                                <Link
                                  key={product.id}
                                  href={href}
                                  onClick={() => setIsSearchExpanded(false)}
                                  className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-50">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      className="object-contain p-1"
                                      unoptimized={product.image.startsWith("http")}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="line-clamp-1 font-medium text-gray-900">
                                        {product.name}
                                      </p>
                                      {product.type === "accessory" ? (
                                        <span className="shrink-0 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200">
                                          Accessory
                                        </span>
                                      ) : (
                                        <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                                          Laptop
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      ৳{product.price.toLocaleString()}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                            <Link
                              href={`/shop?search=${searchQuery}`}
                              onClick={() => setIsSearchExpanded(false)}
                              className="mt-2 block w-full border-t border-gray-100 py-2 text-center text-sm font-medium text-primary hover:text-primary/80"
                            >
                              View all results
                            </Link>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-gray-500">
                            No products found for &quot;{searchQuery}&quot;
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="mb-2 px-2 text-sm font-medium text-gray-500">
                          Recent searches
                        </p>
                        <div className="space-y-1">
                          {[
                            "HP Elitebook",
                            "Dell Latitude",
                            "ThinkPad",
                            "Surface Laptop",
                          ].map((item) => (
                            <button
                              key={item}
                              onClick={() => handleSearch(item)}
                              className="group flex w-full items-center rounded-lg p-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <Search className="mr-3 h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                              <span>{item}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="group flex h-12 w-full items-center rounded-full border border-[#002b60]/20 bg-white pl-2 pr-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all hover:border-[#002b60]/60 hover:shadow-[0_8px_24px_rgba(0,43,96,0.12)]"
                >
                  <button
                    type="button"
                    aria-label="Search for products, laptops and accessories"
                    onClick={() => setIsSearchExpanded(true)}
                    className="flex min-w-0 flex-1 items-center pl-3"
                  >
                    <Search className="mr-3 h-4 w-4 shrink-0 text-neutral-500" />
                    <span className="truncate text-sm text-neutral-500">
                      Search for products
                    </span>
                  </button>

                  <div
                    ref={searchCategoryDropdownRef}
                    className="relative hidden xl:block"
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsSearchCategoryDropdownOpen(
                          (previous) => !previous,
                        );
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      {selectedCategoryLabel}
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          isSearchCategoryDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isSearchCategoryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-[0_14px_38px_rgba(15,23,42,0.13)]"
                        >
                          {searchCategoryOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setSelectedSearchCategory(option.value);
                                setIsSearchCategoryDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                                selectedSearchCategory === option.value
                                  ? "bg-[#002b60]/10 text-[#002b60]"
                                  : "text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              <span>{option.label}</span>
                              {selectedSearchCategory === option.value && (
                                <span className="h-2 w-2 rounded-full bg-[#002b60]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(true)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#002b60] text-white transition-colors hover:bg-[#002047]"
                    aria-label="Open search"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsSearchExpanded(true)}
                  aria-label="Open search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>

              <Link
                href="/compare"
                className={`hidden sm:block ${isSearchExpanded ? "md:block" : ""}`}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full text-neutral-700 hover:bg-neutral-100"
                    aria-label="Compare products"
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>

              <Link
                href="/wishlist"
                className={`hidden sm:block ${isSearchExpanded ? "md:block" : ""}`}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full text-neutral-700 hover:bg-neutral-100"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#dc0303] text-xs font-semibold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>

              <Link
                href="/cart"
                className={isSearchExpanded ? "hidden md:block" : ""}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full text-neutral-700 hover:bg-neutral-100"
                    aria-label="Shopping cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#dc0303] text-xs font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-neutral-700 hover:bg-neutral-100"
                  aria-label="User account"
                >
                  <User className="h-5 w-5" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-neutral-200/70 bg-white/95 backdrop-blur-sm lg:block">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex h-12 xl:h-13 items-center justify-between gap-4">
            {/* ── LEFT: ALL DEPARTMENTS + NAV LINKS + BRAND PILLS ───────── */}
            <div className="flex items-center gap-2 xl:gap-3 flex-1 min-w-0">
              {/* ── ALL DEPARTMENTS HOVER DROPDOWN (100% FLICKER-FREE) ── */}
              <div
                ref={departmentMenuRef}
                className="relative shrink-0"
                onMouseEnter={handleDepartmentMenuEnter}
                onMouseLeave={handleDepartmentMenuLeave}
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsDepartmentMenuOpen((prev) => {
                      if (prev) setActiveDepartmentSub(null);
                      return !prev;
                    })
                  }
                  className="inline-flex h-9.5 xl:h-10 min-w-44 xl:min-w-50 items-center justify-between gap-2.5 rounded-xl bg-gradient-to-r from-[#002b60] to-[#0a3875] px-4 text-xs font-bold uppercase tracking-wider text-white shadow-xs outline-none transition-all hover:from-[#002047] hover:to-[#002b60] hover:shadow-md shrink-0 cursor-pointer"
                  aria-expanded={isDepartmentMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="inline-flex items-center gap-2">
                    <Menu className="h-4 w-4" />
                    All Departments
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isDepartmentMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel with seamless bridge */}
                <AnimatePresence>
                  {isDepartmentMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute left-0 top-[calc(100%+4px)] z-50 w-64 rounded-2xl border border-neutral-200/80 bg-white/98 backdrop-blur-md p-1.5 shadow-[0_20px_50px_rgba(0,43,96,0.15)] ring-1 ring-black/5 before:absolute before:-top-2 before:left-0 before:right-0 before:h-2 before:content-['']"
                    >
                      {departmentItems.map((item) => (
                        <div
                          key={item.name}
                          className="relative"
                          onMouseEnter={() => {
                            if (item.sub) {
                              setActiveDepartmentSub(item.name);
                            } else {
                              setActiveDepartmentSub(null);
                            }
                          }}
                        >
                          {item.sub ? (
                            <div
                              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                                activeDepartmentSub === item.name
                                  ? "bg-[#002b60]/8 text-[#002b60]"
                                  : "text-neutral-700 hover:bg-neutral-50 hover:text-[#002b60]"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.badge && (
                                  <span className="rounded-full bg-[#dc0303] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </span>
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={() => {
                                setIsDepartmentMenuOpen(false);
                                setActiveDepartmentSub(null);
                              }}
                              className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                                item.badge
                                  ? "bg-[#002b60]/8 text-[#002b60] hover:bg-[#002b60]/12"
                                  : "text-neutral-700 hover:bg-neutral-50 hover:text-[#002b60]"
                              }`}
                            >
                              <span>{item.name}</span>
                              {item.badge && (
                                <span className="rounded-full bg-[#dc0303] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )}

                          {/* Submenu flyout panel with left bridge */}
                          {item.sub && activeDepartmentSub === item.name && (
                            <div className="absolute left-[calc(100%+4px)] top-0 w-64 max-h-[460px] overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white/98 backdrop-blur-md p-2 shadow-[0_20px_50px_rgba(0,43,96,0.15)] ring-1 ring-black/5 before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 before:content-['']">
                              {item.sub.map((section, si) => (
                                <div
                                  key={section.title}
                                  className={si > 0 ? "mt-2 pt-2 border-t border-neutral-100" : ""}
                                >
                                  <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                    {section.title}
                                  </div>
                                  <div className="space-y-0.5">
                                    {section.items.map((subItem) => (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        onClick={() => {
                                          setIsDepartmentMenuOpen(false);
                                          setActiveDepartmentSub(null);
                                        }}
                                        className="flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-[#002b60]/8 hover:text-[#002b60] transition-colors"
                                      >
                                        {subItem.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* ─────────────────────────────────────────────────────────── */}

              <nav className="flex items-center gap-0.5">
                {navLinks.map((link) => (
                  <NavItem
                    key={link.name}
                    link={link}
                    onMegaMenuOpen={handleMegaMenuOpen}
                    onMegaMenuClose={handleMegaMenuClose}
                    isMegaMenuHovered={isMegaMenuHovered}
                  />
                ))}
              </nav>

              {/* Direct Brand Quick Links */}
              <div className="hidden 2xl:flex items-center gap-1.5 pl-3 border-l border-neutral-200/80">
                {[
                  { name: "HP", href: "/shop?brand=HP", logo: "/brands/hp.png" },
                  { name: "Dell", href: "/shop?brand=Dell", logo: "/brands/dell.png" },
                  { name: "Lenovo", href: "/shop?brand=Lenovo", logo: "/brands/lenovo.png" },
                  { name: "Microsoft", href: "/shop?brand=Microsoft", logo: "/brands/microsoft.png" },
                ].map((b) => (
                  <Link
                    key={b.name}
                    href={b.href}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-50 hover:bg-[#002b60]/5 border border-neutral-200/70 hover:border-[#002b60]/30 text-xs font-semibold text-neutral-600 hover:text-[#002b60] transition-all group"
                  >
                    <Image
                      src={b.logo}
                      alt={b.name}
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain group-hover:scale-110 transition-transform"
                    />
                    <span>{b.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── RIGHT: OTHER INFO (HOTLINE & SHOWROOM) ───────── */}
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              <a
                href={`tel:${(contact?.hotline || "+8801612182408").replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-neutral-50 hover:bg-neutral-100/90 px-3.5 py-1.5 text-xs font-semibold text-[#002b60] hover:border-[#002b60]/30 transition-all shadow-2xs group"
                title="Direct hotline helpline for inquiries & orders"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <Phone className="h-3.5 w-3.5 text-[#dc0303] group-hover:rotate-12 transition-transform" />
                <span className="whitespace-nowrap">
                  Hotline: <strong className="font-bold text-[#002b60]">{contact?.hotline || "01612-182408"}</strong>
                </span>
              </a>

              <Link
                href="/contact"
                className="hidden xl:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-[#002b60] hover:bg-neutral-100 transition-colors whitespace-nowrap"
                title="Visit our store in Mirpur 10, Dhaka"
              >
                <MapPin className="h-3.5 w-3.5 text-[#002b60]" />
                <span>Mirpur 10 Outlet</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
      />

      {/* MegaMenu for Categories */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        onMouseEnter={() => {
          handleMegaMenuOpen();
          setIsMegaMenuHovered(true);
        }}
        onMouseLeave={() => setIsMegaMenuHovered(false)}
        featuredProducts={megaMenuFeatured}
      />
    </header>
  );
};

interface NavLink {
  name: string;
  href: string;
  hasDropdown?: boolean;
  submenu?: { name: string; href: string; icon?: string }[];
  badge?: string;
}

const NavItem = ({
  link,
  onMegaMenuOpen,
  onMegaMenuClose,
  isMegaMenuHovered,
}: {
  link: NavLink;
  onMegaMenuOpen?: () => void;
  onMegaMenuClose?: () => void;
  isMegaMenuHovered?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const submenuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsHovered(true);

    // Open MegaMenu for Categories link
    if (link.name === "Categories" && onMegaMenuOpen) {
      onMegaMenuOpen();
    } else if (onMegaMenuClose && !isMegaMenuHovered) {
      onMegaMenuClose();
    }
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const isBrandsMenu = link.name === "Brands";

  return (
    <div
      className="group relative px-0.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={link.href}
        className={`relative flex items-center rounded-lg px-3 py-2 text-[13.5px] font-semibold tracking-[-0.01em] transition-all ${
          isHovered
            ? "text-[#002b60] bg-neutral-100/80"
            : "text-neutral-700 hover:text-[#002b60] hover:bg-neutral-50"
        }`}
      >
        <span>{link.name}</span>
        {link.hasDropdown && (
          <ChevronDown
            className={`ml-1.5 w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isHovered ? "rotate-180 text-[#002b60]" : ""
            }`}
          />
        )}
        {link.badge && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-xs leading-none tracking-wider">
            {link.badge}
          </span>
        )}
      </Link>

      {/* Submenu - only show for non-Categories links */}
      {link.hasDropdown && link.submenu && link.name !== "Categories" && (
        <motion.div
          ref={submenuRef}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={
            isHovered
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 8, scale: 0.98 }
          }
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`absolute left-0 top-[calc(100%+4px)] z-50 origin-top-left ${
            isHovered ? "pointer-events-auto" : "pointer-events-none"
          } ${
            isBrandsMenu
              ? "w-[440px] p-4 bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_24px_60px_rgba(0,43,96,0.16)] border border-neutral-200/80 ring-1 ring-black/5"
              : "w-60 p-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_20px_45px_rgba(0,43,96,0.14)] border border-neutral-200/80 ring-1 ring-black/5"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isBrandsMenu ? (
            <div>
              <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-[#dc0303]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Official Brands
                  </span>
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  Genuine Laptops & Warranty
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {link.submenu
                  .filter((sub) => sub.name !== "All Brands")
                  .map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="group/brand flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50/90 border border-transparent hover:border-neutral-200/70 transition-all"
                    >
                      <div className="relative w-8 h-8 rounded-lg bg-neutral-50 group-hover/brand:bg-white border border-neutral-200/60 flex items-center justify-center p-1 shrink-0 transition-all group-hover/brand:shadow-2xs">
                        {subItem.icon ? (
                          <Image
                            src={subItem.icon}
                            alt={subItem.name}
                            width={24}
                            height={24}
                            className="object-contain max-h-5 w-auto group-hover/brand:scale-110 transition-transform"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#002b60]">
                            {subItem.name.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-800 group-hover/brand:text-[#002b60] transition-colors leading-tight">
                          {subItem.name}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {subItem.name === "HP"
                            ? "EliteBook & Pavilion"
                            : subItem.name === "Dell"
                            ? "Latitude & XPS"
                            : subItem.name === "Lenovo"
                            ? "ThinkPad & Yoga"
                            : subItem.name === "Microsoft"
                            ? "Surface Pro & Studio"
                            : subItem.name === "Asus"
                            ? "ZenBook & ROG"
                            : subItem.name === "Acer"
                            ? "Swift & Predator"
                            : "Explore Laptops"}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 opacity-0 group-hover/brand:opacity-100 group-hover/brand:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-100">
                <Link
                  href="/shop"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-50/80 hover:bg-[#002b60]/5 text-xs font-bold text-[#002b60] border border-neutral-200/70 hover:border-[#002b60]/30 transition-all group/all"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#002b60] text-white text-[10px]">
                      ★
                    </span>
                    <span>Browse All Brands & Collections</span>
                  </span>
                  <span className="text-neutral-400 group-hover/all:translate-x-1 group-hover/all:text-[#002b60] transition-all">
                    →
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {link.submenu.map((subItem) => (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className="group/item flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-neutral-700 rounded-xl hover:bg-[#002b60]/8 hover:text-[#002b60] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {subItem.icon && (
                      <div className="relative w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center p-0.5 shrink-0">
                        <Image
                          src={subItem.icon}
                          alt={subItem.name}
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="truncate">{subItem.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Header;
