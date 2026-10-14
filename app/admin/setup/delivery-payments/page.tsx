"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SaveBar } from "@/components/admin/ui/SaveBar";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  type CommerceSettings,
  SETTINGS_GROUP_REGISTRY,
} from "@/lib/settings-base";

interface DeliveryZoneItem {
  id: string;
  name: string;
  fee: number;
  timeline: string;
  description?: string;
  active: boolean;
}

interface PaymentMethodItem {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export default function DeliveryPaymentsSetupPage() {
  const { canWrite, isDirty, setIsDirty, refreshSettings } = useSetup();
  const canEdit = canWrite("commerce");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [commerce, setCommerce] = useState<CommerceSettings>(
    SETTINGS_GROUP_REGISTRY.commerce.default
  );

  // Delivery Zone Sheet State
  const [zoneSheetOpen, setZoneSheetOpen] = useState(false);
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);
  const [zoneDraft, setZoneDraft] = useState<DeliveryZoneItem>({
    id: "",
    name: "",
    fee: 0,
    timeline: "",
    description: "",
    active: true,
  });
  const [showZoneDeleteConfirm, setShowZoneDeleteConfirm] = useState(false);

  // Payment Method Sheet State
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<PaymentMethodItem>({
    id: "",
    name: "",
    enabled: true,
    description: "",
  });

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup?group=commerce");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          setCommerce(data.value as CommerceSettings);
        }
      }
    } catch (err) {
      console.error("Error loading commerce settings:", err);
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [setIsDirty]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup?group=commerce");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.value) {
            setCommerce(data.value as CommerceSettings);
          }
        }
      } catch (err) {
        console.error("Error loading commerce settings:", err);
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
          group: "commerce",
          value: commerce,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save commerce settings");
      }

      setIsDirty(false);
      await refreshSettings();
      setStatusMessage("Delivery and payment settings saved successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setStatusMessage(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Zone actions
  const handleOpenAddZone = () => {
    setEditingZoneIndex(null);
    setZoneDraft({
      id: `zone-${Date.now()}`,
      name: "",
      fee: 0,
      timeline: "24-48 hours",
      description: "",
      active: true,
    });
    setZoneSheetOpen(true);
  };

  const handleOpenEditZone = (index: number) => {
    const target = commerce.deliveryZones?.[index];
    if (!target) return;
    setEditingZoneIndex(index);
    setZoneDraft({
      id: target.id || `zone-${index}`,
      name: target.name || "",
      fee: target.fee ?? 0,
      timeline: target.timeline || "",
      description: target.description || "",
      active: target.active !== false,
    });
    setZoneSheetOpen(true);
  };

  const handleSaveZone = () => {
    if (!zoneDraft.name.trim()) return;
    const zones = [...(commerce.deliveryZones || [])];
    if (editingZoneIndex !== null) {
      zones[editingZoneIndex] = zoneDraft;
    } else {
      zones.push(zoneDraft);
    }
    setCommerce({ ...commerce, deliveryZones: zones });
    setIsDirty(true);
    setZoneSheetOpen(false);
  };

  const handleDeleteZone = () => {
    if (editingZoneIndex === null) return;
    const zones = [...(commerce.deliveryZones || [])];
    zones.splice(editingZoneIndex, 1);
    setCommerce({ ...commerce, deliveryZones: zones });
    setIsDirty(true);
    setShowZoneDeleteConfirm(false);
    setZoneSheetOpen(false);
  };

  const moveZone = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const zones = [...(commerce.deliveryZones || [])];
    if (targetIndex < 0 || targetIndex >= zones.length) return;

    const temp = zones[index];
    zones[index] = zones[targetIndex];
    zones[targetIndex] = temp;

    setCommerce({ ...commerce, deliveryZones: zones });
    setIsDirty(true);
  };

  // Payment method actions
  const handleOpenEditPayment = (index: number) => {
    const target = commerce.paymentMethods?.[index];
    if (!target) return;
    setEditingPaymentIndex(index);
    setPaymentDraft({ ...target });
    setPaymentSheetOpen(true);
  };

  const handleSavePayment = () => {
    if (editingPaymentIndex === null) return;
    const methods = [...(commerce.paymentMethods || [])];
    methods[editingPaymentIndex] = paymentDraft;
    setCommerce({ ...commerce, paymentMethods: methods });
    setIsDirty(true);
    setPaymentSheetOpen(false);
  };

  const togglePaymentMethod = (index: number, enabled: boolean) => {
    const methods = [...(commerce.paymentMethods || [])];
    methods[index] = { ...methods[index], enabled };
    setCommerce({ ...commerce, paymentMethods: methods });
    setIsDirty(true);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground text-sm">
        Loading delivery and payment settings...
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto w-full space-y-8 pb-16">
      <PageHeader
        title="Delivery & Payments"
        description="Configure shipping rates, delivery zones, currency defaults, and accepted payment methods."
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

      {/* SECTION 1: CURRENCY & INVENTORY DEFAULTS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Currency & Stock Defaults</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Storewide pricing denomination and low inventory warning ceiling
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground">Currency Code</label>
            <Input
              value={commerce.currency || "BDT"}
              onChange={(e) => {
                setCommerce({ ...commerce, currency: e.target.value.toUpperCase() });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Currency Symbol</label>
            <Input
              value={commerce.currencySymbol || "৳"}
              onChange={(e) => {
                setCommerce({ ...commerce, currencySymbol: e.target.value });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Low Stock Threshold</label>
            <Input
              type="number"
              min={0}
              value={commerce.defaultLowStockThreshold ?? 10}
              onChange={(e) => {
                setCommerce({
                  ...commerce,
                  defaultLowStockThreshold: Math.max(0, parseInt(e.target.value) || 0),
                });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Tax Calculation Rule</label>
          <Select
            value={commerce.taxRule || "inclusive"}
            onValueChange={(val) => {
              if (val) {
                setCommerce({
                  ...commerce,
                  taxRule: val as "inclusive" | "exclusive" | "exempt",
                });
                setIsDirty(true);
              }
            }}
            disabled={!canEdit}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inclusive">Tax Included in Product Prices</SelectItem>
              <SelectItem value="exclusive">Tax Added at Checkout</SelectItem>
              <SelectItem value="exempt">Tax Exempt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 2: DELIVERY ZONES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Delivery Zones</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configured shipping regions, fees, and expected delivery turnaround
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAddZone}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Delivery Zone
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {(commerce.deliveryZones || []).map((zone, idx) => (
            <CompactListRow
              key={zone.id || idx}
              title={zone.name}
              subtitle={`${zone.fee === 0 ? "Free Shipping" : `${commerce.currencySymbol || "৳"} ${zone.fee}`} • ${zone.timeline}`}
              badge={<StatusBadge status={zone.active !== false ? "active" : "draft"} />}
              index={idx}
              total={(commerce.deliveryZones || []).length}
              onMoveUp={() => moveZone(idx, "up")}
              onMoveDown={() => moveZone(idx, "down")}
              onEdit={() => handleOpenEditZone(idx)}
              disabled={!canEdit}
            />
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 3: STANDARD SHIPPING RATES */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Legacy Standard Delivery Fees</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Default rate fallbacks for standard courier dispatch
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground">Inside Dhaka (৳)</label>
            <Input
              type="number"
              min={0}
              value={commerce.deliveryInsideDhakaFee ?? 0}
              onChange={(e) => {
                setCommerce({
                  ...commerce,
                  deliveryInsideDhakaFee: Math.max(0, parseFloat(e.target.value) || 0),
                });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Outside Dhaka (৳)</label>
            <Input
              type="number"
              min={0}
              value={commerce.deliveryOutsideDhakaFee ?? 0}
              onChange={(e) => {
                setCommerce({
                  ...commerce,
                  deliveryOutsideDhakaFee: Math.max(0, parseFloat(e.target.value) || 0),
                });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">VIP Express Courier (৳)</label>
            <Input
              type="number"
              min={0}
              value={commerce.vipDeliveryFee ?? 500}
              onChange={(e) => {
                setCommerce({
                  ...commerce,
                  vipDeliveryFee: Math.max(0, parseFloat(e.target.value) || 0),
                });
                setIsDirty(true);
              }}
              className="mt-1"
              disabled={!canEdit}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-border" />

      {/* SECTION 4: PAYMENT METHODS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Payment Methods</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supported checkout payment options
          </p>
        </div>

        <div className="space-y-2">
          {(commerce.paymentMethods || []).map((method, idx) => (
            <div
              key={method.id || idx}
              onClick={() => {
                if (canEdit) handleOpenEditPayment(idx);
              }}
              className={`flex items-center justify-between p-3 rounded-lg border border-border bg-card transition-colors ${
                canEdit ? "hover:bg-muted/50 cursor-pointer" : ""
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-xs font-semibold text-foreground">{method.name}</div>
                <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {method.description}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-muted-foreground">
                  {method.enabled ? "Enabled" : "Disabled"}
                </span>
                <Switch
                  checked={method.enabled}
                  onCheckedChange={(val) => togglePaymentMethod(idx, val)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DELIVERY ZONE SHEET */}
      <Sheet open={zoneSheetOpen} onOpenChange={setZoneSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingZoneIndex !== null ? "Edit Delivery Zone" : "Add Delivery Zone"}
            </SheetTitle>
            <SheetDescription>
              {editingZoneIndex !== null
                ? "Update zone shipping fees and timeline."
                : "Create a new regional shipping tier."}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Zone Title</label>
              <Input
                value={zoneDraft.name}
                placeholder="e.g. Inside Dhaka City, Chittagong Division"
                onChange={(e) => setZoneDraft({ ...zoneDraft, name: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">
                Shipping Fee ({commerce.currencySymbol || "৳"})
              </label>
              <Input
                type="number"
                min={0}
                value={zoneDraft.fee}
                onChange={(e) =>
                  setZoneDraft({ ...zoneDraft, fee: Math.max(0, parseFloat(e.target.value) || 0) })
                }
                className="mt-1"
                disabled={!canEdit}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Enter 0 for free delivery
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Estimated Timeline</label>
              <Input
                value={zoneDraft.timeline}
                placeholder="e.g. Same Day / 24h, 24 to 48 Hours"
                onChange={(e) => setZoneDraft({ ...zoneDraft, timeline: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Customer Notes</label>
              <Textarea
                rows={3}
                value={zoneDraft.description || ""}
                placeholder="Details shown to customer during checkout selection"
                onChange={(e) => setZoneDraft({ ...zoneDraft, description: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-medium text-foreground">Active Zone</div>
                <div className="text-[11px] text-muted-foreground">
                  Available for customers during checkout
                </div>
              </div>
              <Switch
                checked={zoneDraft.active}
                onCheckedChange={(val) => setZoneDraft({ ...zoneDraft, active: val })}
                disabled={!canEdit}
              />
            </div>

            {editingZoneIndex !== null && canEdit && (
              <div className="pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowZoneDeleteConfirm(true)}
                  className="w-full gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Delivery Zone
                </Button>
              </div>
            )}
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setZoneSheetOpen(false)}
            >
              Cancel
            </Button>
            {canEdit && (
              <Button
                type="button"
                size="sm"
                onClick={handleSaveZone}
                disabled={!zoneDraft.name.trim()}
              >
                {editingZoneIndex !== null ? "Apply Changes" : "Add Zone"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ZONE DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        open={showZoneDeleteConfirm}
        onOpenChange={setShowZoneDeleteConfirm}
        title="Delete Delivery Zone"
        description={`Are you sure you want to delete "${zoneDraft.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteZone}
      />

      {/* PAYMENT METHOD SHEET */}
      <Sheet open={paymentSheetOpen} onOpenChange={setPaymentSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Payment Method</SheetTitle>
            <SheetDescription>Configure payment method name and checkout instructions.</SheetDescription>
          </SheetHeader>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Display Name</label>
              <Input
                value={paymentDraft.name}
                onChange={(e) => setPaymentDraft({ ...paymentDraft, name: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Description / Instructions</label>
              <Textarea
                rows={3}
                value={paymentDraft.description}
                onChange={(e) => setPaymentDraft({ ...paymentDraft, description: e.target.value })}
                className="mt-1"
                disabled={!canEdit}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-medium text-foreground">Enabled for Checkout</div>
                <div className="text-[11px] text-muted-foreground">
                  Allow buyers to select this payment option
                </div>
              </div>
              <Switch
                checked={paymentDraft.enabled}
                onCheckedChange={(val) => setPaymentDraft({ ...paymentDraft, enabled: val })}
                disabled={!canEdit}
              />
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaymentSheetOpen(false)}
            >
              Cancel
            </Button>
            {canEdit && (
              <Button type="button" size="sm" onClick={handleSavePayment}>
                Apply Changes
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
