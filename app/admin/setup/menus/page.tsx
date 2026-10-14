"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, FolderTree } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  type NavigationSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

interface DropdownItem {
  name: string;
  href: string;
}

interface TopMenuDraft {
  id: string;
  label: string;
  href?: string;
  badge?: string;
  dropdownItems?: DropdownItem[];
}

interface SubCategoryDraft {
  name: string;
  href: string;
}

interface CategoryDraft {
  id: string;
  label: string;
  href: string;
  hasChevron?: boolean;
  subitems?: SubCategoryDraft[];
}

export default function MenusSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("navigation");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [navSettings, setNavSettings] = useState<NavigationSettings>(
    SETTINGS_GROUP_REGISTRY.navigation.default
  );

  // Sheet State for Header Menu
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [editingMenuIndex, setEditingMenuIndex] = useState<number | null>(null);
  const [menuDraft, setMenuDraft] = useState<TopMenuDraft>({
    id: "",
    label: "",
    href: "",
    badge: "",
    dropdownItems: [],
  });
  const [showDeleteMenuConfirm, setShowDeleteMenuConfirm] = useState(false);

  // Sub-menu delete confirmation
  const [deletingSubIndex, setDeletingSubIndex] = useState<number | null>(null);

  // Sheet State for Category Mega Menu
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [catDraft, setCatDraft] = useState<CategoryDraft>({
    id: "",
    label: "",
    href: "",
    hasChevron: false,
    subitems: [],
  });
  const [showDeleteCatConfirm, setShowDeleteCatConfirm] = useState(false);

  // Sub-category delete confirmation
  const [deletingCatSubIndex, setDeletingCatSubIndex] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=navigation");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setNavSettings(data.value as NavigationSettings);
        }
      }
    } catch (err) {
      console.error("Error loading navigation settings:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=navigation");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setNavSettings(data.value as NavigationSettings);
          }
        }
      } catch (err) {
        console.error("Error loading navigation settings:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsDirty(false);
        }
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, [setIsDirty]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group: "navigation",
          value: navSettings,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save navigation menus");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Navigation menus saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Reorder Top Menus
  const moveTopMenu = (fromIdx: number, direction: "up" | "down") => {
    const menus = [...(navSettings.topNavMenus || [])];
    const targetIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (targetIdx < 0 || targetIdx >= menus.length) return;

    const temp = menus[fromIdx];
    menus[fromIdx] = menus[targetIdx];
    menus[targetIdx] = temp;

    setNavSettings({ ...navSettings, topNavMenus: menus });
    setIsDirty(true);
  };

  // Open Header Menu Sheet
  const handleOpenAddMenu = () => {
    setEditingMenuIndex(null);
    setMenuDraft({
      id: `menu-${Date.now()}`,
      label: "",
      href: "/shop",
      badge: "",
      dropdownItems: [],
    });
    setMenuSheetOpen(true);
  };

  const handleOpenEditMenu = (idx: number) => {
    const m = navSettings.topNavMenus?.[idx];
    if (!m) return;
    setEditingMenuIndex(idx);
    setMenuDraft({
      id: m.id || `menu-${idx}`,
      label: m.label || "",
      href: m.href || "",
      badge: m.badge || "",
      dropdownItems: m.dropdownItems ? [...m.dropdownItems] : [],
    });
    setMenuSheetOpen(true);
  };

  const handleSaveMenuSheet = () => {
    if (!menuDraft.label.trim()) return;
    const menus = [...(navSettings.topNavMenus || [])];

    if (editingMenuIndex !== null) {
      menus[editingMenuIndex] = menuDraft;
    } else {
      menus.push(menuDraft);
    }

    setNavSettings({ ...navSettings, topNavMenus: menus });
    setIsDirty(true);
    setMenuSheetOpen(false);
  };

  const handleDeleteMenu = () => {
    if (editingMenuIndex === null) return;
    const menus = (navSettings.topNavMenus || []).filter(
      (_, i) => i !== editingMenuIndex
    );
    setNavSettings({ ...navSettings, topNavMenus: menus });
    setIsDirty(true);
    setShowDeleteMenuConfirm(false);
    setMenuSheetOpen(false);
  };

  // Sub-menus inside Header Menu Sheet
  const moveSubMenuItem = (fromIdx: number, direction: "up" | "down") => {
    const subs = [...(menuDraft.dropdownItems || [])];
    const targetIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (targetIdx < 0 || targetIdx >= subs.length) return;

    const temp = subs[fromIdx];
    subs[fromIdx] = subs[targetIdx];
    subs[targetIdx] = temp;

    setMenuDraft({ ...menuDraft, dropdownItems: subs });
  };

  const handleAddSubMenuItem = () => {
    const subs = [...(menuDraft.dropdownItems || [])];
    subs.push({ name: "New Sub-menu", href: "/shop" });
    setMenuDraft({ ...menuDraft, dropdownItems: subs });
  };

  const handleUpdateSubMenuItem = (idx: number, field: "name" | "href", val: string) => {
    const subs = [...(menuDraft.dropdownItems || [])];
    subs[idx] = { ...subs[idx], [field]: val };
    setMenuDraft({ ...menuDraft, dropdownItems: subs });
  };

  const handleDeleteSubMenuItem = () => {
    if (deletingSubIndex === null) return;
    const subs = (menuDraft.dropdownItems || []).filter((_, i) => i !== deletingSubIndex);
    setMenuDraft({ ...menuDraft, dropdownItems: subs });
    setDeletingSubIndex(null);
  };

  // Reorder Mega Categories
  const moveCategory = (fromIdx: number, direction: "up" | "down") => {
    const cats = [...(navSettings.shopCategories || [])];
    const targetIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (targetIdx < 0 || targetIdx >= cats.length) return;

    const temp = cats[fromIdx];
    cats[fromIdx] = cats[targetIdx];
    cats[targetIdx] = temp;

    setNavSettings({ ...navSettings, shopCategories: cats });
    setIsDirty(true);
  };

  // Open Category Sheet
  const handleOpenAddCategory = () => {
    setEditingCatIndex(null);
    setCatDraft({
      id: `cat-${Date.now()}`,
      label: "",
      href: "/shop",
      hasChevron: false,
      subitems: [],
    });
    setCatSheetOpen(true);
  };

  const handleOpenEditCategory = (idx: number) => {
    const c = navSettings.shopCategories?.[idx];
    if (!c) return;
    setEditingCatIndex(idx);
    setCatDraft({
      id: c.id || `cat-${idx}`,
      label: c.label || "",
      href: c.href || "",
      hasChevron: Boolean(c.hasChevron),
      subitems: c.subitems ? [...c.subitems] : [],
    });
    setCatSheetOpen(true);
  };

  const handleSaveCatSheet = () => {
    if (!catDraft.label.trim()) return;
    const cats = [...(navSettings.shopCategories || [])];
    const updatedDraft = {
      ...catDraft,
      hasChevron: Boolean(catDraft.subitems && catDraft.subitems.length > 0),
    };

    if (editingCatIndex !== null) {
      cats[editingCatIndex] = updatedDraft;
    } else {
      cats.push(updatedDraft);
    }

    setNavSettings({ ...navSettings, shopCategories: cats });
    setIsDirty(true);
    setCatSheetOpen(false);
  };

  const handleDeleteCategory = () => {
    if (editingCatIndex === null) return;
    const cats = (navSettings.shopCategories || []).filter(
      (_, i) => i !== editingCatIndex
    );
    setNavSettings({ ...navSettings, shopCategories: cats });
    setIsDirty(true);
    setShowDeleteCatConfirm(false);
    setCatSheetOpen(false);
  };

  // Flyout Sub-categories inside Category Sheet
  const moveCatSubItem = (fromIdx: number, direction: "up" | "down") => {
    const subs = [...(catDraft.subitems || [])];
    const targetIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (targetIdx < 0 || targetIdx >= subs.length) return;

    const temp = subs[fromIdx];
    subs[fromIdx] = subs[targetIdx];
    subs[targetIdx] = temp;

    setCatDraft({ ...catDraft, subitems: subs });
  };

  const handleAddCatSubItem = () => {
    const subs = [...(catDraft.subitems || [])];
    subs.push({ name: "New Sub-category", href: "/shop" });
    setCatDraft({ ...catDraft, subitems: subs });
  };

  const handleUpdateCatSubItem = (idx: number, field: "name" | "href", val: string) => {
    const subs = [...(catDraft.subitems || [])];
    subs[idx] = { ...subs[idx], [field]: val };
    setCatDraft({ ...catDraft, subitems: subs });
  };

  const handleDeleteCatSubItem = () => {
    if (deletingCatSubIndex === null) return;
    const subs = (catDraft.subitems || []).filter((_, i) => i !== deletingCatSubIndex);
    setCatDraft({ ...catDraft, subitems: subs });
    setDeletingCatSubIndex(null);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading navigation menus...
      </div>
    );
  }

  const topMenus = navSettings.topNavMenus || [];
  const megaCats = navSettings.shopCategories || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Navigation & Menus"
        description="Header navigation links, dropdown sub-menus, and shop category mega drawer."
      />

      {statusMessage && (
        <div className="p-3 rounded-lg bg-card border border-border text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <Button variant="ghost" size="sm" onClick={() => setStatusMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Group 1: Header Menus */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Header Navigation Links</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Primary links shown in the storefront header bar. Click a row to configure dropdown sub-menus.
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAddMenu}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Header Link</span>
            </Button>
          )}
        </div>

        <div className="space-y-2 pt-1">
          {topMenus.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
              No header menus configured yet.
            </div>
          ) : (
            topMenus.map((menu, idx) => {
              const subCount = menu.dropdownItems?.length || 0;
              return (
                <CompactListRow
                  key={menu.id || idx}
                  title={menu.label || `Menu #${idx + 1}`}
                  subtitle={`${menu.href || "No URL"} • ${subCount} sub-menu link${subCount === 1 ? "" : "s"}${menu.badge ? ` • Badge: "${menu.badge}"` : ""}`}
                  index={idx}
                  total={topMenus.length}
                  disabled={!canEdit}
                  onMoveUp={() => moveTopMenu(idx, "up")}
                  onMoveDown={() => moveTopMenu(idx, "down")}
                  onEdit={() => handleOpenEditMenu(idx)}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-border pt-6" />

      {/* Group 2: Shop Category Mega Menu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Shop Category Mega Menu</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categories shown in the &quot;Browse Categories&quot; side drawer with flyout sub-categories on hover.
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAddCategory}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mega Category</span>
            </Button>
          )}
        </div>

        <div className="space-y-2 pt-1">
          {megaCats.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
              No mega categories configured yet.
            </div>
          ) : (
            megaCats.map((cat, idx) => {
              const subCount = cat.subitems?.length || 0;
              return (
                <CompactListRow
                  key={cat.id || idx}
                  title={cat.label || `Category #${idx + 1}`}
                  subtitle={`${cat.href || "No URL"} • ${subCount} flyout sub-categor${subCount === 1 ? "y" : "ies"}`}
                  index={idx}
                  total={megaCats.length}
                  disabled={!canEdit}
                  onMoveUp={() => moveCategory(idx, "up")}
                  onMoveDown={() => moveCategory(idx, "down")}
                  onEdit={() => handleOpenEditCategory(idx)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Edit Header Menu Side Sheet */}
      <Sheet open={menuSheetOpen} onOpenChange={setMenuSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingMenuIndex !== null ? "Edit Header Link" : "Add Header Link"}
            </SheetTitle>
            <SheetDescription>
              Configure link label, target URL, badge, and dropdown flyout sub-links.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-6 py-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Link label
              </label>
              <Input
                value={menuDraft.label}
                disabled={!canEdit}
                placeholder="e.g. Gaming Laptops, Apple"
                onChange={(e) =>
                  setMenuDraft({ ...menuDraft, label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Target URL
              </label>
              <Input
                value={menuDraft.href || ""}
                disabled={!canEdit}
                placeholder="e.g. /shop?category=gaming"
                onChange={(e) =>
                  setMenuDraft({ ...menuDraft, href: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Badge text (optional)
              </label>
              <Input
                value={menuDraft.badge || ""}
                disabled={!canEdit}
                placeholder="e.g. Hot, New"
                onChange={(e) =>
                  setMenuDraft({ ...menuDraft, badge: e.target.value })
                }
              />
            </div>

            {/* Sub-menus compact list inside Sheet */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-primary" />
                    <span>Dropdown Sub-menus</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Links displayed in the dropdown when shoppers hover or tap this menu.
                  </span>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSubMenuItem}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Link</span>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {(!menuDraft.dropdownItems || menuDraft.dropdownItems.length === 0) ? (
                  <div className="py-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No sub-menus added yet.
                  </div>
                ) : (
                  menuDraft.dropdownItems.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg border border-border bg-muted/30 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit || sIdx === 0}
                            onClick={() => moveSubMenuItem(sIdx, "up")}
                            className="h-5 w-5 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit || sIdx === (menuDraft.dropdownItems?.length || 0) - 1}
                            onClick={() => moveSubMenuItem(sIdx, "down")}
                            className="h-5 w-5 p-0"
                          >
                            ↓
                          </Button>
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">
                            #{sIdx + 1}
                          </span>
                        </div>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSubIndex(sIdx)}
                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete sub-menu link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Sub-menu title"
                          value={sub.name}
                          disabled={!canEdit}
                          onChange={(e) =>
                            handleUpdateSubMenuItem(sIdx, "name", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="Link URL"
                          value={sub.href}
                          disabled={!canEdit}
                          onChange={(e) =>
                            handleUpdateSubMenuItem(sIdx, "href", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row justify-between sm:justify-between gap-2 border-t border-border pt-4 mt-auto">
            {editingMenuIndex !== null && canEdit ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteMenuConfirm(true)}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMenuSheetOpen(false)}
              >
                Cancel
              </Button>
              {canEdit && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveMenuSheet}
                  disabled={!menuDraft.label.trim()}
                >
                  Save Menu
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Category Mega Menu Side Sheet */}
      <Sheet open={catSheetOpen} onOpenChange={setCatSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingCatIndex !== null ? "Edit Mega Category" : "Add Mega Category"}
            </SheetTitle>
            <SheetDescription>
              Configure category label, target URL, and side flyout sub-categories.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-6 py-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Category label
              </label>
              <Input
                value={catDraft.label}
                disabled={!canEdit}
                placeholder="e.g. Gaming Laptops, Ultrabooks"
                onChange={(e) =>
                  setCatDraft({ ...catDraft, label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Target URL
              </label>
              <Input
                value={catDraft.href}
                disabled={!canEdit}
                placeholder="e.g. /shop?category=gaming"
                onChange={(e) =>
                  setCatDraft({ ...catDraft, href: e.target.value })
                }
              />
            </div>

            {/* Flyout Sub-categories list inside Sheet */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-primary" />
                    <span>Flyout Sub-categories</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Sub-categories displayed in the flyout panel on hover.
                  </span>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddCatSubItem}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Link</span>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {(!catDraft.subitems || catDraft.subitems.length === 0) ? (
                  <div className="py-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    No flyout sub-categories added yet.
                  </div>
                ) : (
                  catDraft.subitems.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg border border-border bg-muted/30 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit || sIdx === 0}
                            onClick={() => moveCatSubItem(sIdx, "up")}
                            className="h-5 w-5 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit || sIdx === (catDraft.subitems?.length || 0) - 1}
                            onClick={() => moveCatSubItem(sIdx, "down")}
                            className="h-5 w-5 p-0"
                          >
                            ↓
                          </Button>
                          <span className="text-[10px] font-mono text-muted-foreground ml-1">
                            #{sIdx + 1}
                          </span>
                        </div>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCatSubIndex(sIdx)}
                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete sub-category link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Sub-category name"
                          value={sub.name}
                          disabled={!canEdit}
                          onChange={(e) =>
                            handleUpdateCatSubItem(sIdx, "name", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="Target URL"
                          value={sub.href}
                          disabled={!canEdit}
                          onChange={(e) =>
                            handleUpdateCatSubItem(sIdx, "href", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row justify-between sm:justify-between gap-2 border-t border-border pt-4 mt-auto">
            {editingCatIndex !== null && canEdit ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteCatConfirm(true)}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCatSheetOpen(false)}
              >
                Cancel
              </Button>
              {canEdit && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveCatSheet}
                  disabled={!catDraft.label.trim()}
                >
                  Save Category
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showDeleteMenuConfirm}
        onOpenChange={setShowDeleteMenuConfirm}
        title="Delete Header Menu"
        description={`Are you sure you want to remove "${menuDraft.label}" and all its sub-menu links?`}
        confirmText="Delete Menu"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteMenu}
      />

      <ConfirmDialog
        open={deletingSubIndex !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingSubIndex(null);
        }}
        title="Delete Sub-menu Link"
        description="Are you sure you want to remove this dropdown link?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteSubMenuItem}
      />

      <ConfirmDialog
        open={showDeleteCatConfirm}
        onOpenChange={setShowDeleteCatConfirm}
        title="Delete Mega Category"
        description={`Are you sure you want to remove "${catDraft.label}" and its flyout sub-categories?`}
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteCategory}
      />

      <ConfirmDialog
        open={deletingCatSubIndex !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setDeletingCatSubIndex(null);
        }}
        title="Delete Sub-category Link"
        description="Are you sure you want to remove this flyout sub-category?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteCatSubItem}
      />

      {/* SaveBar */}
      {canEdit && (
        <SaveBar
          open={isDirty}
          onSave={handleSave}
          onDiscard={() => loadData()}
          isSaving={saving}
        />
      )}
    </div>
  );
}

