"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { CompactListRow } from "@/components/admin/setup/CompactListRow";
import { useSetup } from "../setup-context";

interface MasterBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number };
}

interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  image?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  sortOrder: number;
  active: boolean;
  _count?: { products: number; children: number };
}

export default function CatalogMastersSetupPage() {
  const { canWrite, refreshSettings } = useSetup();
  const canEdit = canWrite("catalog_masters");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [brands, setBrands] = useState<MasterBrand[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);

  // Brand Sheet state
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<MasterBrand | null>(null);
  const [brandDraft, setBrandDraft] = useState({
    name: "",
    slug: "",
    website: "",
    logo: "",
    active: true,
  });
  const [showBrandDeleteConfirm, setShowBrandDeleteConfirm] = useState(false);

  // Category Sheet state
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategory | null>(null);
  const [categoryDraft, setCategoryDraft] = useState({
    name: "",
    slug: "",
    parentId: "",
    icon: "",
    image: "",
    active: true,
  });
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup/masters");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error loading catalog masters:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup/masters");
        if (res.ok && !ignore) {
          const data = await res.json();
          setBrands(data.brands || []);
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Error loading catalog masters:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  // Brand Handlers
  const handleOpenAddBrand = () => {
    setEditingBrand(null);
    setBrandDraft({
      name: "",
      slug: "",
      website: "",
      logo: "",
      active: true,
    });
    setBrandSheetOpen(true);
  };

  const handleOpenEditBrand = (brand: MasterBrand) => {
    setEditingBrand(brand);
    setBrandDraft({
      name: brand.name,
      slug: brand.slug,
      website: brand.website || "",
      logo: brand.logo || "",
      active: brand.active,
    });
    setBrandSheetOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!brandDraft.name.trim()) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const isEdit = !!editingBrand;
      const res = await fetch("/api/admin/setup/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "brand",
          action: isEdit ? "update" : "create",
          data: isEdit
            ? { id: editingBrand.id, ...brandDraft }
            : { ...brandDraft, sortOrder: brands.length },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save brand");
      }

      setBrandSheetOpen(false);
      await loadData();
      await refreshSettings();
      setStatusMessage(`Brand ${isEdit ? "updated" : "added"} successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!editingBrand) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/setup/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "brand",
          action: "delete",
          data: { id: editingBrand.id },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete brand");
      }

      setShowBrandDeleteConfirm(false);
      setBrandSheetOpen(false);
      await loadData();
      await refreshSettings();
      setStatusMessage("Brand deleted.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const moveBrand = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= brands.length) return;

    const brandA = brands[index];
    const brandB = brands[targetIndex];

    const updatedBrands = [...brands];
    updatedBrands[index] = brandB;
    updatedBrands[targetIndex] = brandA;
    setBrands(updatedBrands);

    try {
      await Promise.all([
        fetch("/api/admin/setup/masters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity: "brand",
            action: "update",
            data: { id: brandA.id, sortOrder: targetIndex },
          }),
        }),
        fetch("/api/admin/setup/masters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity: "brand",
            action: "update",
            data: { id: brandB.id, sortOrder: index },
          }),
        }),
      ]);
    } catch (err) {
      console.error("Error reordering brands:", err);
      await loadData();
    }
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryDraft({
      name: "",
      slug: "",
      parentId: "",
      icon: "",
      image: "",
      active: true,
    });
    setCategorySheetOpen(true);
  };

  const handleOpenEditCategory = (category: MasterCategory) => {
    setEditingCategory(category);
    setCategoryDraft({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || "",
      icon: category.icon || "",
      image: category.image || "",
      active: category.active,
    });
    setCategorySheetOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryDraft.name.trim()) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const isEdit = !!editingCategory;
      const res = await fetch("/api/admin/setup/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "category",
          action: isEdit ? "update" : "create",
          data: isEdit
            ? { id: editingCategory.id, ...categoryDraft }
            : { ...categoryDraft, sortOrder: categories.length },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save category");
      }

      setCategorySheetOpen(false);
      await loadData();
      await refreshSettings();
      setStatusMessage(`Category ${isEdit ? "updated" : "added"} successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!editingCategory) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/setup/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "category",
          action: "delete",
          data: { id: editingCategory.id },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete category");
      }

      setShowCategoryDeleteConfirm(false);
      setCategorySheetOpen(false);
      await loadData();
      await refreshSettings();
      setStatusMessage("Category deleted.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const catA = categories[index];
    const catB = categories[targetIndex];

    const updatedCategories = [...categories];
    updatedCategories[index] = catB;
    updatedCategories[targetIndex] = catA;
    setCategories(updatedCategories);

    try {
      await Promise.all([
        fetch("/api/admin/setup/masters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity: "category",
            action: "update",
            data: { id: catA.id, sortOrder: targetIndex },
          }),
        }),
        fetch("/api/admin/setup/masters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity: "category",
            action: "update",
            data: { id: catB.id, sortOrder: index },
          }),
        }),
      ]);
    } catch (err) {
      console.error("Error reordering categories:", err);
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading catalog masters...
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto w-full space-y-8 pb-16">
      <PageHeader
        title="Brands & Categories"
        description="Manage the store's official product brands and category hierarchy."
      />

      {statusMessage && (
        <div
          className={`p-3 text-xs rounded-lg ${
            statusMessage.startsWith("Error")
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* SECTION 1: BRANDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Brands</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Available laptop and component manufacturers ({brands.length})
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAddBrand}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Brand
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {brands.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground rounded-lg border border-border bg-card">
              No brands registered yet.
            </div>
          ) : (
            brands.map((brand, idx) => (
              <CompactListRow
                key={brand.id}
                title={brand.name}
                subtitle={`${brand._count?.products ?? 0} products${
                  brand.website ? ` • ${brand.website}` : ""
                }`}
                badge={<StatusBadge status={brand.active ? "active" : "draft"} />}
                index={idx}
                total={brands.length}
                onMoveUp={() => moveBrand(idx, "up")}
                onMoveDown={() => moveBrand(idx, "down")}
                onEdit={() => handleOpenEditBrand(brand)}
                disabled={!canEdit}
              />
            ))
          )}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 2: CATEGORIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Store product categories and classification ({categories.length})
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAddCategory}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground rounded-lg border border-border bg-card">
              No categories registered yet.
            </div>
          ) : (
            categories.map((cat, idx) => (
              <CompactListRow
                key={cat.id}
                title={cat.name}
                subtitle={`${cat._count?.products ?? 0} products${
                  cat.parent ? ` • Parent: ${cat.parent.name}` : ""
                }`}
                badge={<StatusBadge status={cat.active ? "active" : "draft"} />}
                index={idx}
                total={categories.length}
                onMoveUp={() => moveCategory(idx, "up")}
                onMoveDown={() => moveCategory(idx, "down")}
                onEdit={() => handleOpenEditCategory(cat)}
                disabled={!canEdit}
              />
            ))
          )}
        </div>
      </section>

      {/* BRAND EDIT / CREATE SHEET */}
      <Sheet open={brandSheetOpen} onOpenChange={setBrandSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </SheetTitle>
            <SheetDescription>
              {editingBrand
                ? `Update details for ${editingBrand.name}.`
                : "Create a new manufacturer brand in the catalog."}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Brand Name</label>
              <Input
                value={brandDraft.name}
                placeholder="e.g. Lenovo, Dell, Apple"
                onChange={(e) => setBrandDraft({ ...brandDraft, name: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Slug</label>
              <Input
                value={brandDraft.slug}
                placeholder="Auto-generated if left blank"
                onChange={(e) => setBrandDraft({ ...brandDraft, slug: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Official Website</label>
              <Input
                value={brandDraft.website}
                placeholder="https://..."
                onChange={(e) => setBrandDraft({ ...brandDraft, website: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Logo URL</label>
              <Input
                value={brandDraft.logo}
                placeholder="https://... or /brands/logo.png"
                onChange={(e) => setBrandDraft({ ...brandDraft, logo: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-medium text-foreground">Active Status</div>
                <div className="text-[11px] text-muted-foreground">
                  Show brand in catalog filters
                </div>
              </div>
              <Switch
                checked={brandDraft.active}
                onCheckedChange={(val) => setBrandDraft({ ...brandDraft, active: val })}
                disabled={!canEdit}
              />
            </div>

            {editingBrand && canEdit && (
              <div className="pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBrandDeleteConfirm(true)}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Brand
                </Button>
              </div>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBrandSheetOpen(false)}
            >
              Cancel
            </Button>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveBrand}
                disabled={saving || !brandDraft.name.trim()}
              >
                {saving ? "Saving..." : editingBrand ? "Update Brand" : "Add Brand"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* BRAND DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={showBrandDeleteConfirm}
        onOpenChange={setShowBrandDeleteConfirm}
        title="Delete Brand"
        description={`Are you sure you want to delete "${editingBrand?.name}"? Products linked to this brand may lose their association.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteBrand}
      />

      {/* CATEGORY EDIT / CREATE SHEET */}
      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </SheetTitle>
            <SheetDescription>
              {editingCategory
                ? `Update details for ${editingCategory.name}.`
                : "Create a new category for products in the catalog."}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Category Name</label>
              <Input
                value={categoryDraft.name}
                placeholder="e.g. Gaming Laptops, Ultrabooks"
                onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Slug</label>
              <Input
                value={categoryDraft.slug}
                placeholder="Auto-generated if left blank"
                onChange={(e) => setCategoryDraft({ ...categoryDraft, slug: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Parent Category</label>
              <Select
                value={categoryDraft.parentId || "none"}
                onValueChange={(val) =>
                  setCategoryDraft({
                    ...categoryDraft,
                    parentId: val === "none" ? "" : (val ?? ""),
                  })
                }
                disabled={!canEdit}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-level Category)</SelectItem>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Icon Identifier</label>
              <Input
                value={categoryDraft.icon}
                placeholder="e.g. laptop, monitor, zap"
                onChange={(e) => setCategoryDraft({ ...categoryDraft, icon: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Category Image URL</label>
              <Input
                value={categoryDraft.image}
                placeholder="https://... or /categories/banner.jpg"
                onChange={(e) => setCategoryDraft({ ...categoryDraft, image: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-medium text-foreground">Active Status</div>
                <div className="text-[11px] text-muted-foreground">
                  Show category in store navigation and filters
                </div>
              </div>
              <Switch
                checked={categoryDraft.active}
                onCheckedChange={(val) => setCategoryDraft({ ...categoryDraft, active: val })}
                disabled={!canEdit}
              />
            </div>

            {editingCategory && canEdit && (
              <div className="pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowCategoryDeleteConfirm(true)}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Category
                </Button>
              </div>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCategorySheetOpen(false)}
            >
              Cancel
            </Button>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveCategory}
                disabled={saving || !categoryDraft.name.trim()}
              >
                {saving ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* CATEGORY DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={showCategoryDeleteConfirm}
        onOpenChange={setShowCategoryDeleteConfirm}
        title="Delete Category"
        description={`Are you sure you want to delete "${editingCategory?.name}"? Sub-categories and products may be affected.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
