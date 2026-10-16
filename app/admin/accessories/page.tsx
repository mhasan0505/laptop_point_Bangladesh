"use client";

import { ImageUploader } from "@/components/admin/ui/ImageUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import {
  ACCESSORY_CATEGORIES,
  ACCESSORY_CONDITIONS,
  ACCESSORY_PLACEHOLDER,
  categoryName,
  type AccessoryRecord,
} from "@/lib/accessory-types";
import { formatBDT } from "@/lib/format";
import { Download, ExternalLink, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface FormState {
  name: string;
  sku: string;
  brand: string;
  category: string;
  condition: string;
  warranty: string;
  color: string;
  price: string;
  originalPrice: string;
  stock: string;
  badge: string;
  description: string;
  compatibility: string;
  specs: string;
  images: string[];
  active: boolean;
}

const EMPTY: FormState = {
  name: "",
  sku: "",
  brand: "",
  category: "chargers-adapters",
  condition: "New",
  warranty: "",
  color: "",
  price: "",
  originalPrice: "",
  stock: "0",
  badge: "",
  description: "",
  compatibility: "",
  specs: "",
  images: [],
  active: true,
};

function toForm(a: AccessoryRecord): FormState {
  return {
    name: a.name,
    sku: a.sku,
    brand: a.brand,
    category: a.category,
    condition: a.condition,
    warranty: a.warranty,
    color: a.color,
    price: String(a.price),
    originalPrice: a.originalPrice ? String(a.originalPrice) : "",
    stock: String(a.stock),
    badge: a.badge ?? "",
    description: a.description,
    compatibility: a.compatibility.join("\n"),
    specs: a.specs.join("\n"),
    images: a.images,
    active: a.active,
  };
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export default function AdminAccessoriesPage() {
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState<AccessoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [editing, setEditing] = useState<AccessoryRecord | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [misfiled, setMisfiled] = useState<Array<{ id: number; sku: string; name: string }>>([]);
  const [moving, setMoving] = useState(false);

  const loadMisfiled = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/accessories/migrate", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      setMisfiled(res.ok && Array.isArray(data?.items) ? data.items : []);
    } catch {
      setMisfiled([]);
    }
  }, []);

  const moveMisfiled = async () => {
    setMoving(true);
    try {
      const res = await fetch("/api/admin/accessories/migrate", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not move accessories");
      const moved = Array.isArray(data.moved) ? data.moved.length : 0;
      const skipped = Array.isArray(data.skipped) ? data.skipped.length : 0;
      success(`Moved ${moved} accessor${moved === 1 ? "y" : "ies"}${skipped ? ` (${skipped} skipped)` : ""}`);
      await Promise.all([load(), loadMisfiled()]);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Could not move accessories");
    } finally {
      setMoving(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/accessories", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Failed to load (${res.status})`);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load accessories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadMisfiled();
  }, [load, loadMisfiled]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (a) =>
        (categoryFilter === "all" || a.category === categoryFilter) &&
        (!q || a.name.toLowerCase().includes(q) || a.sku.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q)),
    );
  }, [items, search, categoryFilter]);

  const openNew = () => {
    setForm(EMPTY);
    setFormError("");
    setEditing("new");
  };
  const openEdit = (a: AccessoryRecord) => {
    setForm(toForm(a));
    setFormError("");
    setEditing(a);
  };
  const close = () => {
    if (!saving) setEditing(null);
  };
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const price = Number(form.price);
    if (!form.name.trim()) return setFormError("Name is required");
    if (!form.sku.trim()) return setFormError("SKU is required");
    if (!Number.isFinite(price) || price <= 0) return setFormError("Enter a price greater than 0");

    const payload = {
      name: form.name,
      sku: form.sku,
      brand: form.brand,
      category: form.category,
      condition: form.condition,
      warranty: form.warranty,
      color: form.color,
      price,
      originalPrice: form.originalPrice === "" ? null : Number(form.originalPrice),
      stock: Number(form.stock || 0),
      badge: form.badge,
      description: form.description,
      compatibility: form.compatibility,
      specs: form.specs,
      images: form.images,
      active: form.active,
    };

    const isNew = editing === "new";
    setSaving(true);
    try {
      const res = await fetch(
        isNew ? "/api/admin/accessories" : `/api/admin/accessories/${(editing as AccessoryRecord).id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save accessory");
      success(isNew ? "Accessory added" : "Accessory updated");
      setEditing(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save accessory";
      setFormError(msg);
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: AccessoryRecord) => {
    if (!window.confirm(`Delete "${a.name}"? This removes it from the store.`)) return;
    try {
      const res = await fetch(`/api/admin/accessories/${a.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      success("Accessory deleted");
      await load();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const toggleActive = async (a: AccessoryRecord) => {
    try {
      const res = await fetch(`/api/admin/accessories/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !a.active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed");
      setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x)));
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const exportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      "ID",
      "SKU",
      "Name",
      "Brand",
      "Category",
      "Condition",
      "Price (BDT)",
      "Original Price (BDT)",
      "Stock",
      "Status",
      "Visible",
    ];
    const rows = items.map((a) => [
      a.id,
      a.sku,
      `"${(a.name || "").replace(/"/g, '""')}"`,
      `"${(a.brand || "").replace(/"/g, '""')}"`,
      a.category,
      a.condition,
      a.price,
      a.originalPrice ?? "",
      a.stock,
      a.stock <= 0 ? "Out of Stock" : a.stock <= 5 ? "Low Stock" : "In Stock",
      a.active ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `accessories_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Accessories</h1>
          <p className="text-sm text-muted-foreground">
            Chargers, batteries, bags and more. Changes appear on the storefront immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={items.length === 0}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" asChild>
            <Link href="/accessories" target="_blank">
              <ExternalLink className="mr-1.5 h-4 w-4" /> View page
            </Link>
          </Button>
          <Button onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" /> Add accessory
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU or brand"
            className={`${inputCls} pl-9`}
            aria-label="Search accessories"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${inputCls} w-auto`}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {ACCESSORY_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {misfiled.length > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
        >
          <p className="text-foreground">
            <strong>{misfiled.length}</strong> accessor{misfiled.length === 1 ? "y was" : "ies were"} saved in the
            laptop catalogue ({misfiled.slice(0, 3).map((m) => m.name).join(", ")}
            {misfiled.length > 3 ? "…" : ""}). They will not appear on the Accessories page until moved.
          </p>
          <Button size="sm" onClick={moveMisfiled} disabled={moving}>
            {moving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Move to Accessories
          </Button>
        </div>
      )}

      {loadError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {loadError}{" "}
          <button className="font-semibold underline" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Accessory</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Visible</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {items.length === 0
                    ? "No accessories yet. Add your first one."
                    : "No accessories match your search."}
                </td>
              </tr>
            ) : (
              visible.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.images[0] || ACCESSORY_PLACEHOLDER}
                        alt=""
                        className="h-11 w-11 rounded-md border border-border bg-muted object-contain"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{a.name}</p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {a.sku} · {a.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryName(a.category)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className="font-semibold">{formatBDT(a.price)}</span>
                    {a.originalPrice && (
                      <span className="ml-1.5 text-xs text-muted-foreground line-through">
                        {formatBDT(a.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {a.stock <= 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-xs bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                        {a.stock} Out
                      </span>
                    ) : a.stock <= 5 ? (
                      <span className="inline-flex items-center gap-1 rounded-xs bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {a.stock} Low
                      </span>
                    ) : (
                      <span className="font-semibold text-foreground">
                        {a.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={a.active}
                      aria-label={`${a.active ? "Hide" : "Show"} ${a.name}`}
                      onClick={() => toggleActive(a)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${a.active ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${a.active ? "left-[22px]" : "left-0.5"}`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(a)} aria-label={`Edit ${a.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(a)} aria-label={`Delete ${a.name}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / edit dialog */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="acc-form-title"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <form
            onSubmit={submit}
            className="my-8 w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="acc-form-title" className="text-base font-bold">
                {editing === "new" ? "Add accessory" : "Edit accessory"}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="rounded p-1 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Name *">
                  <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={140} />
                </Field>
              </div>
              <Field label="SKU *" hint={editing === "new" ? "Unique. Cannot be changed later." : "SKU cannot be changed."}>
                <input
                  className={inputCls}
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  disabled={editing !== "new"}
                  required
                />
              </Field>
              <Field label="Brand">
                <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="HP, Dell, Generic…" />
              </Field>
              <Field label="Category *">
                <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {ACCESSORY_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Condition">
                <select className={inputCls} value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                  {ACCESSORY_CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Price (৳) *">
                <input className={inputCls} type="number" min={1} inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </Field>
              <Field label="Regular price (৳)" hint="Optional. Shows a saving when higher than the price.">
                <input className={inputCls} type="number" min={0} inputMode="numeric" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              </Field>
              <Field label="Stock *" hint="Units available to sell.">
                <input className={inputCls} type="number" min={0} step={1} inputMode="numeric" value={form.stock} onChange={(e) => set("stock", e.target.value)} required />
              </Field>
              <Field label="Warranty" hint="e.g. 6 Months">
                <input className={inputCls} value={form.warranty} onChange={(e) => set("warranty", e.target.value)} />
              </Field>
              <Field label="Colour">
                <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
              </Field>
              <Field label="Badge" hint="Short label, e.g. Bestseller">
                <input className={inputCls} value={form.badge} onChange={(e) => set("badge", e.target.value)} maxLength={30} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
                </Field>
              </div>
              <Field label="Compatible with" hint="One per line, e.g. HP EliteBook 840">
                <textarea className={inputCls} rows={4} value={form.compatibility} onChange={(e) => set("compatibility", e.target.value)} />
              </Field>
              <Field label="Highlights" hint="One per line, e.g. USB-C, 65W">
                <textarea className={inputCls} rows={4} value={form.specs} onChange={(e) => set("specs", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <ImageUploader
                  label="Images"
                  description="PNG, JPG or WebP. The first image is shown on cards."
                  multiple
                  maxFiles={6}
                  preset="product"
                  value={form.images}
                  onChange={(v) => set("images", Array.isArray(v) ? v : v ? [v] : [])}
                />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
                Visible on the storefront
              </label>
            </div>

            {formError && (
              <p role="alert" className="mx-5 mb-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
              <Button type="button" variant="outline" onClick={close} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                {editing === "new" ? "Add accessory" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
