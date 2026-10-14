"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  type HomepageLayoutSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

interface SectionItem {
  id: string;
  label: string;
  visible: boolean;
  sortOrder: number;
  heading?: string;
  subheading?: string;
}

export default function HomepageSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("homepage_layout");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [homepage, setHomepage] = useState<HomepageLayoutSettings>(
    SETTINGS_GROUP_REGISTRY.homepage_layout.default
  );

  // Sheet State
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftSection, setDraftSection] = useState<SectionItem>({
    id: "",
    label: "",
    visible: true,
    sortOrder: 1,
  });

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=homepage_layout");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setHomepage(data.value as HomepageLayoutSettings);
        }
      }
    } catch (err) {
      console.error("Error loading homepage layout:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=homepage_layout");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setHomepage(data.value as HomepageLayoutSettings);
          }
        }
      } catch (err) {
        console.error("Error loading homepage layout:", err);
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
          group: "homepage_layout",
          value: homepage,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save homepage layout");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Homepage layout saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const sections = [...(homepage.sections || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    // Re-index sortOrder
    sections.forEach((sec, idx) => {
      sec.sortOrder = idx + 1;
    });

    setHomepage({ ...homepage, sections });
    setIsDirty(true);
  };

  const toggleSectionVisible = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const sections = [...(homepage.sections || [])];
    sections[index].visible = !sections[index].visible;
    setHomepage({ ...homepage, sections });
    setIsDirty(true);
  };

  const handleOpenEdit = (index: number) => {
    const sec = homepage.sections?.[index];
    if (!sec) return;
    setEditingIndex(index);
    setDraftSection({
      id: sec.id,
      label: sec.label,
      visible: Boolean(sec.visible),
      sortOrder: sec.sortOrder,
      heading: sec.heading || "",
      subheading: sec.subheading || "",
    });
    setSheetOpen(true);
  };

  const handleSaveSheet = () => {
    if (editingIndex === null) return;
    const sections = [...(homepage.sections || [])];
    sections[editingIndex] = {
      ...sections[editingIndex],
      label: draftSection.label,
      visible: draftSection.visible,
      heading: draftSection.heading,
      subheading: draftSection.subheading,
    };
    setHomepage({ ...homepage, sections });
    setIsDirty(true);
    setSheetOpen(false);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading homepage layout...
      </div>
    );
  }

  const sections = homepage.sections || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Homepage Layout"
        description="Configure which sections appear on your storefront and drag to reorder their display sequence."
      />

      {statusMessage && (
        <div className="p-3 rounded-lg bg-card border border-border text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <Button variant="ghost" size="sm" onClick={() => setStatusMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Section Ordering & Visibility</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Use the handles to drag or reorder sections. Toggle the switch to show or hide a section.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {sections.map((sec, idx) => (
            <div key={sec.id} className="relative flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <CompactListRow
                  title={sec.label}
                  subtitle={`ID: ${sec.id} • Order #${sec.sortOrder}`}
                  badge={
                    <StatusBadge
                      status={sec.visible ? "active" : "draft"}
                      label={sec.visible ? "Visible" : "Hidden"}
                    />
                  }
                  index={idx}
                  total={sections.length}
                  disabled={!canEdit}
                  onMoveUp={() => moveSection(idx, "up")}
                  onMoveDown={() => moveSection(idx, "down")}
                  onEdit={() => handleOpenEdit(idx)}
                />
              </div>

              {/* Quick Visibility Switch */}
              <div className="pr-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={Boolean(sec.visible)}
                  disabled={!canEdit}
                  onCheckedChange={() => toggleSectionVisible(idx)}
                  aria-label={`Toggle visibility of ${sec.label}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Section Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Section: {draftSection.label}</SheetTitle>
            <SheetDescription>
              Update display labels and optional section headings.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-6 py-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Section label
              </label>
              <Input
                value={draftSection.label}
                disabled={!canEdit}
                onChange={(e) =>
                  setDraftSection({ ...draftSection, label: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Display heading (optional)
              </label>
              <Input
                value={draftSection.heading || ""}
                disabled={!canEdit}
                placeholder="e.g. Featured Laptops"
                onChange={(e) =>
                  setDraftSection({ ...draftSection, heading: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Subheading / description (optional)
              </label>
              <Input
                value={draftSection.subheading || ""}
                disabled={!canEdit}
                placeholder="e.g. Hand-picked models with verified battery health"
                onChange={(e) =>
                  setDraftSection({ ...draftSection, subheading: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Show on homepage
                </span>
                <span className="text-[11px] text-muted-foreground">
                  When turned off, this section is completely hidden from shoppers.
                </span>
              </div>
              <Switch
                checked={draftSection.visible}
                disabled={!canEdit}
                onCheckedChange={(checked: boolean) =>
                  setDraftSection({ ...draftSection, visible: checked })
                }
              />
            </div>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t border-border pt-4 mt-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            {canEdit && (
              <Button type="button" size="sm" onClick={handleSaveSheet}>
                Done
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
