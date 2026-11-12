"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-45 rounded-2xl bg-white/98 dark:bg-card/98 backdrop-blur-md p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,43,96,0.18)] border border-neutral-200/90 dark:border-border ring-1 ring-black/5"
          role="region"
          aria-label="Cookie consent banner"
        >
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#002b60]/10 text-[#002b60] dark:bg-primary/20 dark:text-primary">
                <Cookie className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-foreground tracking-tight">
                  Cookie &amp; Privacy Policy
                </h4>
                <p className="text-[10px] text-neutral-400">
                  Laptop Point Bangladesh
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDecline}
              className="h-9 w-9 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-muted transition-colors cursor-pointer"
              aria-label="Dismiss cookie notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
            We use cookies to enhance your browsing experience, remember
            cart items, and analyze site performance. By clicking &quot;Accept&quot;,
            you agree to our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#002b60] dark:text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 min-h-[44px] rounded-xl border border-neutral-200 dark:border-border bg-white dark:bg-card px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-muted hover:text-neutral-900 dark:hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 min-h-[44px] rounded-xl bg-[#002b60] hover:bg-[#002047] px-3 py-2 text-xs font-bold text-white shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Accept Cookies</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
