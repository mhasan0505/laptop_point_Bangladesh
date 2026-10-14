"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { A4Invoice } from "@/components/invoice/a4-invoice";
import { A4Challan } from "@/components/challan/a4-challan";
import { computeOrderDocumentDetails } from "@/lib/order-document-helper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Printer, Truck } from "lucide-react";
import Link from "next/link";

interface ApiOrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  variantOptions?: Array<{ name?: string; price?: number; sku?: string }>;
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string | null;
  notes: string | null;
  createdAt: string;
  items: ApiOrderItem[];
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
  "Verify device condition, packaging seals, and included accessories upon courier delivery.",
  "Discrepancies or shipping damage must be notified to Laptop Point BD within 24 hours.",
  "Acknowledgment of delivery signifies receipt in complete and good working condition.",
];

export default function OrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "challan" ? "challan" : "invoice";

  const [docType, setDocType] = useState<"invoice" | "challan">(initialType);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      setIsUnauthorized(false);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        if (res.status === 401) {
          setIsUnauthorized(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order for print:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary mx-auto" />
          <p className="text-xs text-muted-foreground font-semibold">Generating document preview...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-6">
        <div className="bg-card border border-border p-8 rounded-lg text-center max-w-sm shadow-sm">
          <p className="text-base font-bold text-foreground mb-2">Session expired — log in again</p>
          <p className="text-xs text-muted-foreground mb-4">
            Your admin session has ended. Please sign in to view and print order #{id}.
          </p>
          <Link href="/admin/login">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              Log In to Admin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-6">
        <div className="bg-card border border-border p-8 rounded-lg text-center max-w-sm">
          <p className="text-base font-bold text-foreground mb-2">Order Not Found</p>
          <p className="text-xs text-muted-foreground mb-4">
            Could not find order #{id} to generate invoice or challan.
          </p>
          <Link href="/admin/orders">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <ArrowLeft size={14} /> Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const safePaymentMethod = order.paymentMethod ?? "cod";
  const docDetails = computeOrderDocumentDetails({
    status: order.status,
    paymentMethod: safePaymentMethod,
    totalAmount: order.totalAmount,
    notes: order.notes,
    createdAt: order.createdAt,
  });

  const fullAddress =
    [order.address, order.city, order.district, order.postalCode]
      .filter(Boolean)
      .join(", ") || "Dhaka, Bangladesh";

  const invoiceLines = (order.items || []).map((item, idx) => ({
    id: item.id || `line-${idx}`,
    description: item.name,
    code: item.sku || undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: 0,
    total: item.unitPrice * item.quantity,
    specs: item.variantOptions?.map((v) => v.name).filter(Boolean) as string[],
  }));

  const challanLines = (order.items || []).map((item, idx) => ({
    id: item.id || `challan-line-${idx}`,
    description: item.name,
    code: item.sku || undefined,
    quantity: item.quantity,
    specs: item.variantOptions?.map((v) => v.name).filter(Boolean) as string[],
  }));

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-foreground">
      {/* Top sticky action bar - hidden during print */}
      <div className="no-print sticky top-0 z-50 bg-card border-b border-border shadow-xs px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
                <ArrowLeft size={13} />
                Orders
              </Button>
            </Link>

            <div className="flex items-center gap-1 p-1 bg-muted rounded-md border border-border">
              <button
                type="button"
                onClick={() => setDocType("invoice")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  docType === "invoice"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText size={13} />
                Sales Invoice
              </button>

              <button
                type="button"
                onClick={() => setDocType("challan")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  docType === "challan"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Truck size={13} />
                Delivery Challan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-muted-foreground">
              #{order.orderNumber || order.id}
            </span>

            <Button
              size="sm"
              onClick={() => window.print()}
              className="h-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 gap-1.5 shadow-xs"
            >
              <Printer size={14} />
              Print Document
            </Button>
          </div>
        </div>
      </div>

      {/* Document View */}
      <div className="p-4 sm:p-8 print:p-0">
        <div className="mx-auto max-w-[210mm] bg-white rounded-xs shadow-xl print:shadow-none print:m-0 print:p-0">
          {docType === "invoice" ? (
            <A4Invoice
              invoiceType={docDetails.invoiceType}
              invoiceNumber={order.orderNumber || order.id}
              invoiceDate={order.createdAt || new Date().toISOString()}
              seller={SELLER_INFO}
              billToLabel="CUSTOMER"
              billTo={{
                name: order.customerName,
                phone: `Phone: ${order.customerPhone}`,
                email: order.customerEmail,
                address: fullAddress,
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
              invoiceNumber={order.orderNumber || order.id}
              invoiceDate={order.createdAt || new Date().toISOString()}
              seller={SELLER_INFO}
              billToLabel="CUSTOMER"
              billTo={{
                name: order.customerName,
                phone: `Phone: ${order.customerPhone}`,
                email: order.customerEmail,
                address: fullAddress,
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
