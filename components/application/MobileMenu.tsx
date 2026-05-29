"use client";

import { departmentMenuItems, navigationLinks } from "@/app/data/menu-config";
import { Product } from "@/types/product";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  ChevronRight,
  Facebook,
  Flame,
  Instagram,
  Laptop,
  Mail,
  Package,
  Search,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon map for department items
const deptIconMap: Record<string, React.ReactNode> = {
  "Super Deals": <Zap className="w-4 h-4" />,
  Laptop: <Laptop className="w-4 h-4" />,
  Tablets: <Package className="w-4 h-4" />,
  Gadgets: <Sparkles className="w-4 h-4" />,
  "Laptop Accessories": <Tag className="w-4 h-4" />,
  Accessories: <Tag className="w-4 h-4" />,
  Shop: <Package className="w-4 h-4" />,
};

// Accent colors for department rows
const deptColorMap: Record<string, { bg: string; icon: string; ring: string }> =
  {
    "Super Deals": {
      bg: "bg-amber-50",
      icon: "text-amber-500",
      ring: "ring-amber-200",
    },
    Laptop: { bg: "bg-blue-50", icon: "text-blue-500", ring: "ring-blue-200" },
    Tablets: {
      bg: "bg-purple-50",
      icon: "text-purple-500",
      ring: "ring-purple-200",
    },
    Gadgets: {
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
      ring: "ring-emerald-200",
    },
    "Laptop Accessories": {
      bg: "bg-rose-50",
      icon: "text-rose-500",
      ring: "ring-rose-200",
    },
    Accessories: {
      bg: "bg-rose-50",
      icon: "text-rose-500",
      ring: "ring-rose-200",
    },
    Shop: { bg: "bg-sky-50", icon: "text-sky-500", ring: "ring-sky-200" },
  };

const quickLinks = [
  { label: "🔥 Deals", href: "/deals" },
  { label: "🆕 New", href: "/shop?sort=new" },
  { label: "💰 Budget", href: "/shop?category=budget" },
  { label: "🎮 Gaming", href: "/shop?category=gaming" },
  { label: "💼 Business", href: "/shop?category=business" },
];

const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const drawerVariants: Variants = {
  closed: {
    x: "-105%",
    transition: { type: "spring", stiffness: 380, damping: 38 },
  },
  open: {
    x: "0%",
    transition: { type: "spring", stiffness: 380, damping: 38 },
  },
};

const listVariants: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
};

const rowVariants: Variants = {
  closed: { opacity: 0, x: -14 },
  open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 340, damping: 32 } },
};

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) setAllProducts(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setOpenSubmenu(null);
      setSearchQuery("");
      setSearchResults([]);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const toggleSubmenu = (key: string) =>
    setOpenSubmenu(openSubmenu === key ? null : key);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-[3px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed left-0 top-0 z-50 flex h-dvh w-[88vw] max-w-90 flex-col overflow-hidden bg-white shadow-[20px_0_70px_rgba(0,0,0,0.22)]"
          >
            {/* ── Dark Brand Header ── */}
            <div className="relative flex items-center justify-between bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
              {/* Subtle grid texture overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 20px)",
                }}
              />

              <div className="relative h-8 w-28">
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point Bangladesh"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-full p-2 text-slate-400 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* ── Search Bar ── */}
            <div className="border-b border-slate-100 bg-white px-4 py-3">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search laptops, brands…"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(100,116,139,0.12)]"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Search dropdown */}
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    {searchResults.length > 0 ? (
                      <div className="max-h-56 overflow-y-auto">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50"
                          >
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ৳{product.price.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/shop?search=${searchQuery}`}
                          onClick={onClose}
                          className="block border-t border-slate-100 py-2 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          View all results →
                        </Link>
                      </div>
                    ) : (
                      <p className="px-4 py-4 text-center text-sm text-slate-400">
                        No products found
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Quick-access chips ── */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 scrollbar-hide">
              {quickLinks.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  onClick={onClose}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-slate-400 hover:text-slate-900 active:scale-95"
                >
                  {chip.label}
                </Link>
              ))}
            </div>

            {/* ── Scrollable Nav ── */}
            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 scrollbar-hide">
              {/* Departments section */}
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Departments
              </p>

              <motion.div
                variants={listVariants}
                initial="closed"
                animate="open"
                className="flex flex-col gap-1"
              >
                {departmentMenuItems.map((item) => {
                  const menuKey = `dept-${item.name}`;
                  const submenu = item.sub
                    ? item.sub.flatMap((s) => s.items)
                    : null;
                  const colors =
                    deptColorMap[item.name] ?? {
                      bg: "bg-slate-50",
                      icon: "text-slate-500",
                      ring: "ring-slate-200",
                    };
                  const icon = deptIconMap[item.name] ?? (
                    <Package className="w-4 h-4" />
                  );
                  const isOpen = openSubmenu === menuKey;

                  return (
                    <motion.div key={menuKey} variants={rowVariants}>
                      {/* Row */}
                      <div
                        className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                          isOpen
                            ? "border-slate-300 shadow-sm"
                            : "border-slate-150 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className="flex cursor-pointer items-center gap-3 px-3 py-3"
                          onClick={() =>
                            submenu && submenu.length > 0
                              ? toggleSubmenu(menuKey)
                              : onClose()
                          }
                        >
                          {/* Icon pill */}
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${colors.bg} ${colors.icon} ${colors.ring}`}
                          >
                            {icon}
                          </span>

                          <Link
                            href={item.href}
                            className="flex-1 text-sm font-semibold text-slate-800"
                            onClick={(e) => {
                              if (submenu && submenu.length > 0)
                                e.preventDefault();
                              else onClose();
                            }}
                          >
                            {item.name}
                            {item.badge && (
                              <span className="ml-2 text-base leading-none">
                                {item.badge}
                              </span>
                            )}
                          </Link>

                          {submenu && submenu.length > 0 && (
                            <motion.span
                              animate={{ rotate: isOpen ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-slate-400"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.span>
                          )}
                        </div>

                        {/* Submenu */}
                        <AnimatePresence initial={false}>
                          {isOpen && submenu && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: { type: "spring", stiffness: 320, damping: 30 },
                                opacity: { duration: 0.18 },
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 bg-slate-50/80 px-3 pb-2 pt-1.5">
                                <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3">
                                  {submenu.map((sub) => (
                                    <Link
                                      key={sub.name}
                                      href={sub.href}
                                      onClick={onClose}
                                      className="rounded-lg px-2 py-2 text-sm text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Divider + navigation links */}
              <div className="my-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Pages
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <motion.div
                variants={listVariants}
                initial="closed"
                animate="open"
                className="flex flex-col gap-1"
              >
                {navigationLinks.map((item) => {
                  const menuKey = `nav-${item.name}`;
                  const isOpen = openSubmenu === menuKey;
                  return (
                    <motion.div key={menuKey} variants={rowVariants}>
                      <div
                        className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                          isOpen
                            ? "border-slate-300 bg-white shadow-sm"
                            : "border-slate-150 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className="flex cursor-pointer items-center justify-between px-4 py-3"
                          onClick={() =>
                            item.submenu && item.submenu.length > 0
                              ? toggleSubmenu(menuKey)
                              : onClose()
                          }
                        >
                          <Link
                            href={item.href}
                            className="flex flex-1 items-center gap-2 text-sm font-medium text-slate-700"
                            onClick={(e) => {
                              if (item.submenu && item.submenu.length > 0)
                                e.preventDefault();
                              else onClose();
                            }}
                          >
                            {item.name}
                            {item.badge && (
                              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                <Flame className="h-2.5 w-2.5 fill-current" />
                                {item.badge}
                              </span>
                            )}
                          </Link>

                          {item.submenu && item.submenu.length > 0 && (
                            <motion.span
                              animate={{ rotate: isOpen ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-slate-400"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.span>
                          )}
                        </div>

                        <AnimatePresence initial={false}>
                          {isOpen && item.submenu && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: { type: "spring", stiffness: 320, damping: 30 },
                                opacity: { duration: 0.18 },
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 bg-slate-50/80 px-3 pb-2 pt-1.5">
                                <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-slate-200 pl-3">
                                  {item.submenu.map((sub) => (
                                    <Link
                                      key={sub.name}
                                      href={sub.href}
                                      onClick={onClose}
                                      className="rounded-lg px-2 py-2 text-sm text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </nav>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {/* CTA button */}
              <Link
                href="/deals"
                onClick={onClose}
                className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-sm font-bold text-white shadow-[0_4px_14px_rgba(245,158,11,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(245,158,11,0.45)] active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-current" />
                View All Deals
              </Link>

              {/* Social links */}
              <div className="flex items-center justify-center gap-5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-slate-400 transition-colors hover:text-blue-600"
                >
                  <Facebook className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-slate-400 transition-colors hover:text-pink-500"
                >
                  <Instagram className="h-[18px] w-[18px]" />
                </a>
                <a
                  href="mailto:info@laptoppoint.com.bd"
                  aria-label="Email"
                  className="text-slate-400 transition-colors hover:text-rose-500"
                >
                  <Mail className="h-[18px] w-[18px]" />
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
