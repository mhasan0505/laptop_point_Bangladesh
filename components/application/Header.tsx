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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MegaMenu from "../navigation/MegaMenu";

const Header = () => {
  const router = useRouter();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMegaMenuHovered, setIsMegaMenuHovered] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
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
      const normalizedQuery = query.toLowerCase();
      const normalizedCategory = selectedSearchCategory.toLowerCase();
      const filtered = searchIndex
        .filter(
          (product) =>
            (product.name.toLowerCase().includes(normalizedQuery) ||
              product.brand.toLowerCase().includes(normalizedQuery) ||
              product.category.toLowerCase().includes(normalizedQuery)) &&
            (selectedSearchCategory === "all" ||
              product.category.toLowerCase().includes(normalizedCategory)),
        )
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

  const navLinks = navigationLinks;

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
      departmentCloseTimerRef.current = null;
    }, 180);
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
      if (
        searchCategoryDropdownRef.current &&
        !searchCategoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleGlobalClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleGlobalClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 shadow-[0_6px_24px_rgba(15,23,42,0.04)] backdrop-blur supports-backdrop-filter:bg-white/90">
      <div className="border-b border-neutral-200 bg-[#f4f5f7] text-[11px] text-neutral-600 sm:text-xs">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex min-h-9 items-center justify-between gap-3 py-1.5">
            <p className="hidden truncate lg:block">
              Your trusted laptop shop in Mirpur Dhaka | Budget-friendly
              verified devices
            </p>
            <div className="flex items-center gap-3 text-neutral-700 sm:gap-5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 hover:text-neutral-900"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Store Locator</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 hover:text-neutral-900"
              >
                <Truck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Track Your Order</span>
              </Link>
              <a
                href="tel:+8801612182408"
                className="inline-flex items-center gap-1.5 hover:text-neutral-900"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden md:inline">+880 1612-182408</span>
              </a>
              <Link
                href="https://www.facebook.com/laptoppointbd"
                target="_blank"
                className="hover:text-neutral-900"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="https://www.youtube.com/@LaptopPointBD"
                target="_blank"
                className="hover:text-neutral-900"
                aria-label="Youtube"
              >
                <Youtube className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid min-h-22 grid-cols-[auto_1fr_auto] items-center gap-2 py-3 sm:gap-3 lg:gap-5">
            <Link href="/" className="shrink-0 pr-1 lg:pr-2">
              <div className="relative h-10 w-34 sm:h-12 sm:w-40">
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
                            {searchResults.map((product) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                onClick={() => setIsSearchExpanded(false)}
                                className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-50">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div>
                                  <p className="line-clamp-1 font-medium text-gray-900">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ৳{product.price.toLocaleString()}
                                  </p>
                                </div>
                              </Link>
                            ))}
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
                  className="group flex h-12 w-full items-center rounded-full border border-yellow-400/80 bg-white pl-2 pr-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all hover:border-yellow-500 hover:shadow-[0_8px_24px_rgba(251,191,36,0.2)]"
                >
                  <button
                    type="button"
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
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              <span>{option.label}</span>
                              {selectedSearchCategory === option.value && (
                                <span className="h-2 w-2 rounded-full bg-yellow-500" />
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
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-neutral-900 transition-colors group-hover:bg-yellow-300"
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
                    aria-label="Compare products"
                  >
                    <ArrowLeftRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>

              <Link
                href="/wishlist"
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
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-neutral-900">
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
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-neutral-900">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={isSearchExpanded ? "hidden md:block" : ""}
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

      <div className="hidden border-t border-neutral-200 bg-white lg:block">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex min-h-14 items-center gap-6">
            {/* ── ALL DEPARTMENTS DROPDOWN ─────────────────────────────── */}
            <DropdownMenu
              open={isDepartmentMenuOpen}
              onOpenChange={setIsDepartmentMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onMouseEnter={handleDepartmentMenuEnter}
                  onMouseLeave={handleDepartmentMenuLeave}
                  className="inline-flex h-11 min-w-56 items-center justify-between gap-2 rounded-t-md bg-yellow-400 px-5 text-sm font-semibold text-neutral-900 outline-none transition-colors hover:bg-yellow-300 data-[state=open]:bg-yellow-300"
                >
                  <span className="inline-flex items-center gap-2">
                    <Menu className="h-4 w-4" />
                    All Departments
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                sideOffset={0}
                onMouseEnter={handleDepartmentMenuEnter}
                onMouseLeave={handleDepartmentMenuLeave}
                className="w-64 overflow-hidden rounded-none rounded-b-xl border border-neutral-200 bg-white p-0 shadow-[0_16px_44px_rgba(15,23,42,0.16)]"
              >
                {departmentMenuItems.map((item) =>
                  item.sub ? (
                    <DropdownMenuSub key={item.name}>
                      <DropdownMenuSubTrigger className="flex cursor-pointer items-center justify-between rounded-none px-4 py-3 text-sm font-medium text-neutral-700 focus:bg-neutral-50 focus:text-neutral-900 data-[state=open]:bg-neutral-50">
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-2 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-neutral-900">
                            {item.badge}
                          </span>
                        )}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent
                        sideOffset={0}
                        className="w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 shadow-[0_16px_44px_rgba(15,23,42,0.16)]"
                      >
                        {item.sub.map((section, si) => (
                          <div key={section.title}>
                            {si > 0 && (
                              <DropdownMenuSeparator className="my-0" />
                            )}
                            <DropdownMenuLabel className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                              {section.title}
                            </DropdownMenuLabel>
                            {section.items.map((subItem) => (
                              <DropdownMenuItem key={subItem.name} asChild>
                                <Link
                                  href={subItem.href}
                                  className="cursor-pointer rounded-none px-4 py-2 text-sm font-medium text-neutral-700 focus:bg-neutral-50"
                                >
                                  {subItem.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ) : (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href}
                        className={`flex cursor-pointer items-center justify-between rounded-none px-4 py-3 text-sm font-medium focus:bg-neutral-50 ${
                          item.badge
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:bg-yellow-100"
                            : "text-neutral-700"
                        }`}
                      >
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-bold text-neutral-900">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* ─────────────────────────────────────────────────────────── */}

            <nav className="flex flex-wrap items-center gap-0">
              {navLinks
                .filter((link) => link.name !== "Home")
                .map((link) => (
                  <NavItem
                    key={link.name}
                    link={link}
                    onMegaMenuOpen={handleMegaMenuOpen}
                    onMegaMenuClose={handleMegaMenuClose}
                    isMegaMenuHovered={isMegaMenuHovered}
                  />
                ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
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
      />
    </header>
  );
};

interface NavLink {
  name: string;
  href: string;
  hasDropdown?: boolean;
  submenu?: { name: string; href: string }[];
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
      // Don't close MegaMenu on mouse leave - it should only close when clicking outside
    }, 350);
  };

  return (
    <div
      className="group relative px-0.5"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={link.href}
        className={`flex items-center rounded-md px-3 py-2 text-[13px] font-semibold tracking-[0.01em] transition-colors hover:bg-neutral-50 ${
          isHovered ? "text-yellow-700" : "text-neutral-700"
        }`}
      >
        {link.name}
        {link.hasDropdown && (
          <ChevronDown
            className={`ml-1 w-4 h-4 transition-transform duration-200 ${
              isHovered ? "rotate-180 text-yellow-600" : ""
            }`}
          />
        )}
        {link.badge && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white leading-none">
            {link.badge}
          </span>
        )}
      </Link>

      {/* Submenu - only show for non-Categories links */}
      {link.hasDropdown && link.submenu && link.name !== "Categories" && (
        <motion.div
          ref={submenuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={
            isHovered
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 10, scale: 0.95 }
          }
          transition={{ duration: 0.2 }}
          className={`absolute left-0 top-full w-56 p-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 origin-top-left ${
            isHovered ? "pointer-events-auto" : "pointer-events-none"
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col gap-1">
            {link.submenu.map((subItem) => (
              <Link
                key={subItem.name}
                href={subItem.href}
                className="block px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-yellow-50 hover:text-yellow-700 transition-colors font-medium"
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Header;
