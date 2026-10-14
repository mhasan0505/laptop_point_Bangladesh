"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  type StoreProfileSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

interface BranchItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  mapLink: string;
}

export default function StoreProfileSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("store_profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<StoreProfileSettings>(
    SETTINGS_GROUP_REGISTRY.store_profile.default
  );

  // Sheet State for Showroom Branches
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBranchIndex, setEditingBranchIndex] = useState<number | null>(null);
  const [branchDraft, setBranchDraft] = useState<BranchItem>({
    id: "",
    name: "",
    address: "",
    phone: "",
    hours: "10:00 AM - 09:00 PM",
    mapLink: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=store_profile");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setProfile(data.value as StoreProfileSettings);
        }
      }
    } catch (err) {
      console.error("Error loading store profile:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=store_profile");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setProfile(data.value as StoreProfileSettings);
          }
        }
      } catch (err) {
        console.error("Error loading store profile:", err);
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
          group: "store_profile",
          value: profile,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save profile settings");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Store profile saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Branch Reordering
  const moveBranch = (fromIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    const branches = [...(profile.showroomBranches || [])];
    if (targetIndex < 0 || targetIndex >= branches.length) return;

    const temp = branches[fromIndex];
    branches[fromIndex] = branches[targetIndex];
    branches[targetIndex] = temp;

    setProfile({ ...profile, showroomBranches: branches });
    setIsDirty(true);
  };

  // Open Sheet for Add/Edit Branch
  const handleOpenAddBranch = () => {
    setEditingBranchIndex(null);
    setBranchDraft({
      id: `branch-${Date.now()}`,
      name: "",
      address: "",
      phone: profile.hotline || "",
      hours: "10:00 AM - 09:00 PM",
      mapLink: "",
    });
    setSheetOpen(true);
  };

  const handleOpenEditBranch = (index: number) => {
    const target = profile.showroomBranches?.[index];
    if (!target) return;
    setEditingBranchIndex(index);
    setBranchDraft({
      id: target.id || `branch-${index}`,
      name: target.name || "",
      address: target.address || "",
      phone: target.phone || "",
      hours: target.hours || "",
      mapLink: target.mapLink || "",
    });
    setSheetOpen(true);
  };

  const handleSaveBranchSheet = () => {
    if (!branchDraft.name.trim()) return;
    const branches = [...(profile.showroomBranches || [])];

    if (editingBranchIndex !== null) {
      branches[editingBranchIndex] = branchDraft;
    } else {
      branches.push(branchDraft);
    }

    setProfile({ ...profile, showroomBranches: branches });
    setIsDirty(true);
    setSheetOpen(false);
  };

  const handleDeleteBranch = () => {
    if (editingBranchIndex === null) return;
    const branches = (profile.showroomBranches || []).filter(
      (_, i) => i !== editingBranchIndex
    );
    setProfile({ ...profile, showroomBranches: branches });
    setIsDirty(true);
    setShowDeleteConfirm(false);
    setSheetOpen(false);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading store profile...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Store Profile"
        description="Public brand name, contact channels, and physical showroom outlets."
      />

      {statusMessage && (
        <div className="p-3 rounded-lg bg-card border border-border text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <Button variant="ghost" size="sm" onClick={() => setStatusMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Group 1: Store Identity */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Brand Identity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your public business name, promotional tagline, and site logo.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Store name
            </label>
            <Input
              value={profile.name || ""}
              disabled={!canEdit}
              placeholder="e.g. Laptop Point BD"
              onChange={(e) => {
                setProfile({ ...profile, name: e.target.value });
                setIsDirty(true);
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Tagline
            </label>
            <Input
              value={profile.tagline || ""}
              disabled={!canEdit}
              placeholder="e.g. Exclusive Laptop Shop in Bangladesh"
              onChange={(e) => {
                setProfile({ ...profile, tagline: e.target.value });
                setIsDirty(true);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Logo asset path
              </label>
              <Input
                value={profile.logo || ""}
                disabled={!canEdit}
                placeholder="/icons/logo.png"
                onChange={(e) => {
                  setProfile({ ...profile, logo: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Favicon path
              </label>
              <Input
                value={profile.favicon || ""}
                disabled={!canEdit}
                placeholder="/favicon/favicon.ico"
                onChange={(e) => {
                  setProfile({ ...profile, favicon: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6" />

      {/* Group 2: Contact Numbers & Support */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Contact & Support</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phone numbers, email addresses, and messaging channels shown to customers.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Primary hotline
              </label>
              <Input
                value={profile.hotline || ""}
                disabled={!canEdit}
                placeholder="+880 1703-808715"
                onChange={(e) => {
                  setProfile({ ...profile, hotline: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Sales phone
              </label>
              <Input
                value={profile.salesPhone || ""}
                disabled={!canEdit}
                placeholder="+880 1935-701029"
                onChange={(e) => {
                  setProfile({ ...profile, salesPhone: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Support phone
              </label>
              <Input
                value={profile.supportPhone || ""}
                disabled={!canEdit}
                placeholder="+880 1830-515157"
                onChange={(e) => {
                  setProfile({ ...profile, supportPhone: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Official email
              </label>
              <Input
                value={profile.email || ""}
                disabled={!canEdit}
                placeholder="info@example.com"
                onChange={(e) => {
                  setProfile({ ...profile, email: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                WhatsApp number
              </label>
              <Input
                value={profile.whatsapp || ""}
                disabled={!canEdit}
                placeholder="+880 1703-808715"
                onChange={(e) => {
                  setProfile({ ...profile, whatsapp: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6" />

      {/* Group 3: Showroom Branches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Showroom Branches</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Physical branch outlets. Click any row to edit details or delete.
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAddBranch}
              className="gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Branch</span>
            </Button>
          )}
        </div>

        {/* Compact List Rows with Reorder */}
        <div className="space-y-2 pt-1">
          {(!profile.showroomBranches || profile.showroomBranches.length === 0) ? (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
              No showroom branches added yet.
            </div>
          ) : (
            profile.showroomBranches.map((branch, idx) => (
              <CompactListRow
                key={branch.id || idx}
                title={branch.name || `Branch #${idx + 1}`}
                subtitle={`${branch.phone || profile.hotline || "No phone"} • ${branch.address || "No address"}`}
                index={idx}
                total={profile.showroomBranches.length}
                disabled={!canEdit}
                onMoveUp={() => moveBranch(idx, "up")}
                onMoveDown={() => moveBranch(idx, "down")}
                onEdit={() => handleOpenEditBranch(idx)}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit/Create Branch Side Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingBranchIndex !== null ? "Edit Branch" : "Add Branch"}
            </SheetTitle>
            <SheetDescription>
              Configure the branch name, hotline, opening hours, and address.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-6 py-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Branch name
              </label>
              <Input
                value={branchDraft.name}
                disabled={!canEdit}
                placeholder="e.g. Mirpur-10 Outlet"
                onChange={(e) =>
                  setBranchDraft({ ...branchDraft, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Branch phone / hotline
              </label>
              <Input
                value={branchDraft.phone}
                disabled={!canEdit}
                placeholder="+880 1703-808715"
                onChange={(e) =>
                  setBranchDraft({ ...branchDraft, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Opening hours
              </label>
              <Input
                value={branchDraft.hours}
                disabled={!canEdit}
                placeholder="Open Everyday: 10:00 AM - 9:00 PM"
                onChange={(e) =>
                  setBranchDraft({ ...branchDraft, hours: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Google Maps URL
              </label>
              <Input
                value={branchDraft.mapLink || ""}
                disabled={!canEdit}
                placeholder="https://maps.google.com/..."
                onChange={(e) =>
                  setBranchDraft({ ...branchDraft, mapLink: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Physical address
              </label>
              <Textarea
                rows={3}
                value={branchDraft.address}
                disabled={!canEdit}
                placeholder="Full address details..."
                onChange={(e) =>
                  setBranchDraft({ ...branchDraft, address: e.target.value })
                }
              />
            </div>
          </div>

          <SheetFooter className="flex-row justify-between sm:justify-between gap-2 border-t border-border pt-4 mt-auto">
            {editingBranchIndex !== null && canEdit ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
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
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
              {canEdit && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveBranchSheet}
                  disabled={!branchDraft.name.trim()}
                >
                  Save Branch
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Branch Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Branch"
        description={`Are you sure you want to remove "${branchDraft.name}"? This branch will be removed from your store profile.`}
        confirmText="Delete Branch"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteBranch}
      />

      {/* Bottom SaveBar (Only shown when dirty) */}
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
