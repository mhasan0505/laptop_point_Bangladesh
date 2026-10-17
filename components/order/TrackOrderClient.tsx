"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Package,
  Search,
  CheckCircle2,
  Truck,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Phone,
  MessageSquare,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface StatusHistoryItem {
  status: string;
  createdAt: string;
}

interface TrackedOrder {
  orderNumber: string;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  trackingNumber: string | null;
  statusHistory: StatusHistoryItem[];
}

export default function TrackOrderClient({
  contactInfo,
}: {
  contactInfo?: {
    hotline: string;
    whatsapp: string;
  };
}) {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please provide both your Order Number and Phone Number.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
          _hp: "",
          _t: mountedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to find order.");
      }

      setOrder(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to track order.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const getStepIndex = (status: string): number => {
    const s = status.toLowerCase();
    if (s === "pending") return 1;
    if (s === "confirmed" || s === "processing") return 2;
    if (s === "shipped") return 3;
    if (s === "delivered" || s === "completed") return 4;
    return 1;
  };

  const isCancelled = order?.status.toLowerCase() === "cancelled" || order?.status.toLowerCase() === "returned";
  const currentStep = order ? getStepIndex(order.status) : 1;

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-[80vh] bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-4 shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
            Check the real-time shipping and delivery status of your Laptop Point BD order.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            {/* Honeypot field */}
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="orderNumberInput"
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                >
                  Order Number
                </label>
                <input
                  id="orderNumberInput"
                  type="text"
                  placeholder="e.g. ORD-12345678-999"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phoneInput"
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phoneInput"
                  type="tel"
                  placeholder="e.g. 01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-xs transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking Status...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Order
                </>
              )}
            </Button>
          </form>

          {/* Privacy Note */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Privacy Guarantee: Customer address, item contents, and pricing details are strictly hidden for your privacy.
            </span>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-4 flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">{error}</p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                Please ensure you entered the exact phone number and order number from your confirmation SMS or invoice.
              </p>
            </div>
          </div>
        )}

        {/* Order Result Card */}
        {order && (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  #{order.orderNumber}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    isCancelled
                      ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                      : order.status === "Delivered"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                  }`}
                >
                  Status: {order.status}
                </span>
              </div>
            </div>

            {/* Courier Tracking Number if available */}
            {order.trackingNumber && (
              <div className="my-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Courier Tracking Code
                    </p>
                    <p className="text-sm font-mono font-bold text-blue-950 dark:text-blue-100">
                      {order.trackingNumber}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTracking(order.trackingNumber!)}
                  className="h-8 text-xs gap-1.5 border-blue-300 dark:border-blue-800"
                >
                  {copiedTracking ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress Stepper (Only for active flows) */}
            {isCancelled ? (
              <div className="my-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-900 dark:text-red-200">
                    This order was {order.status}.
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                    For questions regarding cancellation or replacement, please contact our support team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-8">
                <div className="grid grid-cols-4 gap-2 text-center relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
                  <div
                    className="absolute top-4 left-[12.5%] h-0.5 bg-blue-600 transition-all duration-500 -z-0"
                    style={{
                      width:
                        currentStep === 1
                          ? "0%"
                          : currentStep === 2
                          ? "33%"
                          : currentStep === 3
                          ? "66%"
                          : "75%",
                    }}
                  />

                  {/* Step 1: Placed */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        currentStep >= 1
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground mt-2">Placed</span>
                  </div>

                  {/* Step 2: Confirmed */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        currentStep >= 2
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                      }`}
                    >
                      {currentStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-foreground mt-2">Confirmed</span>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        currentStep >= 3
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground mt-2">Shipped</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        currentStep >= 4
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-foreground mt-2">Delivered</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4">
                  Activity Timeline
                </h3>
                <div className="space-y-3">
                  {order.statusHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1 flex justify-between gap-4">
                        <span className="font-semibold text-foreground">
                          Status marked as {item.status}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Support Card */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-bold text-foreground">Need help with your shipment?</p>
            <p className="text-muted-foreground mt-0.5">
              Contact our delivery team directly for urgent updates or address modifications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {contactInfo?.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp
                </Button>
              </a>
            )}
            {contactInfo?.hotline && (
              <a href={`tel:${contactInfo.hotline.replace(/[^0-9+]/g, "")}`}>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  Call Support
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
