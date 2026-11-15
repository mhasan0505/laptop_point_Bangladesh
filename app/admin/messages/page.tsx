"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  Search,
  Clock,
  Trash2,
  RefreshCw,
  Inbox,
  CheckCheck,
  Send,
  Eye,
  ShieldAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ipHash: string;
  userAgent: string;
  createdAt: string;
  status: "unread" | "read" | "handled";
}

const ITEMS_PER_PAGE = 10;

// Deterministic vibrant avatar background color based on sender name
function getAvatarColor(name: string): string {
  const gradients = [
    "from-emerald-500 to-teal-700",
    "from-blue-500 to-indigo-700",
    "from-violet-500 to-purple-700",
    "from-amber-500 to-orange-700",
    "from-rose-500 to-red-700",
    "from-cyan-500 to-blue-700",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return "Recently";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "Recently";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "handled">("all");
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const fetchMessages = useCallback(
    async (manual = false) => {
      if (manual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const res = await fetch("/api/admin/messages");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("Unauthorized or forbidden access");
          }
          throw new Error("Failed to load messages");
        }
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        if (manual) {
          showSuccessToast("Customer messages refreshed");
        }
      } catch (err: unknown) {
        console.error(err);
        showErrorToast(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showSuccessToast, showErrorToast]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/messages");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("Unauthorized or forbidden access");
          }
          throw new Error("Failed to load messages");
        }
        const data = await res.json();
        if (isMounted) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error(err);
          showErrorToast(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();


    
    return () => {
      isMounted = false;
    };
  }, [showErrorToast]);

  // Global keyboard shortcut to focus search with '/' or 'Cmd/Ctrl + K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStatusChange = async (id: string, newStatus: "unread" | "read" | "handled") => {
    setUpdatingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin:messages-updated"));
      }

      showSuccessToast(`Message marked as ${newStatus}`);
    } catch (err: unknown) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete message");
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setConfirmDeleteId(null);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin:messages-updated"));
      }

      showSuccessToast("Message deleted successfully");
    } catch (err: unknown) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setDeletingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showSuccessToast("Copied to clipboard");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      showErrorToast("Could not copy to clipboard");
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          (m.name || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q) ||
          (m.subject || "").toLowerCase().includes(q) ||
          (m.message || "").toLowerCase().includes(q) ||
          (m.ipHash || "").toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [messages, statusFilter, searchTerm]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / ITEMS_PER_PAGE));
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMessages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMessages, currentPage]);

  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === "unread").length;
    const read = messages.filter((m) => m.status === "read").length;
    const handled = messages.filter((m) => m.status === "handled").length;
    return { total, unread, read, handled };
  }, [messages]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredMessages.length === 0) {
      showErrorToast("No messages available to export");
      return;
    }

    const headers = ["ID", "Name", "Email", "Subject", "Status", "Date", "Message", "IP Hash", "User Agent"];
    const rows = filteredMessages.map((m) => [
      `"${m.id}"`,
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.subject || "").replace(/"/g, '""')}"`,
      `"${m.status}"`,
      `"${m.createdAt}"`,
      `"${(m.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${m.ipHash || ""}"`,
      `"${(m.userAgent || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customer-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccessToast(`Exported ${filteredMessages.length} message(s) to CSV`);
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedMessages.map((m) => m.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatusChange = async (newStatus: "unread" | "read" | "handled") => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      const responses = await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      const failed = responses.filter((r) => !r.ok);
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} message(s)`);
      }
      setMessages((prev) =>
        prev.map((m) => (selectedIds.has(m.id) ? { ...m, status: newStatus } : m))
      );
      setSelectedIds(new Set());
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin:messages-updated"));
      }
      showSuccessToast(`Marked ${ids.length} message(s) as ${newStatus}`);
    } catch {
      showErrorToast("Failed to update some messages");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 px-2 sm:px-4">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-[#002b60] to-[#001736] text-white shadow-md shadow-brand-navy/15 shrink-0">
            <Mail className="h-5 w-5 text-[#57BA47]" />
            {stats.unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Customer Inquiries
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inquiries from public contact form & leads • {stats.total} total
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={messages.length === 0}
            className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50 transition-all cursor-pointer h-9"
            title="Export to CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden xs:inline">Export</span> CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages(true)}
            disabled={isLoading || isRefreshing}
            className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50 transition-all cursor-pointer h-9"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-600 ${
                isLoading || isRefreshing ? "animate-spin text-[#57BA47]" : ""
              }`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Interactive KPI Cards (Quick Filter Shortcuts) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Total Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden group ${
            statusFilter === "all"
              ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20"
              : "bg-white hover:bg-slate-50/70 border-slate-200/80 hover:border-slate-300 shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                statusFilter === "all" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" /> Total
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                statusFilter === "all" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              All
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${
              statusFilter === "all" ? "text-white" : "text-slate-900"
            }`}
          >
            {stats.total}
          </div>
        </button>

        {/* Unread Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("unread")}
          className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden group ${
            statusFilter === "unread"
              ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20 ring-2 ring-amber-500/30"
              : "bg-gradient-to-br from-white to-amber-50/30 hover:to-amber-50/70 border-amber-200/80 hover:border-amber-300 shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                statusFilter === "unread" ? "text-amber-100" : "text-amber-700"
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> Unread
            </span>
            {stats.unread > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  statusFilter === "unread" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-800"
                }`}
              >
                Needs Action
              </span>
            )}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${
              statusFilter === "unread" ? "text-white" : "text-amber-600"
            }`}
          >
            {stats.unread}
          </div>
        </button>

        {/* Read Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("read")}
          className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden group ${
            statusFilter === "read"
              ? "bg-gradient-to-br from-sky-600 to-blue-700 text-white border-sky-600 shadow-md shadow-sky-600/20 ring-2 ring-sky-600/30"
              : "bg-gradient-to-br from-white to-sky-50/30 hover:to-sky-50/70 border-sky-200/80 hover:border-sky-300 shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                statusFilter === "read" ? "text-sky-100" : "text-sky-700"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Read
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${
              statusFilter === "read" ? "text-white" : "text-sky-600"
            }`}
          >
            {stats.read}
          </div>
        </button>

        {/* Handled Card */}
        <button
          type="button"
          onClick={() => setStatusFilter("handled")}
          className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden group ${
            statusFilter === "handled"
              ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/30"
              : "bg-gradient-to-br from-white to-emerald-50/30 hover:to-emerald-50/70 border-emerald-200/80 hover:border-emerald-300 shadow-xs hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                statusFilter === "handled" ? "text-emerald-100" : "text-emerald-700"
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Handled
            </span>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black mt-2 tracking-tight ${
              statusFilter === "handled" ? "text-white" : "text-emerald-600"
            }`}
          >
            {stats.handled}
          </div>
        </button>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by customer name, email, subject, text, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50/70 border border-transparent focus:border-slate-300 focus:bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#57BA47]/20 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0">
          {(["all", "unread", "read", "handled"] as const).map((status) => {
            const count =
              status === "all"
                ? stats.total
                : status === "unread"
                ? stats.unread
                : status === "read"
                ? stats.read
                : stats.handled;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    statusFilter === status
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bulk Selection Bar ── */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-[#002b60] text-white p-3 rounded-2xl shadow-md"
        >
          <div className="flex items-center gap-2 text-xs font-bold pl-1">
            <span className="h-2 w-2 rounded-full bg-[#57BA47] animate-pulse" />
            <span>{selectedIds.size} message(s) selected</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("handled")}
              className="h-7 px-2.5 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <CheckCheck className="h-3 w-3 mr-1" /> Mark Handled
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("read")}
              className="h-7 px-2.5 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Eye className="h-3 w-3 mr-1" /> Mark Read
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds(new Set())}
              className="h-7 px-2 text-[11px] font-medium bg-transparent hover:bg-white/10 text-white/80 border-white/15"
            >
              Deselect
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Messages List / Skeletons / Empty State ── */}
      <div className="space-y-3">
        {isLoading && messages.length === 0 ? (
          /* Shimmer Loading Skeletons */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-slate-200 rounded" />
                      <div className="h-2.5 w-44 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-14 w-full bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          /* Clean Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center space-y-4 shadow-xs"
          >
            <div className="relative mx-auto h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="h-8 w-8 text-slate-400" />
              <Sparkles className="h-4 w-4 text-[#57BA47] absolute top-1 right-1 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {searchTerm
                  ? "No matching inquiries found"
                  : statusFilter !== "all"
                  ? `No messages in '${statusFilter}'`
                  : "All clear! Inbox is empty"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchTerm
                  ? `No contact submissions match "${searchTerm}". Try a different name, email, or keyword.`
                  : statusFilter !== "all"
                  ? `You currently have zero inquiries marked as '${statusFilter}'.`
                  : "New customer inquiries from your public contact form will automatically arrive and notify you here."}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              {searchTerm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="text-xs font-semibold rounded-xl"
                >
                  Clear Search
                </Button>
              )}
              {statusFilter !== "all" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatusFilter("all")}
                  className="text-xs font-semibold rounded-xl"
                >
                  View All Inquiries
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchMessages(true)}
                className="text-xs font-semibold rounded-xl gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Check For New
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Real Message Cards with Smooth Animation */
          <AnimatePresence mode="popLayout">
            {paginatedMessages.map((msg) => {
              const isUnread = msg.status === "unread";
              const isHandled = msg.status === "handled";
              const isUpdating = Boolean(updatingIds[msg.id]);
              const isDeleting = Boolean(deletingIds[msg.id]);
              const isConfirmingDelete = confirmDeleteId === msg.id;
              const isExpanded = Boolean(expandedDetails[msg.id]);
              const isSelected = selectedIds.has(msg.id);
              const avatarInitials = getInitials(msg.name);
              const avatarColor = getAvatarColor(msg.name);

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-xs hover:shadow-md ${
                    isSelected
                      ? "ring-2 ring-brand-navy border-brand-navy"
                      : isUnread
                      ? "border-amber-300/80 bg-gradient-to-r from-amber-50/25 to-white"
                      : isHandled
                      ? "border-emerald-200/80 bg-white"
                      : "border-slate-200/80 bg-white"
                  }`}
                >
                  {/* Top Bar: Sender Info, Avatar, Status, Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox for Bulk Selection */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(msg.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-navy focus:ring-brand-navy/30 cursor-pointer shrink-0"
                        title="Select message"
                      />

                      {/* Avatar */}
                      <div
                        className={`h-9 w-9 sm:h-10 sm:scale-100 rounded-full bg-gradient-to-br ${avatarColor} text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        {avatarInitials}
                      </div>

                      {/* Name & Email */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                            {msg.name}
                          </span>
                          {isUnread && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wide bg-amber-500 text-white shrink-0">
                              New
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-none">
                            {msg.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.email, `email-${msg.id}`)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                            title="Copy customer email"
                          >
                            {copiedKey === `email-${msg.id}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Timestamp */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs shrink-0 pl-11 sm:pl-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                          isUnread
                            ? "bg-amber-100 text-amber-900 border border-amber-300/60"
                            : isHandled
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300/60"
                            : "bg-sky-100 text-sky-900 border border-sky-300/60"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isUnread
                              ? "bg-amber-500 animate-pulse"
                              : isHandled
                              ? "bg-emerald-500"
                              : "bg-sky-500"
                          }`}
                        />
                        {msg.status}
                      </span>

                      <span
                        title={formatFullDate(msg.createdAt)}
                        className="text-[11px] font-medium text-slate-500 flex items-center gap-1 cursor-default"
                      >
                        <Clock className="h-3 w-3 text-slate-400" />
                        {formatRelativeTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Subject & Message Content */}
                  <div className="pt-3.5 pb-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                      <span>{msg.subject || "General Inquiry"}</span>
                    </h4>

                    <div className="relative group/msg">
                      <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 font-normal">
                        {msg.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.message, `msg-${msg.id}`)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 border border-slate-200 text-slate-500 hover:text-slate-800 opacity-0 group-hover/msg:opacity-100 transition-opacity cursor-pointer shadow-2xs"
                        title="Copy message content"
                      >
                        {copiedKey === `msg-${msg.id}` ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Technical Info (Audit, IP, User Agent) */}
                  <div className="pt-1 pb-2">
                    <button
                      type="button"
                      onClick={() => toggleDetails(msg.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                    >
                      <Info className="h-3 w-3 text-slate-400" />
                      <span>{isExpanded ? "Hide technical audit" : "Show technical audit"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/70 text-[10px] text-slate-600 space-y-1 font-mono overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                            <span className="font-bold">SHA-256 IP Hash:</span>
                            <span className="break-all">{msg.ipHash || "N/A"}</span>
                          </div>
                          <div className="truncate">
                            <span className="font-bold">Device / User Agent:</span>{" "}
                            {msg.userAgent || "Unknown"}
                          </div>
                          <div>
                            <span className="font-bold">Submitted At:</span>{" "}
                            {formatFullDate(msg.createdAt)} ({msg.createdAt})
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom Action Bar (Ergonomic, Touch-friendly on mobile) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Primary Reply Button */}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                          msg.subject || "Inquiry"
                        )} - Laptop Point BD`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 min-h-[36px]"
                      >
                        <Send className="h-3.5 w-3.5 text-[#57BA47]" />
                        <span>Reply Email</span>
                      </a>

                      {/* Mark Handled Button */}
                      {msg.status !== "handled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(msg.id, "handled")}
                          className="h-9 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 border-emerald-200 cursor-pointer"
                        >
                          <CheckCheck className="h-3.5 w-3.5 mr-1" />
                          Mark Handled
                        </Button>
                      )}

                      {/* Mark Read Button */}
                      {msg.status === "unread" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(msg.id, "read")}
                          className="h-9 px-3 text-xs font-bold text-sky-700 hover:bg-sky-50 hover:text-sky-800 border-sky-200 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Mark Read
                        </Button>
                      )}

                      {/* Mark Unread Button */}
                      {msg.status !== "unread" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(msg.id, "unread")}
                          className="h-9 px-2.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                        >
                          Mark Unread
                        </Button>
                      )}
                    </div>

                    {/* Delete Action with Safe Inline Confirmation */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {isConfirmingDelete ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200"
                        >
                          <span className="text-[11px] font-bold text-rose-800 px-1.5">
                            Delete permanently?
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={() => handleDelete(msg.id)}
                            className="h-7 px-2.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 cursor-pointer"
                          >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-7 px-2 text-[11px] font-medium text-slate-600 hover:bg-white cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => setConfirmDeleteId(msg.id)}
                          className="h-9 px-2.5 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer rounded-xl"
                          title="Delete message"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredMessages.length)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredMessages.length}</span>{" "}
            inquiries
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-8 px-2.5 rounded-xl border-slate-200 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>

            <span className="px-3 py-1 font-bold text-slate-800 bg-slate-100 rounded-xl">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-8 px-2.5 rounded-xl border-slate-200 cursor-pointer disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
