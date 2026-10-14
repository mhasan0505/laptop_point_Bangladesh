"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Zap,
  Clock,
  Sparkles,
  Plus,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  Star,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Upload,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  Package,
} from "lucide-react";

interface PowerDealModel {
  id: string;
  productId?: string | null;
  name: string;
  slug: string;
  brand: string;
  screen: string;
  cpu: string;
  ram: string;
  storage: string;
  graphics?: string | null;
  image: string;
  originalPrice: number;
  salePrice: number;
  badge?: string | null;
  techBadge?: string | null;
  condition?: string | null;
  stockStatus?: string | null;
  stockQty?: number | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
}

interface CampaignConfig {
  title: string;
  subtitle: string;
  savingsHighlight: string;
  targetDate: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerDiscount: string;
  active: boolean;
}

interface CatalogProductOption {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  price?: number | null;
  marketPrice?: number | null;
  images: string[];
  specs?: any;
  condition?: string | null;
  stockQty: number;
  stockStatus: string;
}

const BADGE_PRESETS = [
  "Hot Drop",
  "Sale",
  "Top Seller",
  "Workstation",
  "Power Pick",
  "4K Display",
  "2-in-1 Touch",
  "Under ৳50K",
];

const TECH_BADGE_PRESETS = [
  "RTX 5060 + AI",
  "Quadro GPU",
  "Copilot+ PC",
  "Intel Evo",
  "Mil-Spec Tested",
  "1.09kg Ultralight",
  "InfinityEdge",
  "TrackPoint Classic",
];

function toDatetimeLocal(isoString?: string | null): string {
  if (!isoString) {
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  }
  try {
    return new Date(isoString).toISOString().slice(0, 16);
  } catch {
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
  }
}

export default function AdminPowerDealPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  // State
  const [activeTab, setActiveTab] = useState<"deals" | "config">("deals");
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [deals, setDeals] = useState<PowerDealModel[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProductOption[]>([]);
  const [config, setConfig] = useState<CampaignConfig>({
    title: "THE POWER DEAL",
    subtitle:
      "Authentic commercial laptops, featherlight ultrabooks, and high-performance workstations at verified clearance prices. Tested by engineers with official replacement warranty.",
    savingsHighlight: "Up to ৳30,400 Instant Savings",
    targetDate: toDatetimeLocal(),
    bannerTitle: "THE POWER DEAL",
    bannerSubtitle:
      "Incredible deals on ASUS, LENOVO, MSI, Acer and HP Devices. Upgrade your tech today!",
    bannerDiscount: "UPTO 25000TK OFF",
    active: true,
  });

  // UI Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Partial<PowerDealModel> | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [dealFilterSearch, setDealFilterSearch] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/power-deal");
      if (!res.ok) throw new Error("Failed to load power deals");
      const json = await res.json();

      if (json.config) {
        setConfig({
          ...json.config,
          targetDate: toDatetimeLocal(json.config.targetDate),
        });
      }
      if (Array.isArray(json.deals)) {
        setDeals(json.deals);
      }
      if (Array.isArray(json.availableProducts)) {
        setCatalogProducts(json.availableProducts);
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Save Campaign Config
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch("/api/admin/power-deal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save campaign settings");
      showToast("success", "Campaign settings saved successfully!");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingConfig(false);
    }
  };

  // Toggle deal active
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const updated = deals.map((d) => (d.id === id ? { ...d, active: !currentActive } : d));
    setDeals(updated);

    try {
      const res = await fetch(`/api/admin/power-deal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showToast("success", !currentActive ? "Deal enabled" : "Deal disabled");
    } catch {
      showToast("error", "Failed to update deal status");
      loadData();
    }
  };

  // Toggle deal featured (Spotlight)
  const handleSetFeatured = async (id: string) => {
    const updated = deals.map((d) => ({
      ...d,
      featured: d.id === id,
    }));
    setDeals(updated);

    try {
      const res = await fetch(`/api/admin/power-deal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: true }),
      });
      if (!res.ok) throw new Error("Failed to set spotlight");
      showToast("success", "Spotlight deal updated!");
    } catch {
      showToast("error", "Failed to set spotlight deal");
      loadData();
    }
  };

  // Delete deal
  const handleDeleteDeal = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from Power Deals?`)) return;

    setDeals((prev) => prev.filter((d) => d.id !== id));
    try {
      const res = await fetch(`/api/admin/power-deal?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete deal");
      showToast("success", "Deal removed successfully");
    } catch {
      showToast("error", "Failed to delete deal");
      loadData();
    }
  };

  // Move deal up/down in list
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= deals.length) return;

    const newDeals = [...deals];
    const [moved] = newDeals.splice(index, 1);
    newDeals.splice(targetIndex, 0, moved);

    // Update sortOrder
    const reordered = newDeals.map((d, idx) => ({ ...d, sortOrder: idx }));
    setDeals(reordered);

    try {
      await fetch("/api/admin/power-deal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deals: reordered }),
      });
    } catch {
      showToast("error", "Failed to persist new ordering");
    }
  };

  // Handle Image Upload for new or edited deal
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const stage = json?.stage ? ` [stage: ${json.stage}]` : "";
        const detail = json?.detail
          ? `: ${json.detail}`
          : json?.error
          ? `: ${json.error}`
          : "";
        throw new Error(`Upload failed${stage}${detail}`);
      }

      setEditingDeal((prev) => (prev ? { ...prev, image: json.url } : null));
      showToast("success", "Image uploaded (optimized WebP)");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save or Update deal in modal
  const handleSaveDealModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal?.name || !editingDeal?.salePrice) {
      showToast("error", "Please fill in product name and sale price");
      return;
    }

    try {
      if (editingDeal.id) {
        // Update existing
        const res = await fetch(`/api/admin/power-deal/${editingDeal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingDeal),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Update failed");
        showToast("success", "Power Deal updated");
      } else {
        // Create new
        const res = await fetch("/api/admin/power-deal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingDeal),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Create failed");
        showToast("success", "New Power Deal created");
      }

      setIsEditModalOpen(false);
      setEditingDeal(null);
      loadData();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save deal");
    }
  };

  // Import existing product as Power Deal
  const handleImportProduct = (prod: CatalogProductOption) => {
    const specs = prod.specs || {};
    const cpu =
      specs.Processor?.["Processor Model"] ||
      specs.Processor?.["Processor Brand"] ||
      "Fast Multi-Core Processor";
    const ram = specs.Memory?.["RAM"] || "16 GB RAM";
    const storage = specs.Storage?.["Storage Capacity"] || "512 GB SSD";
    const screen = specs.Display?.["Display Size"] || '14" Display';
    const graphics = specs.Graphics?.["Graphics Model"] || undefined;

    const originalPrice = prod.marketPrice ?? prod.price ?? 60000;
    const salePrice = prod.price ?? Math.round(originalPrice * 0.9);

    setEditingDeal({
      productId: prod.id,
      name: prod.name,
      slug: prod.slug,
      brand: prod.brand || "General",
      screen,
      cpu,
      ram,
      storage,
      graphics,
      image: prod.images[0] || "/placeholder.png",
      originalPrice,
      salePrice,
      badge: "Power Deal",
      techBadge: "",
      condition: prod.condition || "Grade A+ Refurbished",
      stockStatus: prod.stockStatus || "In Stock",
      stockQty: prod.stockQty || 5,
      featured: false,
      active: true,
    });

    setIsImportModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Filter deals list by search
  const filteredDeals = useMemo(() => {
    if (!dealFilterSearch.trim()) return deals;
    const q = dealFilterSearch.toLowerCase();
    return deals.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.brand.toLowerCase().includes(q) ||
        d.cpu.toLowerCase().includes(q)
    );
  }, [deals, dealFilterSearch]);

  // Filter catalog products for import modal
  const filteredCatalog = useMemo(() => {
    if (!productSearch.trim()) return catalogProducts.slice(0, 15);
    const q = productSearch.toLowerCase();
    return catalogProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [catalogProducts, productSearch]);

  if (authLoading || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#57BA47] mx-auto" />
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Loading Power Deals CMS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 select-none">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold shadow-xl border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-800"
                : "bg-red-950/90 text-red-200 border-red-800"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#57BA47]/10 text-[#57BA47] text-[11px] font-bold uppercase tracking-wider mb-1">
            <Zap size={13} className="fill-[#57BA47]" />
            Campaign CMS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            The Power Deal Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage promotional laptop drops, flash clearance countdown, and spotlight featured deals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/power-deal"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 text-xs font-bold transition-colors"
          >
            <span>Preview Page</span>
            <ArrowUpRight size={14} />
          </Link>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Package size={15} />
            <span>Import from Inventory</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingDeal({
                name: "",
                slug: "",
                brand: "Lenovo",
                screen: '14" FHD IPS',
                cpu: "Intel Core i5",
                ram: "16 GB DDR4",
                storage: "512 GB SSD",
                image: "/placeholder.png",
                originalPrice: 65000,
                salePrice: 58000,
                badge: "Sale",
                techBadge: "",
                condition: "Grade A+ Refurbished",
                stockStatus: "In Stock",
                stockQty: 5,
                featured: false,
                active: true,
              });
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#57BA47] hover:bg-[#4ea83f] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Custom Deal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab("deals")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "deals"
              ? "border-[#57BA47] text-[#57BA47]"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Zap size={14} />
          <span>Active Deals ({deals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "config"
              ? "border-[#57BA47] text-[#57BA47]"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Clock size={14} />
          <span>Countdown &amp; Campaign Settings</span>
        </button>
      </div>

      {/* TAB 1: DEALS CATALOG */}
      {activeTab === "deals" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4 p-3 bg-white rounded-xl border border-neutral-200/90 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={dealFilterSearch}
                onChange={(e) => setDealFilterSearch(e.target.value)}
                placeholder="Filter power deals by name, brand, or processor..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-[#57BA47] focus:bg-white"
              />
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              Showing <span className="font-bold text-neutral-900">{filteredDeals.length}</span> of {deals.length} deals
            </div>
          </div>

          {/* Deals Table / List */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="py-3 px-3 w-12 text-center">Order</th>
                    <th className="py-3 px-3 w-16">Image</th>
                    <th className="py-3 px-4">Laptop &amp; Specs</th>
                    <th className="py-3 px-3">Price &amp; Savings</th>
                    <th className="py-3 px-3">Badges</th>
                    <th className="py-3 px-3 text-center">Spotlight</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredDeals.map((deal, idx) => {
                    const savings = Math.max(0, deal.originalPrice - deal.salePrice);
                    const discount = deal.originalPrice > 0 ? Math.round((savings / deal.originalPrice) * 100) : 0;

                    return (
                      <tr
                        key={deal.id}
                        className={`transition-colors hover:bg-neutral-50/70 ${
                          !deal.active ? "opacity-50 bg-neutral-50/30" : ""
                        }`}
                      >
                        {/* Order Reorder */}
                        <td className="py-3 px-2 text-center">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMove(idx, "up")}
                              disabled={idx === 0}
                              className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <span className="font-mono text-[10px] text-neutral-500 font-bold">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMove(idx, "down")}
                              disabled={idx === deals.length - 1}
                              className="text-neutral-400 hover:text-neutral-900 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Image */}
                        <td className="py-3 px-3">
                          <div className="relative w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-200 overflow-hidden flex items-center justify-center p-1">
                            <Image
                              src={deal.image}
                              alt={deal.name}
                              fill
                              className="object-contain p-0.5"
                              unoptimized
                            />
                          </div>
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-bold uppercase text-[9px]">
                              {deal.brand}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              {deal.condition || "Refurbished"}
                            </span>
                          </div>
                          <div className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1 max-w-sm">
                            {deal.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono mt-0.5 line-clamp-1">
                            {deal.cpu} • {deal.ram} • {deal.storage} • {deal.screen}
                          </div>
                        </td>

                        {/* Prices */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-extrabold text-neutral-900 text-xs sm:text-sm">
                            ৳{deal.salePrice.toLocaleString("en-BD")}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-neutral-400 line-through">
                              ৳{deal.originalPrice.toLocaleString("en-BD")}
                            </span>
                            <span className="text-emerald-600 font-bold">
                              -{discount}%
                            </span>
                          </div>
                        </td>

                        {/* Badges */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1 items-start">
                            {deal.badge && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                {deal.badge}
                              </span>
                            )}
                            {deal.techBadge && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-neutral-900 text-white">
                                {deal.techBadge}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Spotlight Selector */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleSetFeatured(deal.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              deal.featured
                                ? "bg-amber-100 text-amber-600"
                                : "text-neutral-300 hover:text-amber-500"
                            }`}
                            title={deal.featured ? "Current Spotlight Deal" : "Set as Hero Spotlight"}
                          >
                            <Star size={16} className={deal.featured ? "fill-amber-500 text-amber-500" : ""} />
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(deal.id, deal.active)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              deal.active
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-neutral-400 hover:bg-neutral-100"
                            }`}
                            title={deal.active ? "Enabled on storefront" : "Disabled (Hidden)"}
                          >
                            {deal.active ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDeal(deal);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-black transition-colors cursor-pointer"
                              title="Edit Deal"
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDeal(deal.id, deal.name)}
                              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:border-red-300 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Deal"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGN CONFIG & COUNTDOWN */}
      {activeTab === "config" && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Header Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">Landing Page Header</h3>
                    <p className="text-xs text-neutral-500">Configure text displayed at the top of /power-deal</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                    <input
                      type="checkbox"
                      checked={config.active}
                      onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                      className="rounded border-neutral-300 text-[#57BA47] focus:ring-[#57BA47] w-4 h-4 cursor-pointer"
                    />
                    <span>Campaign Active</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Campaign Main Headline
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white"
                      placeholder="THE POWER DEAL"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Savings Highlight Tag
                    </label>
                    <input
                      type="text"
                      value={config.savingsHighlight}
                      onChange={(e) => setConfig({ ...config, savingsHighlight: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white"
                      placeholder="Up to ৳30,400 Instant Savings"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Campaign Subtitle &amp; Narrative
                    </label>
                    <textarea
                      rows={3}
                      value={config.subtitle}
                      onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white resize-none"
                      placeholder="Describe warranty, showroom testing, and origin..."
                    />
                  </div>
                </div>
              </div>

              {/* Countdown Target Date Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-bold text-sm text-neutral-900">Countdown Timer Target</h3>
                  <p className="text-xs text-neutral-500">
                    Live clock counts down to this date &amp; time. When reached, urgency notices reflect.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Countdown Target Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={config.targetDate}
                      onChange={(e) => setConfig({ ...config, targetDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
                        setConfig({ ...config, targetDate: next });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-semibold hover:bg-neutral-50"
                    >
                      +2 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
                        setConfig({ ...config, targetDate: next });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[11px] font-semibold hover:bg-neutral-50"
                    >
                      +7 Days
                    </button>
                  </div>
                </div>
              </div>

              {/* Homepage PowerDeal Banner Card */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-bold text-sm text-neutral-900">Homepage Banner Copy</h3>
                  <p className="text-xs text-neutral-500">
                    Controls promotional strip displayed across the main homepage
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Banner Headline
                      </label>
                      <input
                        type="text"
                        value={config.bannerTitle}
                        onChange={(e) => setConfig({ ...config, bannerTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Discount Highlight
                      </label>
                      <input
                        type="text"
                        value={config.bannerDiscount}
                        onChange={(e) => setConfig({ ...config, bannerDiscount: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white"
                        placeholder="UPTO 25000TK OFF"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Banner Subtitle Text
                    </label>
                    <input
                      type="text"
                      value={config.bannerSubtitle}
                      onChange={(e) => setConfig({ ...config, bannerSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Preview Widget */}
            <div className="space-y-6">
              <div className="bg-neutral-950 text-white rounded-2xl p-5 border border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-2">
                  <span className="font-bold uppercase tracking-wider text-[#57BA47]">
                    Live Header Preview
                  </span>
                  <span className="text-[10px] font-mono">/power-deal</span>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-[#57BA47]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#57BA47] animate-ping" />
                    <span>{config.savingsHighlight || "Up to ৳30,400 Instant Savings"}</span>
                  </div>

                  <h4 className="text-xl font-black text-white leading-tight">
                    {config.title || "THE POWER DEAL"}
                  </h4>

                  <p className="text-[11px] text-neutral-400 line-clamp-3 leading-relaxed">
                    {config.subtitle}
                  </p>
                </div>

                {/* Simulated countdown */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 text-center">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-mono text-sm font-bold">02</span>
                    <span className="block text-[8px] text-neutral-500 uppercase">Days</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-mono text-sm font-bold">14</span>
                    <span className="block text-[8px] text-neutral-500 uppercase">Hours</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-mono text-sm font-bold">28</span>
                    <span className="block text-[8px] text-neutral-500 uppercase">Mins</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                    <span className="font-mono text-sm font-bold text-[#57BA47]">45</span>
                    <span className="block text-[8px] text-neutral-500 uppercase">Secs</span>
                  </div>
                </div>
              </div>

              {/* Sticky Save Button */}
              <div className="sticky top-20 bg-white p-4 rounded-xl border border-neutral-200/90 shadow-sm space-y-2">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingConfig ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Campaign Settings
                    </>
                  )}
                </button>
                <p className="text-[10px] text-neutral-400 text-center">
                  Updates instantly apply across all storefront visitors.
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* MODAL 1: IMPORT FROM PRODUCT CATALOG */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    Select a Product to Add to Power Deals
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Pulls model name, specs, and photography directly from active store catalog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, brand (Dell, HP, Lenovo)..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-900 outline-none focus:border-[#57BA47]"
                  />
                </div>
              </div>

              {/* Product List */}
              <div className="p-4 overflow-y-auto divide-y divide-neutral-100 space-y-2 flex-1">
                {filteredCatalog.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-11 h-11 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                        {prod.images?.[0] ? (
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        ) : (
                          <Package size={16} className="text-neutral-400 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-neutral-900 truncate">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                          <span className="font-semibold text-neutral-700">
                            ৳{(prod.price ?? prod.marketPrice ?? 0).toLocaleString("en-BD")}
                          </span>
                          <span>•</span>
                          <span>{prod.stockStatus}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImportProduct(prod)}
                      className="px-3 py-1.5 rounded-lg bg-[#57BA47] hover:bg-[#4ea83f] text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Select &amp; Configure
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDIT / CREATE POWER DEAL */}
      <AnimatePresence>
        {isEditModalOpen && editingDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    {editingDeal.id ? "Edit Power Deal" : "Configure New Power Deal"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Set promotional discount, spotlight placement, and specs badges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDealModal} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
                {/* Product Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Deal Display Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingDeal.name || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] focus:bg-white text-xs"
                      placeholder="e.g. Lenovo ThinkPad T14 Gen 1 AMD PRO"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Brand</label>
                    <select
                      value={editingDeal.brand || "Lenovo"}
                      onChange={(e) => setEditingDeal({ ...editingDeal, brand: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] focus:bg-white text-xs"
                    >
                      <option value="Lenovo">Lenovo</option>
                      <option value="HP">HP</option>
                      <option value="Dell">Dell</option>
                      <option value="Apple">Apple</option>
                      <option value="Microsoft">Microsoft</option>
                      <option value="Asus">Asus</option>
                      <option value="Acer">Acer</option>
                      <option value="MSI">MSI</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Savings */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Promotional Sale Price (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingDeal.salePrice ?? ""}
                      onChange={(e) =>
                        setEditingDeal({ ...editingDeal, salePrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 outline-none focus:border-[#57BA47] text-xs font-bold text-neutral-900"
                      placeholder="e.g. 69500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Original Regular Price (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingDeal.originalPrice ?? ""}
                      onChange={(e) =>
                        setEditingDeal({ ...editingDeal, originalPrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-white border border-neutral-200 outline-none focus:border-[#57BA47] text-xs font-semibold text-neutral-600"
                      placeholder="e.g. 78000"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="text-[11px] text-neutral-500">
                      Calculated Savings:{" "}
                      <span className="font-bold text-[#e53935]">
                        ৳
                        {Math.max(
                          0,
                          (editingDeal.originalPrice ?? 0) - (editingDeal.salePrice ?? 0)
                        ).toLocaleString("en-BD")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specs Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Processor (CPU)</label>
                    <input
                      type="text"
                      value={editingDeal.cpu || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, cpu: e.target.value })}
                      placeholder="AMD Ryzen 7 PRO"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Memory (RAM)</label>
                    <input
                      type="text"
                      value={editingDeal.ram || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, ram: e.target.value })}
                      placeholder="16 GB DDR4"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Storage</label>
                    <input
                      type="text"
                      value={editingDeal.storage || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, storage: e.target.value })}
                      placeholder="512 GB NVMe SSD"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Screen / Display</label>
                    <input
                      type="text"
                      value={editingDeal.screen || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, screen: e.target.value })}
                      placeholder='14" WUXGA IPS'
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                  </div>
                </div>

                {/* Badges & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Campaign Badge</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingDeal.badge || ""}
                        onChange={(e) => setEditingDeal({ ...editingDeal, badge: e.target.value })}
                        placeholder="Hot Drop"
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {BADGE_PRESETS.slice(0, 4).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setEditingDeal({ ...editingDeal, badge: b })}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Tech Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingDeal.techBadge || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, techBadge: e.target.value })}
                      placeholder="RTX 5060 + AI"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {TECH_BADGE_PRESETS.slice(0, 3).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setEditingDeal({ ...editingDeal, techBadge: t })}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Condition</label>
                    <input
                      type="text"
                      value={editingDeal.condition || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, condition: e.target.value })}
                      placeholder="Grade A+ Refurbished"
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                  </div>
                </div>

                {/* Image URL & Upload */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingDeal.image || ""}
                      onChange={(e) => setEditingDeal({ ...editingDeal, image: e.target.value })}
                      placeholder="/uploads/... or /dell/.../main.jpg"
                      className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-200 outline-none focus:border-[#57BA47] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3 py-2 rounded-lg border border-neutral-300 hover:border-neutral-400 bg-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isUploadingImage ? (
                        <Loader2 size={14} className="animate-spin text-[#57BA47]" />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                {/* Checkbox Options */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeal.featured)}
                      onChange={(e) => setEditingDeal({ ...editingDeal, featured: e.target.checked })}
                      className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 text-amber-700">
                      <Star size={14} className="fill-amber-500" />
                      Set as Hero Spotlight Deal of the Day
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={editingDeal.active !== false}
                      onChange={(e) => setEditingDeal({ ...editingDeal, active: e.target.checked })}
                      className="rounded border-neutral-300 text-[#57BA47] focus:ring-[#57BA47] w-4 h-4 cursor-pointer"
                    />
                    <span>Active on Storefront</span>
                  </label>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#57BA47] hover:bg-[#4ea83f] text-white font-bold shadow-xs cursor-pointer"
                  >
                    Save Deal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
