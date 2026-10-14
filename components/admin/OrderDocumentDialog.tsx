"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { A4Invoice } from "@/components/invoice/a4-invoice";
import { A4Challan } from "@/components/challan/a4-challan";
import { computeOrderDocumentDetails } from "@/lib/order-document-helper";
import { ArrowLeft, ExternalLink, FileText, Printer, Truck, X } from "lucide-react";

export interface DocumentOrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  variantOptions?: Array<{
    name?: string;
    price?: number;
    originalPrice?: number;
    sku?: string;
  }>;
}

export interface DocumentOrderData {
  dbId: string;
  id: string; // Order Number, e.g. BLG-413372 or SAL-MTIPZLLB
  customer: string;
  customerPhone: string;
  customerEmail?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  postalCode?: string | null;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  items: DocumentOrderItem[];
}

interface OrderDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: DocumentOrderData | null;
  initialTab?: "invoice" | "challan";
}

const SELLER_INFO = {
  name: "Laptop Point BD",
  slogan: "Precision Flagship Laptops & Peripherals",
  phone: "+880 1612-182408 | +880 1830-515157",
  email: "info@laptoppointbd.com",
  address: "Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216",
  website: "https://laptoppointbd.com",
};

const INVOICE_TERMS = [
  "Parts Replacement Guarantee: 30 days (excluding display and keyboard), with up to 2 hours battery backup",
  "Service Warranty: 5 years (service only; no parts/ display/ keyboard)",
  "Warranty: No warranty will be provided in cases of physical damage, breakage, burn damage, liquid damage, or if the warranty sticker is removed.",
  "Policy: Sold goods are non refundable",
  "Laptop Point BD Service Center: 01830515157 | Inspection: Minimum 1 working day | Repair: Time required may vary based on the issue.",
];

const CHALLAN_TERMS = [
  "Please inspect package seal, contents, and device condition upon delivery.",
  "Any discrepancy or transit damage must be reported within 24 hours of receipt.",
  "Goods received in good and satisfactory condition.",
];

export function OrderDocumentDialog({
  isOpen,
  onClose,
  order,
  initialTab = "invoice",
}: OrderDocumentDialogProps) {
  if (!isOpen || !order) return null;

  return (
    <OrderDocumentDialogModal
      key={`${order.id}-${initialTab}`}
      onClose={onClose}
      order={order}
      initialTab={initialTab}
    />
  );
}

function OrderDocumentDialogModal({
  onClose,
  order,
  initialTab,
}: {
  onClose: () => void;
  order: DocumentOrderData;
  initialTab: "invoice" | "challan";
}) {
  const [activeTab, setActiveTab] = useState<"invoice" | "challan">(initialTab);

  useEffect(() => {
    // Lock background scrolling while full-page invoice is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const fullAddress =
    [order.address, order.city, order.district, order.postalCode]
      .filter(Boolean)
      .join(", ") || "Mirpur 10";

  const invoiceLines = order.items.map((item, idx) => {
    const specs = item.variantLabel
      ? [item.variantLabel]
      : item.variantOptions && item.variantOptions.length > 0
      ? (item.variantOptions.map((v) => v.name).filter(Boolean) as string[])
      : undefined;

    return {
      id: item.id || `line-${idx}`,
      description: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
      code: item.sku || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: 0,
      total: item.unitPrice * item.quantity,
      specs,
    };
  });

  const challanLines = order.items.map((item, idx) => {
    const specs = item.variantLabel
      ? [item.variantLabel]
      : item.variantOptions && item.variantOptions.length > 0
      ? (item.variantOptions.map((v) => v.name).filter(Boolean) as string[])
      : undefined;

    return {
      id: item.id || `challan-line-${idx}`,
      description: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
      code: item.sku || undefined,
      quantity: item.quantity,
      specs,
    };
  });

  const safePaymentMethod = order.paymentMethod ?? "cod";
  const docDetails = computeOrderDocumentDetails({
    status: order.status,
    paymentMethod: safePaymentMethod,
    totalAmount: order.totalAmount,
    notes: order.notes,
    createdAt: order.createdAt,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleOpenStandalone = () => {
    window.open(
      `/admin/orders/${encodeURIComponent(order.dbId || order.id)}/print?type=${activeTab}`,
      "_blank",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-y-auto">
      {/* Top Sticky Header (Hidden during browser print) */}
      <div className="no-print sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-border shadow-xs px-4 sm:px-8 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back button & Tabs */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-8 text-xs font-semibold px-2.5 gap-1.5 border-border hover:bg-muted"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Orders</span>
            </Button>

            <div className="flex items-center gap-1 p-1 bg-muted rounded-md border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("invoice")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "invoice"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText size={13} />
                Sales Invoice
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("challan")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "challan"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Truck size={13} />
                Delivery Challan
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-mono font-bold text-foreground">#{order.id}</span>
              <span>· {order.customer}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenStandalone}
              title="Open document in a new browser tab"
              className="h-8 text-xs font-semibold px-2.5 gap-1.5 border-border"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">New Tab</span>
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 gap-1.5 shadow-xs"
            >
              <Printer size={13} />
              Print {activeTab === "invoice" ? "Invoice" : "Challan"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
              title="Close (Esc)"
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Full Page Canvas Container */}
      <div className="w-full flex-1 py-8 px-4 sm:px-6 flex justify-center bg-zinc-200/80 dark:bg-zinc-950/80 print:p-0 print:bg-white">
        <div className="w-full max-w-[210mm] bg-white rounded-xs shadow-2xl print:shadow-none print:m-0 print:p-0">
          {activeTab === "invoice" ? (
            <A4Invoice
              invoiceType={docDetails.invoiceType}
              invoiceNumber={order.id}
              invoiceDate={order.createdAt || new Date().toISOString()}
              seller={SELLER_INFO}
              billToLabel="CUSTOMER"
              billTo={{
                name: order.customer,
                address: fullAddress,
                phone: `Phone: ${order.customerPhone}`,
                email: order.customerEmail || null,
              }}
              secondaryLabel="CASHIER"
              secondaryValue="System Admin"
              lines={invoiceLines}
              subtotal={order.subtotal || order.totalAmount}
              shippingCost={order.shippingCost}
              grandTotal={order.totalAmount}
              paidAmount={docDetails.paidAmount}
              balanceDue={docDetails.balanceDue}
              previousDue={0}
              newBalance={docDetails.balanceDue}
              payments={docDetails.payments}
              notes={docDetails.displayNotes}
              terms={INVOICE_TERMS}
              footerText="LAPTOP POINT BD, © 2026"
            />
          ) : (
            <A4Challan
              challanTitle={docDetails.challanTitle}
              invoiceNumber={order.id}
              invoiceDate={order.createdAt || new Date().toISOString()}
              seller={SELLER_INFO}
              billToLabel="CUSTOMER"
              billTo={{
                name: order.customer,
                address: fullAddress,
                phone: `Phone: ${order.customerPhone}`,
                email: order.customerEmail || null,
              }}
              secondaryLabel="CASHIER"
              secondaryValue="System Admin"
              lines={challanLines}
              notes={docDetails.displayNotes}
              terms={CHALLAN_TERMS}
              footerText="LAPTOP POINT BD, © 2026"
            />
          )}
        </div>
      </div>
    </div>
  );
}
