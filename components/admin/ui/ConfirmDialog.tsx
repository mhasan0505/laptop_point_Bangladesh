"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  trigger?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  confirmLabel,
  cancelText = "Cancel",
  variant = "danger",
  destructive,
  loading = false,
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const effectiveVariant = destructive ? "danger" : variant;
  const effectiveConfirmText = confirmLabel || confirmText;

  const icon = {
    danger: <AlertCircle className="h-5 w-5 text-danger" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    default: <Info className="h-5 w-5 text-info" />,
  }[effectiveVariant];

  const confirmButtonVariant = {
    danger: "destructive" as const,
    warning: "default" as const,
    default: "default" as const,
  }[effectiveVariant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              {icon}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            disabled={loading}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {effectiveConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
