"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { OrderDocumentDialog, DocumentOrderData } from "@/components/admin/OrderDocumentDialog";
import { OrderCreateDialog } from "@/components/admin/OrderCreateDialog";
import { GreetingBar } from "@/components/admin/dashboard/GreetingBar";
import { KpiCards } from "@/components/admin/dashboard/KpiCards";
import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import { AttentionSection } from "@/components/admin/dashboard/AttentionSection";
import { OrderPipeline } from "@/components/admin/dashboard/OrderPipeline";
import { PerformanceColumns } from "@/components/admin/dashboard/PerformanceColumns";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { StorefrontNow } from "@/components/admin/dashboard/StorefrontNow";
import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";
import type { AdminDashboardData, DashboardOrder } from "@/lib/admin-dashboard";

interface CreateDialogProduct {
  id: string;
  sku: string;
  name: string;
  price: number | null;
  stock: number;
  variants?: Array<{
    id?: string;
    name?: string;
    label?: string;
    price?: number | null;
    sku?: string;
    stock?: number;
  }>;
}

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [selectedRange, setSelectedRange] = useState<number>(7);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Document modal state
  const [docOrder, setDocOrder] = useState<DocumentOrderData | null>(null);
  const [docTab, setDocTab] = useState<"invoice" | "challan">("invoice");
  const [docDialogOpen, setDocDialogOpen] = useState<boolean>(false);

  // Manual order creation modal state (products loaded lazily only when opened)
  const [orderCreateOpen, setOrderCreateOpen] = useState<boolean>(false);
  const [productsForDialog, setProductsForDialog] = useState<CreateDialogProduct[]>([]);

  // Manual refresh / retry handler
  const handleRefresh = useCallback(async () => {
    setDataLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `HTTP error ${res.status}`);
      }

      const data = (await res.json()) as AdminDashboardData;
      setDashboardData(data);
    } catch (err) {
      console.error("[Dashboard Load Error]:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard performance data from server."
      );
    } finally {
      setDataLoading(false);
    }
  }, [selectedRange]);

  // Initial and range-driven load without synchronous setState in effect body
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const executeFetch = async () => {
      try {
        const res = await fetch(`/api/admin/dashboard?range=${selectedRange}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody.error || `HTTP error ${res.status}`);
        }
        const data = (await res.json()) as AdminDashboardData;
        if (!cancelled) {
          setDashboardData(data);
          setErrorMessage(null);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error ? err.message : "Unable to load dashboard performance data from server."
          );
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    executeFetch();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, selectedRange]);

  // Authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Open invoice / challan preview
  const handleOpenDocument = (order: DashboardOrder, tab: "invoice" | "challan") => {
    setDocOrder({
      dbId: order.id,
      id: order.orderNumber,
      customer: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      address: order.address,
      city: null,
      district: null,
      postalCode: null,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId || "",
        sku: it.sku || "BLG-SKU",
        name: it.name,
        variantLabel: it.variantLabel || undefined,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
      })),
    });
    setDocTab(tab);
    setDocDialogOpen(true);
  };

  // Open manual order creation modal (lazy loads products only when opened)
  const handleOpenNewOrder = async () => {
    setOrderCreateOpen(true);
    if (productsForDialog.length === 0) {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const list = await res.json();
          setProductsForDialog(list);
        }
      } catch (err) {
        console.error("Failed to fetch products for order modal:", err);
      }
    }
  };

  // Handle sales chart range change
  const handleRangeChange = (newRange: number) => {
    setSelectedRange(newRange);
  };

  if (authLoading || (!isAuthenticated && typeof window !== "undefined")) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-xs font-semibold text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Inline Error State with Retry (No toasts, no retry loops) ─── */}
      {errorMessage && (
        <div className="rounded-xl border border-danger/40 bg-danger-soft p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <h2 className="text-base font-bold text-foreground">
            Could not load dashboard data
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {errorMessage}
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2 border-danger/40 text-foreground hover:bg-danger-soft"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Connection
          </Button>
        </div>
      )}

      {/* ─── Skeleton Loading State ─── */}
      {dataLoading && !dashboardData && <DashboardSkeleton />}

      {/* ─── Active Dashboard Content ─── */}
      {dashboardData && (
        <>
          {/* 1. Greeting Bar */}
          <GreetingBar
            userName="Administrator"
            currentTimeDhaka={dashboardData.currentTimeDhaka}
            pendingOrdersCount={dashboardData.pipeline.pending}
            onNewOrder={handleOpenNewOrder}
          />

          {/* 2. Four KPI Cards */}
          <KpiCards
            today={dashboardData.today}
            yesterday={dashboardData.yesterday}
            sparklines={dashboardData.sparklines}
          />

          {/* 3. Sales Chart (Dual axis Area + Line with 7/30/90D toggle) */}
          <SalesChart
            data={dashboardData.salesSeries}
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
            isLoading={dataLoading}
          />

          {/* 4. Needs Your Attention Tiles (Shown only when count > 0; calm all-clear otherwise) */}
          <AttentionSection items={dashboardData.attentionItems} />

          {/* 5. Order Pipeline Segmented Bar */}
          <OrderPipeline pipeline={dashboardData.pipeline} />

          {/* 6. Two Columns: Best Sellers & Brand Revenue Distribution */}
          <PerformanceColumns
            topProducts={dashboardData.topProductsMonth}
            brandRevenue={dashboardData.brandRevenueMonth}
          />

          {/* 7. Recent Orders (Compact rows, status badges, invoice & challan) */}
          <RecentOrdersTable
            orders={dashboardData.latestOrders}
            onOpenDocument={handleOpenDocument}
          />

          {/* 8. Storefront Now (Live hero banner & active Power Deal with live countdown) */}
          <StorefrontNow data={dashboardData.storefrontNow} />

          {/* Phase5Placeholder: reserved slot for Phase 5 store traffic & ad attribution cards (code comment only) */}

          {/* Invoice & Challan Document Dialog (Preserved) */}
          <OrderDocumentDialog
            isOpen={docDialogOpen}
            onClose={() => setDocDialogOpen(false)}
            order={docOrder}
            initialTab={docTab}
          />

          {/* Create Manual Order Dialog */}
          <OrderCreateDialog
            isOpen={orderCreateOpen}
            onClose={() => setOrderCreateOpen(false)}
            products={productsForDialog}
            onSuccess={() => {
              handleRefresh();
            }}
          />
        </>
      )}
    </div>
  );
}
