"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useEffect } from "react";

type AdminQuickCreateModalProps = {
  open: boolean;
  entityLabel: string;
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  error?: string;
  placeholder?: string;
  confirmLabel?: string;
};

export function AdminQuickCreateModal({
  open,
  entityLabel,
  value,
  onValueChange,
  onClose,
  onConfirm,
  error,
  placeholder,
  confirmLabel = "Create & Select",
}: AdminQuickCreateModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Create ${entityLabel}`}
          className={`w-full max-w-md rounded-2xl border border-white/20 bg-white shadow-2xl transition-all duration-300 ${
            open
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          <div className="relative overflow-hidden rounded-t-2xl border-b border-gray-100 bg-linear-to-r from-gray-50 to-white p-6">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gray-900/5" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-gray-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Quick Create
                </p>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  Add new {entityLabel}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  It will be selected immediately for this product.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {entityLabel} name
            </label>
            <input
              type="text"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onConfirm();
                }
              }}
              autoFocus
              placeholder={placeholder || `Enter ${entityLabel.toLowerCase()}`}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                className="bg-black text-white hover:bg-gray-800"
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
