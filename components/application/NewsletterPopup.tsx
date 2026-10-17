"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Gift,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { event as trackPixelEvent } from "@/lib/fpixel";

// WhatsApp vector icon
const WhatsAppMiniIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mountedAt] = useState(() => Date.now());
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [subscribeMsg, setSubscribeMsg] = useState("");

  const couponCode = "LPDEAL5K";
  const whatsappUrl = `https://wa.me/8801612182408?text=${encodeURIComponent(
    `Hi Laptop Point BD! I want to claim the Super Deal Offer with coupon code ${couponCode}. Please share the available laptop models!`,
  )}`;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribeStatus("submitting");
    setSubscribeMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          _hp: honeypot,
          _t: mountedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setSubscribeStatus("success");
      setSubscribeMsg("Coupon & deal alerts sent to your email!");
      setEmail("");
      setHoneypot("");
    } catch (err) {
      setSubscribeStatus("error");
      setSubscribeMsg(err instanceof Error ? err.message : "Subscription failed");
    }
  };

  useEffect(() => {
    // Check if user has already dismissed the offer within the last 24 hours
    const lastDismissed = localStorage.getItem("superDealsPopupDismissed");
    if (lastDismissed) {
      const parsedTime = Number.parseInt(lastDismissed, 10);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - parsedTime < oneDayInMs) {
        return; // Don't show again within 24 hours
      }
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const delay = isMobile ? 8000 : 4500;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(
      "superDealsPopupDismissed",
      Date.now().toString(),
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimWhatsApp = () => {
    try {
      trackPixelEvent("Contact", { contact_type: "super_deal_offer" });
    } catch {
      // ignore
    }
    handleClose();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
          {/* Overlay click to dismiss */}
          <div
            className="absolute inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-neutral-100"
            role="dialog"
            aria-modal="true"
            aria-labelledby="super-deal-title"
          >
            {/* Top Close Button */}
            <button
              type="button"
              aria-label="Close deal popup"
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/40 text-white backdrop-blur-md hover:bg-neutral-900/60 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* ── LEFT BANNER COLUMN: VISUAL BRANDING ─────────────────── */}
              <div className="relative md:col-span-5 bg-gradient-to-br from-[#001e42] via-[#002b60] to-[#0a3875] p-6 text-white flex flex-col justify-between overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-rose-500/20 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                    <Sparkles className="h-3 w-3" />
                    <span>Special Offer</span>
                  </div>

                  <h4 className="mt-3 text-xl sm:text-2xl font-black leading-tight tracking-tight text-white">
                    Mega Laptop <br />
                    <span className="text-[#dc0303] bg-white px-2 py-0.5 rounded-md inline-block mt-1">
                      Super Deals
                    </span>
                  </h4>
                  <p className="mt-2 text-xs text-neutral-200">
                    Get up to <strong className="text-white font-bold">৳5,000 OFF</strong> on genuine certified laptops!
                  </p>
                </div>

                {/* Laptop Showcase Image */}
                <div className="relative z-10 my-4 flex justify-center">
                  <div className="relative h-32 sm:h-36 w-full max-w-[200px]">
                    <Image
                      src="/Hero_Image.png"
                      alt="Super Deal Laptop"
                      fill
                      className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
                      priority
                    />
                  </div>
                </div>

                <div className="relative z-10 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 text-[11px] text-neutral-200 border border-white/10">
                  <span className="block font-bold text-white">
                    📍 Mirpur-10, Dhaka
                  </span>
                  <span>15 Days Replacement • 5 Years Warranty</span>
                </div>
              </div>

              {/* ── RIGHT COLUMN: OFFER DETAILS & ACTIONS ───────────────── */}
              <div className="md:col-span-7 p-5 sm:p-7 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Limited Time Promo
                    </span>
                  </div>

                  <h3
                    id="super-deal-title"
                    className="mt-1 text-lg sm:text-xl font-bold text-neutral-900 tracking-tight"
                  >
                    Claim Your Exclusive Bonus Package
                  </h3>

                  <p className="text-xs text-neutral-500 mt-1">
                    Order online or visit our showroom to enjoy instant discounts &amp; gift hamper.
                  </p>

                  {/* Bullet perks */}
                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Gift className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold text-neutral-900">
                          Free 5-in-1 Accessories Pack:
                        </strong>{" "}
                        <span className="text-neutral-500">
                          Bag, Wireless Mouse, Mousepad &amp; Screen Protector
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold text-neutral-900">
                          100% Guaranteed Protection:
                        </strong>{" "}
                        <span className="text-neutral-500">
                          15 Days Replacement &amp; 5 Years Free Servicing
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[#dc0303]">
                        <Tag className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <strong className="font-semibold text-neutral-900">
                          0% Interest EMI:
                        </strong>{" "}
                        <span className="text-neutral-500">
                          Available on 30+ leading Bangladeshi banks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code Strip */}
                  <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Discount Coupon Code
                      </p>
                      <p className="text-sm font-black tracking-widest text-[#002b60]">
                        {couponCode}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-xs border border-neutral-200 hover:bg-neutral-100 hover:text-[#002b60] transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">
                            Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-neutral-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Email newsletter subscription with bot friction */}
                  <form onSubmit={handleNewsletterSubmit} className="mt-3.5 space-y-1.5">
                    <input
                      type="text"
                      name="_hp"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />
                    <div className="flex gap-1.5">
                      <input
                        type="email"
                        required
                        placeholder="Enter email to get deal alerts"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-neutral-50/70 focus:bg-white focus:outline-none focus:border-[#002b60] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={subscribeStatus === "submitting"}
                        className="px-3 py-1.5 bg-[#002b60] text-white text-xs font-bold rounded-xl hover:bg-[#002047] transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {subscribeStatus === "submitting" ? "..." : "Subscribe"}
                      </button>
                    </div>
                    {subscribeMsg && (
                      <p className={`text-[10px] ${subscribeStatus === "success" ? "text-emerald-600 font-bold" : "text-rose-500"}`}>
                        {subscribeMsg}
                      </p>
                    )}
                  </form>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2">
                  <Link
                    href="/deals"
                    onClick={handleClose}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#dc0303] to-[#b30000] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-red-500/20 hover:from-[#b30000] hover:to-[#900000] transition-all cursor-pointer"
                  >
                    <span>Browse All Super Deals</span>
                    <span>→</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleClaimWhatsApp}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <WhatsAppMiniIcon className="h-4 w-4 text-emerald-600" />
                    <span>Claim Offer via WhatsApp (+880 1612-182408)</span>
                  </button>

                  <p className="text-[10px] text-center text-neutral-400 pt-1">
                    * Offer valid while promotional stocks last. Cannot be combined with other special clearances.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
