"use client";

import OrderSummary from "@/components/application/OrderSummary";
import { useCart } from "@/contexts/CartContext";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics/tracker";
import { formatBDT } from "@/lib/format";
import type { StorefrontCommerce } from "@/lib/public-content";
import { CheckoutFormData, PaymentMethod } from "@/types/cart";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function CheckoutClient({
  commerce,
}: {
  commerce: StorefrontCommerce;
}) {
  const { items, clearCart, getCartTotal, getSubtotal, getShipping } =
    useCart();
  const router = useRouter();

  const iconForMethod: Record<string, typeof Banknote> = {
    cod: Banknote,
    bkash: Smartphone,
    nagad: Wallet,
    card: CreditCard,
    emi: CreditCard,
  };

  const enabledPaymentMethods = (
    commerce?.paymentMethods?.filter((m) => m.enabled) ?? [
      { id: "cod", name: "Cash on Delivery", description: "Pay when you receive", enabled: true },
    ]
  ).map((m) => ({
    id: m.id as PaymentMethod,
    name: m.name,
    icon: iconForMethod[m.id] || Banknote,
    description: m.description,
  }));

  const initialPayment = (enabledPaymentMethods[0]?.id as PaymentMethod) || "cod";
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(initialPayment);
  const [selectedZone, setSelectedZone] = useState<string>("dhaka");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalValue: getCartTotal(),
      });
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${data.firstName} ${data.lastName}`,
          customerPhone: data.phone,
          customerEmail: data.email,
          address: data.address,
          city: data.city,
          district: data.district,
          postalCode: data.postalCode,
          paymentMethod: selectedPayment,
          shippingMethod: selectedZone,
          notes: data.orderNotes,
          _hp: data._hp,
          _t: mountedAt,
          items: items.map((item) => ({
            productId: item.id,
            sku: item.id,
            name: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
          })),
          subtotal: getSubtotal(),
          shippingCost: getShipping(),
          totalAmount: getCartTotal(),
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        orderNumber?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "Failed to place order. Please try again.",
        );
      }

      setOrderNumber(result.orderNumber ?? null);
      setOrderPlaced(true);

      trackPurchase({
        orderId: result.orderNumber || `LP-${Date.now()}`,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalValue: getCartTotal(),
      });

      clearCart();
      setTimeout(() => router.push("/"), 5000);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Add items to your cart before checking out.
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Order Placed Successfully!
            </h1>
            {orderNumber && (
              <p className="text-lg font-semibold text-primary mb-2">
                Order #{orderNumber}
              </p>
            )}
            <p className="text-muted-foreground mb-2">
              Thank you for your order. We will contact you shortly to confirm
              delivery.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Redirecting to home page in 5 seconds…
            </p>
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">
            Checkout
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your order with secure delivery and flexible payment options
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Honeypot anti-bot input */}
          <input
            type="text"
            {...register("_hp")}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            style={{ display: "none" }}
            aria-hidden="true"
          />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
                  Customer Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                      aria-invalid={errors.firstName ? true : undefined}
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                        errors.firstName
                          ? "border-red-500"
                          : "border-border"
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p id="firstName-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                      aria-invalid={errors.lastName ? true : undefined}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                        errors.lastName
                          ? "border-red-500"
                          : "border-border"
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p id="lastName-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      autoComplete="email"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                        errors.email ? "border-red-500" : "border-border"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p id="email-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^(\+?880|0)1[3-9]\d{8}$/,
                          message: "Invalid Bangladeshi phone number",
                        },
                      })}
                      autoComplete="tel"
                      aria-invalid={errors.phone ? true : undefined}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                        errors.phone ? "border-red-500" : "border-border"
                      }`}
                      placeholder="01712345678"
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      autoComplete="street-address"
                      aria-invalid={errors.address ? true : undefined}
                      aria-describedby={
                        errors.address ? "address-error" : undefined
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                        errors.address ? "border-red-500" : "border-border"
                      }`}
                      placeholder="House/Flat, Street, Area"
                    />
                    {errors.address && (
                      <p id="address-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        {...register("city", { required: "City is required" })}
                        autoComplete="address-level2"
                        aria-invalid={errors.city ? true : undefined}
                        aria-describedby={errors.city ? "city-error" : undefined}
                        className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                          errors.city ? "border-red-500" : "border-border"
                        }`}
                        placeholder="Dhaka"
                      />
                      {errors.city && (
                        <p id="city-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="district"
                        {...register("district", {
                          required: "District is required",
                        })}
                        autoComplete="address-level1"
                        aria-invalid={errors.district ? true : undefined}
                        aria-describedby={
                          errors.district ? "district-error" : undefined
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                          errors.district ? "border-red-500" : "border-border"
                        }`}
                        placeholder="Dhaka"
                      />
                      {errors.district && (
                        <p id="district-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                          {errors.district.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="postalCode"
                        {...register("postalCode", {
                          required: "Postal code is required",
                        })}
                        autoComplete="postal-code"
                        aria-invalid={errors.postalCode ? true : undefined}
                        aria-describedby={
                          errors.postalCode ? "postalCode-error" : undefined
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${
                          errors.postalCode ? "border-red-500" : "border-border"
                        }`}
                        placeholder="1207"
                      />
                      {errors.postalCode && (
                        <p id="postalCode-error" className="text-red-500 text-xs font-medium mt-1.5" role="alert">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Zone Options */}
                {commerce?.deliveryZones && commerce.deliveryZones.length > 0 && (
                  <div className="mt-6 border-t border-border pt-4">
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Select Delivery Method
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {commerce.deliveryZones
                        .filter((z) => z.active)
                        .map((zone) => (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => setSelectedZone(zone.id)}
                            className={`p-3.5 text-left border rounded-lg transition-all ${
                              selectedZone === zone.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground">
                                {zone.name}
                              </span>
                              <span className="text-xs font-bold text-primary shrink-0">
                                {zone.fee === 0 ? "Free" : formatBDT(zone.fee)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{zone.timeline}</p>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
                  Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {enabledPaymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id)}
                        aria-pressed={selectedPayment === method.id}
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                          selectedPayment === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                            selectedPayment === method.id
                              ? "bg-primary text-white"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <Icon className="w-6 h-6" aria-hidden="true" />
                          {selectedPayment === method.id && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm sm:text-base font-semibold text-foreground">
                            {method.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {method.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
                  Order Notes (Optional)
                </h2>
                <textarea
                  id="orderNotes"
                  {...register("orderNotes")}
                  rows={4}
                  aria-label="Order notes (optional)"
                  className="w-full px-4 py-3 border border-border rounded-lg text-base sm:text-sm placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                  placeholder="Any special instructions for your order..."
                />
              </div>

              {/* Terms and Place Order */}
              <div className="bg-white dark:bg-card rounded-xl border border-border/30 p-6">
                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("agreeToTerms", {
                      required: "You must agree to the terms",
                    })}
                    className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I have read and agree to the website{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-primary hover:underline"
                      target="_blank"
                    >
                      terms and conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-primary hover:underline"
                      target="_blank"
                    >
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-xs font-medium mb-4" role="alert">
                    {errors.agreeToTerms.message}
                  </p>
                )}

                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {submitError}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold tracking-wide hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <OrderSummary showCheckoutButton={false} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
