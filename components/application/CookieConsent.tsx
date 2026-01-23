"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-16 left-0 right-0 z-40 p-3 md:p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:bottom-0 md:bottom-0 sm:bottom-20"
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="text-gray-600 text-xs md:text-base text-center md:text-left flex-1">
              <p className="line-clamp-2 md:line-clamp-none">
                We use cookies to enhance your browsing experience, serve
                personalized ads or content, and analyze our traffic. By
                clicking &quot;Accept&quot;, you consent to our use of cookies.{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Read our Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-2 md:gap-4 shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsVisible(false)}
                className="flex-1 md:flex-none px-4 md:px-6 py-2 text-xs md:text-sm text-gray-600 font-semibold hover:text-gray-900 transition-colors border border-gray-300 rounded-lg md:rounded-lg"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 md:flex-none px-4 md:px-6 py-2 text-xs md:text-sm bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
