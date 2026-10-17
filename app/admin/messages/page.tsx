"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import {
  Mail,
  Search,
  Clock,
  Trash2,
  Loader2,
  RefreshCw,
  Inbox,
  CheckCheck,
  Send,
  Eye,
  ShieldAlert,
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

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "handled">("all");
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const fetchMessages = useCallback(async () => {
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
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err: unknown) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [showErrorToast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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

      // Recompute unread count
      setMessages((current) => {
        const updated = current.map((m) => (m.id === id ? { ...m, status: newStatus } : m));
        setUnreadCount(updated.filter((m) => m.status === "unread").length);
        return updated;
      });

      showSuccessToast(`Message marked as ${newStatus}`);
    } catch (err: unknown) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer message?")) return;

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
      setUnreadCount((prev) => Math.max(0, prev - (messages.find((m) => m.id === id)?.status === "unread" ? 1 : 0)));
      showSuccessToast("Message deleted successfully");
    } catch (err: unknown) {
      console.error(err);
      showErrorToast(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setDeletingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // Status filter
      if (statusFilter !== "all" && m.status !== statusFilter) {
        return false;
      }

      // Keyword search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q) ||
          m.ipHash.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [messages, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === "unread").length;
    const read = messages.filter((m) => m.status === "read").length;
    const handled = messages.filter((m) => m.status === "handled").length;
    return { total, unread, read, handled };
  }, [messages]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-[#57BA47]" />
            Customer Messages
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Incoming inquiries from the public contact form and newsletter leads
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
          disabled={isLoading}
          className="self-start sm:self-auto gap-1.5 text-xs font-semibold rounded-xl border-gray-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Inbox className="h-3.5 w-3.5" /> Total
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Unread
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.unread}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Read
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats.read}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" /> Handled
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.handled}</div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, subject, text, or IP hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#57BA47]/20 focus:border-[#57BA47] transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl self-start md:self-auto overflow-x-auto">
          {(["all", "unread", "read", "handled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-muted-foreground hover:text-gray-900"
              }`}
            >
              {status}
              {status === "unread" && stats.unread > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full">
                  {stats.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#57BA47] mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading customer messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
            <Inbox className="h-10 w-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No Messages Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchTerm
                ? "No contact submissions match your search query."
                : statusFilter !== "all"
                ? `No messages currently marked as '${statusFilter}'.`
                : "The customer message inbox is clean. New inquiries will appear here."}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUnread = msg.status === "unread";
            const isHandled = msg.status === "handled";
            const isUpdating = Boolean(updatingIds[msg.id]);
            const isDeleting = Boolean(deletingIds[msg.id]);

            return (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  isUnread
                    ? "border-amber-200 bg-amber-50/15"
                    : isHandled
                    ? "border-emerald-100"
                    : "border-gray-100"
                }`}
              >
                {/* Top Row: Sender Info & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        isUnread
                          ? "bg-amber-500 animate-pulse"
                          : isHandled
                          ? "bg-emerald-500"
                          : "bg-blue-400"
                      }`}
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        &lt;{msg.email}&gt;
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[10px] ${
                        isUnread
                          ? "bg-amber-100 text-amber-800"
                          : isHandled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {msg.status}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Subject & Message Content */}
                <div className="pt-3 pb-3">
                  <h4 className="text-sm font-extrabold text-gray-900 mb-1.5 flex items-center gap-1.5">
                    {msg.subject}
                  </h4>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                    {msg.message}
                  </p>
                </div>

                {/* Bottom Row: Metadata & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-muted-foreground">
                  {/* IP Hash & UA info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      title={`Full SHA-256 IP Hash: ${msg.ipHash}`}
                      className="inline-flex items-center gap-1 font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded"
                    >
                      <ShieldAlert className="h-3 w-3 text-gray-500" />
                      IP: {msg.ipHash.slice(0, 12)}...
                    </span>
                    <span
                      title={msg.userAgent}
                      className="truncate max-w-[220px] text-gray-400 text-[10px]"
                    >
                      UA: {msg.userAgent}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                        msg.subject
                      )} - Laptop Point BD`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Send className="h-3 w-3" /> Reply
                    </a>

                    {msg.status !== "handled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(msg.id, "handled")}
                        className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 h-8 px-2.5"
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                        Mark Handled
                      </Button>
                    )}

                    {msg.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(msg.id, "read")}
                        className="text-xs font-bold text-blue-700 hover:bg-blue-50 h-8 px-2.5"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Mark Read
                      </Button>
                    )}

                    {msg.status !== "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(msg.id, "unread")}
                        className="text-xs font-bold text-amber-700 hover:bg-amber-50 h-8 px-2.5"
                      >
                        Mark Unread
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => handleDelete(msg.id)}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 h-8 px-2"
                      title="Delete message"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
