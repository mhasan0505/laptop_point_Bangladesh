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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/contexts/ToastContext";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface OrderDialogVariant {
  id?: string;
  name?: string;
  label?: string;
  price?: number | null;
  regularPrice?: number | null;
  originalPrice?: number | null;
  sku?: string;
  stock?: number;
}

interface OrderCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: Array<{
    id: string;
    sku: string;
    name: string;
    price: number | null;
    stock: number;
    variants?: OrderDialogVariant[];
  }>;
  onSuccess: () => void;
}

interface OrderItem {
  itemKey: string;
  productId: string;
  variantId?: string;
  productName: string;
  quantity: number;
  price: number;
  variantName?: string;
  variantSku?: string;
}

export function OrderCreateDialog({
  isOpen,
  onClose,
  products,
  onSuccess,
}: OrderCreateDialogProps) {
  const { success: showToast, error: showErrorToast } = useToast();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Dhaka");
  const [customerDistrict, setCustomerDistrict] = useState("Dhaka");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantKey, setSelectedVariantKey] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isCreating, setIsCreating] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedVariants = selectedProduct?.variants || [];

  const addItem = () => {
    if (!selectedProductId || !quantity) {
      showErrorToast("Please select a product and enter a quantity.");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      showErrorToast("Please enter a valid quantity (1 or more).");
      return;
    }

    const pickedVariant = selectedVariants.find((variant) => {
      const key = variant.sku || variant.label || variant.name || variant.id || "";
      return key === selectedVariantKey;
    });

    const variantName = pickedVariant?.label || pickedVariant?.name || undefined;
    const variantSku = pickedVariant?.sku || undefined;
    const variantId = pickedVariant?.id || undefined;
    const unitPrice =
      typeof pickedVariant?.price === "number" ? pickedVariant.price : (product.price ?? 0);
    const maxStock = typeof pickedVariant?.stock === "number" ? pickedVariant.stock : product.stock;

    if (qty > maxStock) {
      showErrorToast(`Only ${maxStock} units currently available in stock.`);
      return;
    }

    const compositeKey = `${product.id}__${variantId || variantSku || variantName || "default"}`;

    const existingIndex = orderItems.findIndex(
      (item) => item.itemKey === compositeKey
    );

    if (existingIndex > -1) {
      const existing = orderItems[existingIndex];
      const newTotalQty = existing.quantity + qty;
      if (newTotalQty > maxStock) {
        showErrorToast(`Cannot exceed available stock limit of ${maxStock}.`);
        return;
      }
      setOrderItems(
        orderItems.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: newTotalQty }
            : item
        )
      );
      showToast(`Updated quantity for ${product.name}`);
    } else {
      setOrderItems([
        ...orderItems,
        {
          itemKey: compositeKey,
          productId: product.id,
          variantId,
          productName: product.name,
          quantity: qty,
          price: unitPrice,
          variantName,
          variantSku,
        },
      ]);
      showToast(`Added ${product.name} to order items`);
    }

    setSelectedProductId("");
    setSelectedVariantKey("");
    setQuantity("1");
  };

  const removeItem = (itemKey: string) => {
    setOrderItems((prev) => prev.filter((item) => item.itemKey !== itemKey));
  };

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const grandTotal = subtotal + (Number(shippingCost) || 0);

  const handleCreateOrder = async () => {
    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();

    if (!trimmedName) {
      showErrorToast("Customer name is required.");
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 8) {
      showErrorToast("Valid phone number is required (e.g. +880 1712-345678).");
      return;
    }

    if (orderItems.length === 0) {
      showErrorToast("Please add at least one line item to the order.");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        customerEmail: customerEmail.trim() || undefined,
        address: customerAddress.trim() || undefined,
        city: customerCity.trim() || "Dhaka",
        district: customerDistrict.trim() || "Dhaka",
        postalCode: customerPostalCode.trim() || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
        items: orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            productId: item.productId,
            variantId: item.variantId,
            sku: item.variantSku || product?.sku || item.productId,
            name: item.productName,
            unitPrice: item.price,
            quantity: item.quantity,
            variantName: item.variantName,
            variantLabel: item.variantName,
            variantSku: item.variantSku,
          };
        }),
        subtotal,
        shippingCost: Number(shippingCost) || 0,
        totalAmount: grandTotal,
      };

      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("Order created successfully!");
        onSuccess();
        resetForm();
        onClose();
      } else {
        const errJson = await response.json().catch(() => ({}));
        showErrorToast(errJson.error || "Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("An error occurred while creating the order.");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerCity("Dhaka");
    setCustomerDistrict("Dhaka");
    setCustomerPostalCode("");
    setShippingCost(0);
    setPaymentMethod("cod");
    setNotes("");
    setOrderItems([]);
    setSelectedProductId("");
    setSelectedVariantKey("");
    setQuantity("1");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border scrollbar-clean">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground">
            Create Manual Customer Order
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter customer shipping details, select inventory items, configure delivery fees, and issue an order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Customer Information Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
              1. Customer & Delivery Destination
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-xs font-semibold">
                  Customer Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="h-8.5 text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customerPhone" className="text-xs font-semibold">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +880 1712-345678"
                  className="h-8.5 text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customerEmail" className="text-xs font-semibold">
                  Email Address (Optional)
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="h-8.5 text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customerCity" className="text-xs font-semibold">
                  City / Area
                </Label>
                <Input
                  id="customerCity"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="e.g. Mirpur-10, Dhaka"
                  className="h-8.5 text-xs bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <Label htmlFor="customerAddress" className="text-xs font-semibold">
                Street Address / Delivery Notes
              </Label>
              <Textarea
                id="customerAddress"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="House, road number, landmark details..."
                rows={2}
                className="text-xs bg-background resize-none"
              />
            </div>
          </div>

          {/* Add Products Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
              2. Purchased Hardware Items
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Select
                  value={selectedProductId}
                  onValueChange={(value) => {
                    if (value) setSelectedProductId(value);
                    setSelectedVariantKey("");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Select hardware model from catalog..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} className="text-xs">
                        <span className="font-semibold">{product.name}</span>{" "}
                        <span className="text-muted-foreground">
                          · {product.price !== null ? `৳${product.price.toLocaleString()}` : "Call For Price"} (Stock: {product.stock})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Qty"
                  className="w-20 h-9 text-xs text-center bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addItem}
                  className="h-9 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1 px-3"
                >
                  <Plus size={14} />
                  Add
                </Button>
              </div>
            </div>

            {selectedProduct && selectedVariants.length > 0 && (
              <div className="p-2.5 rounded-sm border border-border bg-muted/40 space-y-1.5">
                <Label htmlFor="variant" className="text-xs font-semibold text-foreground">
                  Select Model Configuration / Specs:
                </Label>
                <Select
                  value={selectedVariantKey}
                  onValueChange={(val) => {
                    if (val) setSelectedVariantKey(val);
                  }}
                >
                  <SelectTrigger id="variant" className="h-8.5 text-xs bg-background">
                    <SelectValue placeholder="Choose variant option (RAM / SSD / Color)" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedVariants.map((variant, index) => {
                      const key = variant.sku || variant.label || variant.name || variant.id || `${index}`;
                      const label = variant.label || variant.name || variant.sku || `Configuration ${index + 1}`;
                      return (
                        <SelectItem key={key} value={key} className="text-xs">
                          {label}
                          {typeof variant.price === "number"
                            ? ` - ৳${variant.price.toLocaleString()}`
                            : ""}
                          {typeof variant.stock === "number" ? ` (Stock: ${variant.stock})` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected Items List */}
            {orderItems.length > 0 ? (
              <div className="border border-border rounded-md divide-y divide-border overflow-hidden bg-background">
                {orderItems.map((item) => (
                  <div
                    key={item.itemKey}
                    className="flex items-center justify-between p-3 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-foreground truncate">
                        {item.productName}
                      </p>
                      {item.variantName && (
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                          Specs: {item.variantName}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ৳{item.price.toLocaleString()} × {item.quantity} ={" "}
                        <span className="font-bold text-foreground">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.itemKey)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-border rounded-md text-center text-xs text-muted-foreground">
                No items added yet. Choose a product and click &quot;Add&quot;.
              </div>
            )}
          </div>

          {/* Payment & Shipping Logistics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
              3. Payment Method & Shipping Charge
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod" className="text-xs font-semibold">
                  Payment Method
                </Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(val) => {
                    if (val) setPaymentMethod(val);
                  }}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="bkash">bKash (Mobile Banking)</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="card">Credit / Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Direct Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shippingCost" className="text-xs font-semibold flex items-center justify-between">
                  <span>Shipping Fee (৳)</span>
                  <span className="text-[10px] text-muted-foreground">0 for Free</span>
                </Label>
                <Input
                  id="shippingCost"
                  type="number"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8.5 text-xs bg-background font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <Label htmlFor="notes" className="text-xs font-semibold">
                Customer Instructions / Internal Order Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special courier notes, gift wrapping, warranty requests, etc."
                rows={2}
                className="text-xs bg-background resize-none"
              />
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="rounded-md border border-border bg-muted/40 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Item Subtotal</span>
              <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping Charge</span>
              <span className="font-semibold">
                {shippingCost === 0 ? "FREE" : `৳${Number(shippingCost).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-foreground border-t border-border pt-2 text-sm">
              <span>Grand Total</span>
              <span className="text-blue-600 dark:text-blue-400">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isCreating}
            className="text-xs font-semibold h-8.5"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreateOrder}
            disabled={isCreating || orderItems.length === 0}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold h-8.5 gap-1.5"
          >
            {isCreating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Creating Order...
              </>
            ) : (
              "Confirm & Create Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
