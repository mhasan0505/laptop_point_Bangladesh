"use client";

import * as React from "react";
import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  FormField,
  Tabs,
  SaveBar,
  ConfirmDialog,
  DataTable,
  Column,
} from "@/components/admin/ui";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Sun,
  Moon,
  Columns,
  Trash2,
  Plus,
} from "lucide-react";

interface SampleRow {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
}

const sampleData: SampleRow[] = [
  { id: "1", name: "ThinkPad X1 Carbon Gen 11", sku: "TP-X1-001", price: 215000, stock: 12, status: "Active" },
  { id: "2", name: "MacBook Pro 14 M3", sku: "MBP-14-002", price: 285000, stock: 4, status: "Low Stock" },
  { id: "3", name: "Dell XPS 15 9530", sku: "XPS-15-003", price: 245000, stock: 0, status: "Out of Stock" },
  { id: "4", name: "Asus ROG Zephyrus G14", sku: "ROG-G14-004", price: 198000, stock: 18, status: "Active" },
  { id: "5", name: "HP Spectre x360", sku: "HPS-13-005", price: 175000, stock: 0, status: "Draft" },
];

const sampleColumns: Column<SampleRow>[] = [
  {
    key: "name",
    header: "Product Name",
    sortable: true,
    render: (row) => row.name,
  },
  {
    key: "sku",
    header: "SKU",
    render: (row) => row.sku,
  },
  {
    key: "price",
    header: "Price",
    sortable: true,
    render: (row) => `৳${row.price.toLocaleString("en-BD")}`,
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
];

export default function AdminUiCatalogPage() {
  const [themeMode, setThemeMode] = React.useState<"light" | "dark" | "both">("both");
  const [tabValue, setTabValue] = React.useState("badges");
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [saveDirty, setSaveDirty] = React.useState(true);

  const renderComponentShowcase = (isDark = false) => (
    <div
      className={`p-6 sm:p-8 rounded-2xl border transition-colors ${
        isDark
          ? "dark bg-[#0a0e17] text-neutral-100 border-neutral-800"
          : "bg-white text-neutral-900 border-neutral-200"
      }`}
    >
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isDark ? "Dark Mode Theme Preview" : "Light Mode Theme Preview"}
          </span>
          <h2 className="text-lg font-bold text-foreground">
            {isDark ? "Dark Palette Tokens" : "Light Palette Tokens"}
          </h2>
        </div>
        <span
          className={`px-2.5 py-1 text-xs rounded-full font-medium ${
            isDark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          {isDark ? "class='dark'" : "class='light'"}
        </span>
      </div>

      <div className="space-y-10">
        {/* 1. Page Header */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            1. Page Header Component
          </h3>
          <PageHeader
            title="Products Catalog"
            description="Manage your store's laptops, variant pricing, and inventory levels."
            breadcrumbs={[
              { label: "Admin", href: "/admin" },
              { label: "Products", href: "/admin/products" },
              { label: "All Items" },
            ]}
            actions={
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md shadow-sm hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            }
          />
        </section>

        {/* 2. Status Badges */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            2. Status Badges
          </h3>
          <div className="flex flex-wrap gap-2.5 items-center">
            <StatusBadge status="active" label="Active" />
            <StatusBadge status="in stock" label="In Stock" />
            <StatusBadge status="low stock" label="Low Stock" />
            <StatusBadge status="out of stock" label="Out of Stock" />
            <StatusBadge status="pending" label="Pending" />
            <StatusBadge status="draft" label="Draft" />
            <StatusBadge status="archived" label="Archived" />
            <StatusBadge status="failed" label="Failed" />
            <StatusBadge status="success" size="sm" label="Small Success" />
            <StatusBadge status="warning" size="lg" label="Large Warning" />
            <StatusBadge status="info" dot={false} label="No Dot Badge" />
          </div>
        </section>

        {/* 3. Stat Cards */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            3. Metric Stat Cards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gross Revenue"
              value="৳1,248,500"
              subtitle="Current month"
              icon={<DollarSign className="w-5 h-5" />}
              trend={{ value: "+14.2%", direction: "up" }}
              status="success"
            />
            <StatCard
              title="Active Orders"
              value="38"
              subtitle="Pending dispatch"
              icon={<ShoppingCart className="w-5 h-5" />}
              trend={{ value: "+6", direction: "up" }}
              status="info"
            />
            <StatCard
              title="Catalog Items"
              value="142"
              subtitle="Laptops listed"
              icon={<Package className="w-5 h-5" />}
              trend={{ value: "-2", direction: "down" }}
              status="warning"
            />
            <StatCard
              title="Admin Staff"
              value="4"
              subtitle="Active roles"
              icon={<Users className="w-5 h-5" />}
              status="default"
            />
          </div>
        </section>

        {/* 4. Section Cards */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            4. Section Card Containers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard
              title="Inventory Diagnostics"
              description="Real-time warehouse threshold alerts and reorder queues."
              actions={
                <div className="flex items-center gap-2">
                  <StatusBadge status="warning" label="Review Needed" size="sm" />
                  <button className="text-xs font-medium text-primary hover:underline">Export CSV</button>
                </div>
              }
              footer={<span className="text-xs text-muted-foreground">Updated 5 minutes ago</span>}
            >
              <p className="text-sm text-foreground/80">
                3 products are currently below their recommended minimum stock threshold. Restock notifications have been queued for dispatch.
              </p>
            </SectionCard>

            <SectionCard
              title="Background Worker Service"
              description="Scheduled cron tasks and maintenance routines."
              actions={<StatusBadge status="success" label="Healthy" size="sm" />}
            >
              <p className="text-sm text-foreground/80">
                Orphan uploads cleanup job runs daily at 3:00 AM UTC. Next scheduled execution in 9 hours.
              </p>
            </SectionCard>
          </div>
        </section>

        {/* 5. Form Fields */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            5. Form Field Inputs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Product Title" required hint="Public storefront display name">
              <input
                type="text"
                defaultValue="Lenovo ThinkPad X1 Carbon Gen 11"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>
            <FormField label="Category" required>
              <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Business Laptops</option>
                <option>Gaming Laptops</option>
                <option>Ultrabooks</option>
              </select>
            </FormField>
            <FormField label="Regular Price (BDT)" required error="Price must be greater than zero">
              <input
                type="number"
                defaultValue="0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-danger/60 bg-danger-soft/20 text-foreground focus:outline-none focus:ring-1 focus:ring-danger"
              />
            </FormField>
          </div>
        </section>

        {/* 6. Tabs */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            6. Navigation Tabs
          </h3>
          <Tabs
            tabs={[
              { id: "all", label: "All Items", badge: 142 },
              { id: "active", label: "Active", badge: 120 },
              { id: "draft", label: "Drafts", badge: 14 },
              { id: "archived", label: "Archived", badge: 8 },
            ]}
            activeTab="all"
            onChange={() => {}}
            variant="pill"
          />
        </section>

        {/* 7. Data Table */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            7. Data Table
          </h3>
          <DataTable
            data={sampleData}
            columns={sampleColumns}
            keyExtractor={(row) => row.id}
            searchKey="name"
            searchPlaceholder="Search mock catalog..."
          />
        </section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50/70 p-4 sm:p-8 space-y-8">
      {/* Top Controller */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Admin UI Design System Catalog
          </h1>
          <p className="text-sm text-neutral-500">
            Interactive preview of shared admin components in Light and Dark modes (`/admin/_ui`).
          </p>
        </div>

        {/* Theme mode controls */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
          <button
            onClick={() => setThemeMode("light")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              themeMode === "light"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Light
          </button>
          <button
            onClick={() => setThemeMode("dark")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              themeMode === "dark"
                ? "bg-neutral-900 text-white shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            Dark
          </button>
          <button
            onClick={() => setThemeMode("both")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              themeMode === "both"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-emerald-600" />
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {themeMode === "both" ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
              ☀️ Light Mode
            </div>
            {renderComponentShowcase(false)}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
              🌙 Dark Mode
            </div>
            {renderComponentShowcase(true)}
          </div>
        </div>
      ) : themeMode === "dark" ? (
        <div>{renderComponentShowcase(true)}</div>
      ) : (
        <div>{renderComponentShowcase(false)}</div>
      )}

      {/* Action Dialog & SaveBar Demonstrations */}
      <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          8. Interactive Overlays & Bars
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Open Confirm Dialog
          </button>

          <button
            onClick={() => setSaveDirty(!saveDirty)}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-all"
          >
            Toggle Sticky SaveBar: {saveDirty ? "Visible" : "Hidden"}
          </button>
        </div>

        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="Delete Product Item"
          description="Are you sure you want to permanently remove this laptop from the database? This action cannot be undone."
          confirmLabel="Delete Permanently"
          destructive
          onConfirm={() => setShowConfirm(false)}
        />

        <SaveBar
          open={saveDirty}
          message="You have unsaved changes in the design system form."
          onSave={() => setSaveDirty(false)}
          onDiscard={() => setSaveDirty(false)}
        />
      </div>
    </div>
  );
}
