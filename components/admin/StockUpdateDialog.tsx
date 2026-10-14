"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface StockUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    variantId?: string;
    name: string;
    variantLabel?: string;
    currentStock: number;
  } | null;
  onSuccess: (newStock: number, variantId?: string) => void;
}

export function StockUpdateDialog({
  isOpen,
  onClose,
  product,
  onSuccess,
}: StockUpdateDialogProps) {
  const [newStock, setNewStock] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { error } = useToast();

  const handleUpdate = () => {
    if (!product || !newStock) return;

    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      error("Please enter a valid stock quantity (0 or greater)");
      return;
    }

    setIsUpdating(true);
    onSuccess(stockValue, product.variantId);
    onClose();
    setNewStock("");
    setIsUpdating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
          <DialogDescription>
            Update the stock quantity for {product?.name}
            {product?.variantLabel ? ` (${product.variantLabel})` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Stock</Label>
            <div className="text-2xl font-bold">
              {product?.currentStock || 0}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newStock">New Stock Quantity</Label>
            <Input
              id="newStock"
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Enter new stock quantity"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
