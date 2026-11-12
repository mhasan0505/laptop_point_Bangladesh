"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { event as trackPixelEvent } from "@/lib/fpixel";
import type { StorefrontContact } from "@/lib/public-content";

// ── Official Brand Vector Icons ─────────────────────────────────────────────
const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const MessengerIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.093.303 2.253.466 3.443.466 6.627 0 12-4.975 12-11.113C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.963z" />
  </svg>
);

export default function WhatsAppButton({
  contact,
}: {
  contact?: StorefrontContact;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Derived contact details
  const rawWa = contact?.whatsapp || contact?.hotline || "8801612182408";
  const cleanWa = rawWa.replace(/[^0-9]/g, "");
  const whatsappNumber = cleanWa.startsWith("880")
    ? cleanWa
    : cleanWa.startsWith("0")
    ? `88${cleanWa}`
    : cleanWa || "8801612182408";

  const defaultMessage =
    "Hi Laptop Point BD! I am interested in buying a laptop. Please share current stock and best price.";

  // Messenger URL
  let messengerUrl = "https://m.me/laptoppointbd";
  if (contact?.social?.facebook) {
    try {
      const fbUrl = contact.social.facebook.trim().replace(/\/+$/, "");
      const handle = fbUrl.split("/").pop();
      if (handle && handle !== "facebook.com" && handle !== "www.facebook.com") {
        messengerUrl = `https://m.me/${handle}`;
      }
    } catch {
      // fallback
    }
  }

  const hotlinePhone = contact?.hotline || "+8801612182408";

  // Quick preset questions (concise & relevant)
  const quickQuestions = [
    {
      label: "Check In-Stock Laptops & Prices",
      query:
        "Hi Laptop Point BD, can you share the latest in-stock laptops and best prices?",
    },
    {
      label: "EMI & 0% Installment Facilities",
      query:
        "Hello! What are the EMI / 0% installment options available at Laptop Point?",
    },
    {
      label: "Mirpur 10 Showroom Location",
      query:
        "Hi, what is your Mirpur 10 showroom location and visiting hours?",
    },
  ];

  // Subtle invitation hint after 4s (dismissible)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = (customText?: string) => {
    try {
      trackPixelEvent("Contact", { contact_type: "whatsapp" });
    } catch {
      // ignore
    }
    const text = customText || defaultMessage;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMessengerClick = () => {
    try {
      trackPixelEvent("Contact", { contact_type: "messenger" });
    } catch {
      // ignore
    }
    window.open(messengerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <aside
      aria-label="Customer Live Support Hub"
      className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none font-sans"
    >
      {/* ── MINIMAL POPUP WINDOW ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
              duration: 0.22,
            }}
            className="mb-2.5 w-[calc(100vw-28px)] sm:w-[330px] max-w-[340px] rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,43,96,0.18),0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200/90 overflow-hidden ring-1 ring-black/5"
          >
            {/* Minimal Header */}
            <div className="bg-[#002b60] px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative h-8 w-8 rounded-lg bg-white p-1 shadow-xs flex items-center justify-center shrink-0">
                  <Image
                    src="/Logo.webp"
                    alt="Laptop Point BD"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-bold text-[13px] tracking-tight">
                      Laptop Point BD
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  </div>
                  <p className="text-[10px] text-white/80 mt-1 flex items-center gap-1 leading-none font-medium">
                    Usually replies in &lt; 5 mins
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Greeting */}
            <div className="px-4 pt-3 pb-2 bg-slate-50/70 border-b border-slate-100">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                👋 Hello! Looking for a verified laptop? Chat directly with our
                specialists for instant recommendations &amp; price deals.
              </p>
            </div>

            {/* Direct Connect Buttons (2-Up Minimal Grid) */}
            <div className="p-3.5 space-y-2 bg-white">
              <div className="grid grid-cols-2 gap-2">
                {/* WhatsApp Direct */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppClick()}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold text-xs shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </button>

                {/* Messenger Direct */}
                <button
                  type="button"
                  onClick={handleMessengerClick}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MessengerIcon className="w-4 h-4 shrink-0" />
                  <span>Messenger</span>
                </button>
              </div>

              {/* Quick Inquiry Prompts */}
              <div className="pt-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#dc0303]" />
                  <span>Instant Questions (1-Tap WhatsApp)</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => handleWhatsAppClick(q.query)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 text-[11px] font-medium text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{q.label}</span>
                      <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                        Ask →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Links: Hotline & Outlet */}
              <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] px-1 text-slate-500">
                <a
                  href={`tel:${hotlinePhone}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#002b60] hover:text-[#dc0303] transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#dc0303]" />
                  <span>Call: 01612-182408</span>
                </a>
                <a
                  href="https://maps.google.com/?q=Laptop+Point+Mirpur+10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#002b60] transition-colors"
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Mirpur 10 Outlet</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING LAUNCHER TRIGGER ───────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Subtle greeting bubble (shows once, dismissible) */}
        <AnimatePresence>
          {showPrompt && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-[0_6px_20px_rgba(0,43,96,0.12)] border border-slate-200/90 text-xs font-semibold text-slate-800 cursor-pointer hover:border-[#002b60]/50 transition-all group"
              onClick={() => {
                setIsOpen(true);
                setShowPrompt(false);
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Need help? Chat with us!</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrompt(false);
                }}
                className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss greeting"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Unified Launcher Button */}
        <motion.button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (showPrompt) setShowPrompt(false);
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`relative flex items-center gap-2 h-12 px-3.5 sm:px-4 rounded-full shadow-[0_8px_24px_rgba(0,43,96,0.22)] border border-white/20 text-white transition-all cursor-pointer ${
            isOpen
              ? "bg-slate-900"
              : "bg-gradient-to-r from-[#002b60] via-[#0b3875] to-[#128C7E] hover:from-[#002047] hover:to-[#0f766a]"
          }`}
          title={isOpen ? "Close Chat" : "Live Chat with Laptop Point"}
          aria-label={isOpen ? "Close live chat" : "Open live chat with Laptop Point BD"}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              {/* Online pulse indicator */}
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>

              <WhatsAppIcon className="h-5 w-5 shrink-0" />

              <span className="text-xs font-bold tracking-tight pr-0.5">
                Chat
              </span>
            </>
          )}
        </motion.button>
      </div>
    </aside>
  );
}


