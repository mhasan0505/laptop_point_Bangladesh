"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  type CatalogMastersSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

type StandardType = "conditions" | "grades" | "warrantyTypes";

export default function ProductStandardsSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("catalog_masters");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [standards, setStandards] = useState<CatalogMastersSettings>(
    SETTINGS_GROUP_REGISTRY.catalog_masters.default
  );

  // Edit / Add sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeType, setActiveType] = useState<StandardType>("conditions");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemDraft, setItemDraft] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=catalog_masters");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setStandards(data.value as CatalogMastersSettings);
        }
      }
    } catch (err) {
      console.error("Error loading product standards:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=catalog_masters");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setStandards(data.value as CatalogMastersSettings);
          }
        }
      } catch (err) {
        console.error("Error loading product standards:", err);
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
          group: "catalog_masters",
          value: standards,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save standards");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Product standards saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = (type: StandardType) => {
    setActiveType(type);
    setEditingIndex(null);
    setItemDraft("");
    setSheetOpen(true);
  };

  const handleOpenEdit = (type: StandardType, index: number) => {
    setActiveType(type);
    setEditingIndex(index);
    setItemDraft(standards[type][index] || "");
    setSheetOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemDraft.trim()) return;
    const list = [...(standards[activeType] || [])];
    if (editingIndex !== null) {
      list[editingIndex] = itemDraft.trim();
    } else {
      list.push(itemDraft.trim());
    }
    setStandards({ ...standards, [activeType]: list });
    setIsDirty(true);
    setSheetOpen(false);
  };

  const handleDeleteItem = () => {
    if (editingIndex === null) return;
    const list = [...(standards[activeType] || [])];
    list.splice(editingIndex, 1);
    setStandards({ ...standards, [activeType]: list });
    setIsDirty(true);
    setShowDeleteConfirm(false);
    setSheetOpen(false);
  };

  const moveItem = (type: StandardType, index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const list = [...(standards[type] || [])];
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setStandards({ ...standards, [type]: list });
    setIsDirty(true);
  };

  const getTypeLabel = (type: StandardType) => {
    switch (type) {
      case "conditions":
        return "Product Condition";
      case "grades":
        return "Cosmetic Grade";
      case "warrantyTypes":
        return "Warranty Type";
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading product standards...
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto w-full space-y-8 pb-16">
      <PageHeader
        title="Product Standards"
        description="Controlled vocabulary standards for conditions, grades, and warranty options."
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

      {/* SECTION 1: CONDITIONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Conditions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Physical product condition options used when creating inventory
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdd("conditions")}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Condition
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {standards.conditions.map((item, idx) => (
            <CompactListRow
              key={idx}
              title={item}
              subtitle="Standard inventory condition"
              index={idx}
              total={standards.conditions.length}
              onMoveUp={() => moveItem("conditions", idx, "up")}
              onMoveDown={() => moveItem("conditions", idx, "down")}
              onEdit={() => handleOpenEdit("conditions", idx)}
              disabled={!canEdit}
            />
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 2: GRADES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Cosmetic Grades</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Grade classifications for used and refurbished devices
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdd("grades")}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Grade
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {standards.grades.map((item, idx) => (
            <CompactListRow
              key={idx}
              title={`Grade ${item}`}
              subtitle="Device cosmetic rating"
              index={idx}
              total={standards.grades.length}
              onMoveUp={() => moveItem("grades", idx, "up")}
              onMoveDown={() => moveItem("grades", idx, "down")}
              onEdit={() => handleOpenEdit("grades", idx)}
              disabled={!canEdit}
            />
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 3: WARRANTY TYPES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Warranty Types</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Available warranty terms attached to product listings
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenAdd("warrantyTypes")}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Warranty Type
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {standards.warrantyTypes.map((item, idx) => (
            <CompactListRow
              key={idx}
              title={item}
              subtitle="Store coverage type"
              index={idx}
              total={standards.warrantyTypes.length}
              onMoveUp={() => moveItem("warrantyTypes", idx, "up")}
              onMoveDown={() => moveItem("warrantyTypes", idx, "down")}
              onEdit={() => handleOpenEdit("warrantyTypes", idx)}
              disabled={!canEdit}
            />
          ))}
        </div>
      </section>

      {/* ITEM EDIT / CREATE SHEET */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingIndex !== null ? `Edit ${getTypeLabel(activeType)}` : `Add ${getTypeLabel(activeType)}`}
            </SheetTitle>
            <SheetDescription>
              {editingIndex !== null
                ? "Update standard name."
                : "Add a new option to the store vocabulary."}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Option Name</label>
              <Input
                value={itemDraft}
                placeholder="Enter standard name"
                onChange={(e) => setItemDraft(e.target.value)}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            {editingIndex !== null && canEdit && (
              <div className="pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Option
                </Button>
              </div>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveItem}
                disabled={!itemDraft.trim()}
              >
                {editingIndex !== null ? "Apply Changes" : "Add Option"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete ${getTypeLabel(activeType)}`}
        description={`Are you sure you want to delete "${standards[activeType]?.[editingIndex ?? 0]}" from the predefined options?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteItem}
      />

      {/* SAVE BAR */}
      {canEdit && (
        <SaveBar
          open={isDirty}
          onSave={handleSave}
          onDiscard={() => {
            loadData();
          }}
          isSaving={saving}
        />
      )}
    </div>
  );
}
