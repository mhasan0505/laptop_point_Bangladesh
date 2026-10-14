"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SectionCard } from "@/components/admin/ui/SectionCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface PreviewItem {
  type: "product" | "variant";
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  options: string;
  oldPrice: number | null;
  newPrice: number | null;
  oldRegularPrice: number | null;
  newRegularPrice: number | null;
  oldStock: number;
  newStock: number;
  status: "changed" | "unchanged" | "error";
  errors: string[];
}

interface PreviewSummary {
  total: number;
  changed: number;
  unchanged: number;
  errors: number;
}

export default function BulkPricesPage() {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [previewSummary, setPreviewSummary] = useState<PreviewSummary | null>(null);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "changed" | "errors">("all");
  const [confirmApplyOpen, setConfirmApplyOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewSummary(null);
      setPreviewItems([]);
    }
  };

  const handleUploadPreview = async () => {
    if (!selectedFile) return;
    setIsPreviewing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", "preview");

      const res = await fetch("/api/admin/products/bulk-prices?action=preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse spreadsheet");
      }

      setPreviewSummary(data.summary);
      setPreviewItems(data.items || []);
      showSuccessToast(
        `Preview generated: ${data.summary.changed} change(s), ${data.summary.errors} error(s)`
      );
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Failed to preview file");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedFile) return;
    setIsApplying(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("action", "apply");

      const res = await fetch("/api/admin/products/bulk-prices?action=apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply price updates");
      }

      showSuccessToast(
        data.message || "Bulk prices and inventory updated successfully!"
      );

      // Refresh preview to show updated state
      setSelectedFile(null);
      setPreviewSummary(null);
      setPreviewItems([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Failed to apply updates");
    } finally {
      setIsApplying(false);
      setConfirmApplyOpen(false);
    }
  };

  const filteredItems = previewItems.filter((item) => {
    if (filterTab === "changed") return item.status === "changed";
    if (filterTab === "errors") return item.status === "error";
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-sm border-border">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Bulk Price & Stock Editor
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Export your entire product and variant catalog to CSV/XLSX, update pricing and stock offline, and re-import with safe transactional preview.
          </p>
        </div>
      </div>

      {/* Step 1: Export Card */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <span>Step 1: Export Catalog</span>
          </div>
        }
        description="Download your catalog spreadsheet with all current product and variant SKUs, prices, regular prices, and stock counts."
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground max-w-xl">
            The exported file includes exact columns: <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">Product ID</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">Variant ID</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">SKU</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">Name</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">Price</code>, <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">Regular Price</code>, and <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">Stock</code>.
          </p>
          <div className="flex items-center gap-2">
            <a href="/api/admin/products/bulk-prices?format=csv" download="product-prices.csv">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Download CSV
              </Button>
            </a>
            <a href="/api/admin/products/bulk-prices?format=xlsx" download="product-prices.xlsx">
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Download Excel (XLSX)
              </Button>
            </a>
          </div>
        </div>
      </SectionCard>

      {/* Step 2: Import Card */}
      <SectionCard
        title={
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" />
            <span>Step 2: Upload Edited Spreadsheet</span>
          </div>
        }
        description="Upload your modified file. The system will match items by ID then SKU and show a complete before-and-after diff before applying."
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-border file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80 text-muted-foreground cursor-pointer"
            />
            {selectedFile && (
              <Button
                onClick={handleUploadPreview}
                disabled={isPreviewing}
                size="sm"
                className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground"
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing File...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Inspect & Preview Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Step 3: Diff Preview Table */}
      {previewSummary && (
        <SectionCard
          title={
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-primary" />
              <span>Step 3: Preview Changes & Audit</span>
            </div>
          }
          description="Review the detected changes and any errors before applying."
          actions={
            previewSummary.changed > 0 &&
            previewSummary.errors === 0 && (
              <Button
                onClick={() => setConfirmApplyOpen(true)}
                disabled={isApplying}
                className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Apply {previewSummary.changed} Updates
                  </>
                )}
              </Button>
            )
          }
        >
          <div className="space-y-4">
            {/* KPI Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Rows</span>
                <p className="text-lg font-bold text-foreground mt-0.5">{previewSummary.total}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Changes Detected</span>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">{previewSummary.changed}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Unchanged Rows</span>
                <p className="text-lg font-bold text-foreground mt-0.5">{previewSummary.unchanged}</p>
              </div>
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-[10px] font-bold text-red-600 uppercase">Errors / Unmatched</span>
                <p className="text-lg font-bold text-red-600 mt-0.5">{previewSummary.errors}</p>
              </div>
            </div>

            {previewSummary.errors > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  The upload contains {previewSummary.errors} error(s) or unmatched row(s). You must fix all errors in your file before updates can be applied.
                </span>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 text-xs">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterTab === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({previewItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("changed")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterTab === "changed"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Changes Only ({previewSummary.changed})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("errors")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterTab === "errors"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Errors Only ({previewSummary.errors})
              </button>
            </div>

            {/* Diff Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Price (Old → New)</th>
                    <th className="py-2.5 px-3">Reg. Price (Old → New)</th>
                    <th className="py-2.5 px-3">Stock (Old → New)</th>
                    <th className="py-2.5 px-3">Notes / Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-background">
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-muted/20 transition-colors ${
                        item.status === "error"
                          ? "bg-red-50/40 dark:bg-red-950/20"
                          : item.status === "changed"
                            ? "bg-emerald-50/30 dark:bg-emerald-950/10"
                            : ""
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        {item.status === "changed" ? (
                          <StatusBadge status="active">Changed</StatusBadge>
                        ) : item.status === "error" ? (
                          <StatusBadge status="danger">Error</StatusBadge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Unchanged</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                        {item.sku}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground max-w-xs truncate">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.oldPrice !== item.newPrice ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-muted-foreground line-through text-[11px]">
                              {item.oldPrice !== null ? `৳${item.oldPrice}` : "Call"}
                            </span>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">
                              {item.newPrice !== null ? `৳${item.newPrice}` : "Call"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-medium">
                            {item.oldPrice !== null ? `৳${item.oldPrice}` : "Call"}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.oldRegularPrice !== item.newRegularPrice ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-muted-foreground line-through text-[11px]">
                              {item.oldRegularPrice !== null ? `৳${item.oldRegularPrice}` : "None"}
                            </span>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">
                              {item.newRegularPrice !== null ? `৳${item.newRegularPrice}` : "None"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-medium">
                            {item.oldRegularPrice !== null ? `৳${item.oldRegularPrice}` : "—"}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.oldStock !== item.newStock ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-muted-foreground line-through text-[11px]">
                              {item.oldStock}
                            </span>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">{item.newStock}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-medium">{item.oldStock}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs">
                        {item.errors.length > 0 ? (
                          <span className="text-red-500 font-medium">
                            {item.errors.join("; ")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Confirm Apply Dialog */}
      <ConfirmDialog
        open={confirmApplyOpen}
        onOpenChange={setConfirmApplyOpen}
        title="Apply Bulk Price & Stock Updates?"
        description={`This action will update ${previewSummary?.changed} product/variant price and stock record(s) in a single database transaction. This change will be immediately live on the storefront.`}
        confirmText="Confirm & Apply All Changes"
        variant="default"
        onConfirm={handleApplyChanges}
      />
    </div>
  );
}
