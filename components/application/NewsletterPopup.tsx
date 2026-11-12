"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Sparkles, X } from "lucide-react";
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
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
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
      setSubscribeMsg(
        err instanceof Error ? err.message : "Subscription failed",
      );
    }
  };

  useEffect(() => {
    // Check if dismissed within 24 hours
    const lastDismissed = localStorage.getItem("superDealsPopupDismissed");
    if (lastDismissed) {
      const parsedTime = Number.parseInt(lastDismissed, 10);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - parsedTime < oneDayInMs) {
        return;
      }
    }

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const delay = isMobile ? 8000 : 5000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("superDealsPopupDismissed", Date.now().toString());
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/60 backdrop-blur-[4px]">
          {/* Overlay click to dismiss */}
          <div
            className="absolute inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Minimal Newsletter & Coupon Card */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              duration: 0.22,
            }}
            className="relative z-10 w-full max-w-[390px] rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,43,96,0.22),0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200/90 overflow-hidden text-slate-800"
            role="dialog"
            aria-modal="true"
            aria-labelledby="minimal-newsletter-title"
          >
            {/* Top Close Button */}
            <button
              type="button"
              aria-label="Close newsletter popup"
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header Accent Bar */}
            <div className="bg-[#002b60] px-5 pt-5 pb-4 text-white relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold tracking-wider uppercase text-white mb-2">
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>Special Promo</span>
              </div>

              <h3
                id="minimal-newsletter-title"
                className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug"
              >
                Get Up to <span className="text-amber-300">৳5,000 OFF</span>
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                Unlock instant secret discounts, free 5-in-1 gifts &amp; weekly laptop drops.
              </p>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-5 space-y-3.5 bg-white">
              {/* Minimal 1-Click Coupon Code */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-600">
                    Coupon Code
                  </span>
                  <span className="font-mono text-sm font-bold text-[#002b60] tracking-wider">
                    {couponCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#002b60] transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Minimal Subscription Form */}
              <form onSubmit={handleNewsletterSubmit} className="space-y-1.5">
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
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002b60]/20 focus:border-[#002b60] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={subscribeStatus === "submitting"}
                    className="px-3.5 py-2 bg-[#dc0303] hover:bg-[#b80202] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
                  >
                    {subscribeStatus === "submitting" ? "..." : "Subscribe"}
                  </button>
                </div>
                {subscribeMsg && (
                  <p
                    className={`text-[11px] font-medium ${
                      subscribeStatus === "success"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {subscribeMsg}
                  </p>
                )}
              </form>

              {/* Quick Actions (Deals & WhatsApp) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/deals"
                  onClick={handleClose}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors text-center"
                >
                  <span>View Deals</span>
                  <span>→</span>
                </Link>

                <button
                  type="button"
                  onClick={handleClaimWhatsApp}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  <WhatsAppMiniIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Minimal Trust Micro-text */}
              <p className="text-[10px] text-center text-slate-600 leading-tight">
                15 Days Replacement • 5 Years Service • No Spam Ever
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
