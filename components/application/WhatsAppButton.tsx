"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { event as trackPixelEvent } from "@/lib/fpixel";
import type { StorefrontContact } from "@/lib/public-content";

// ── Official Brand Vector Icons ─────────────────────────────────────────────
const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const MessengerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
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

  // Contact details derived from Store Profile single source of truth
  const rawWa = contact?.whatsapp || contact?.hotline || "8801612182408";
  const cleanWa = rawWa.replace(/[^0-9]/g, "");
  const whatsappNumber = cleanWa.startsWith("880")
    ? cleanWa
    : cleanWa.startsWith("0")
    ? `88${cleanWa}`
    : cleanWa || "8801612182408";

  const defaultMessage =
    "Hi Laptop Point BD! I am interested in buying a laptop. Please share the latest stock and best price.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    defaultMessage,
  )}`;

  // Facebook Messenger Direct link derived from Store Profile Facebook page URL
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

  // Quick preset questions that shoppers ask in Bangladesh
  const quickQuestions = [
    {
      label: "💻 Check Laptop Stock & Price",
      query:
        "Hi Laptop Point, can you share the current in-stock laptop list and prices?",
    },
    {
      label: "💳 EMI & Installment Facilities",
      query:
        "Hello! What are the EMI / installment options available for buying a laptop at Laptop Point?",
    },
    {
      label: "📍 Mirpur Showroom Location",
      query:
        "Hi, what is your Mirpur 10 showroom location and visiting hours?",
    },
    {
      label: "🛡️ Warranty & Replacement Info",
      query:
        "Hi, what warranty and replacement guarantee do you provide with laptops?",
    },
  ];

  // Show a gentle greeting hint after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);
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
      aria-label="Customer Live Chat Support"
      className="fixed bottom-22 right-4 lg:bottom-6 lg:right-6 z-40 flex flex-col items-end select-none"
    >
      {/* ── EXPANDED INTERACTIVE SUPPORT CARD ──────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-3 w-[calc(100vw-32px)] sm:w-[380px] max-w-[390px] rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,43,96,0.22)] border border-neutral-100 overflow-hidden ring-1 ring-black/5"
          >
            {/* Card Header */}
            <div className="relative bg-gradient-to-r from-[#002b60] via-[#0a3875] to-[#001e42] p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                    <Image
                      src="/Logo.webp"
                      alt="Laptop Point BD"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm tracking-tight">
                        Laptop Point BD
                      </h3>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <p className="text-[11px] text-neutral-200 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Live Support • Mirpur 10, Dhaka
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close chat window"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Speech bubble welcome */}
              <div className="mt-3.5 rounded-2xl bg-white/10 backdrop-blur-sm p-3 text-xs leading-relaxed text-neutral-100 border border-white/10">
                <p>
                  👋 <strong>Hello!</strong> Welcome to Laptop Point Bangladesh.
                  How can we help you choose your ideal laptop today?
                </p>
              </div>
            </div>

            {/* Channels Selection Body */}
            <div className="p-4 space-y-3 bg-neutral-50/60 max-h-[62vh] overflow-y-auto">
              {/* WhatsApp Button Card */}
              <button
                type="button"
                onClick={() => handleWhatsAppClick()}
                className="w-full text-left group flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-neutral-200/80 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                    <WhatsAppIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 group-hover:text-emerald-700 transition-colors">
                        WhatsApp Chat
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                        Fastest
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">
                      Pricing, live pictures &amp; stock verification
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                      +880 1612-182408
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Messenger Button Card */}
              <button
                type="button"
                onClick={handleMessengerClick}
                className="w-full text-left group flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-blue-50/50 border border-neutral-200/80 hover:border-blue-400 transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00c6ff] via-[#0078FF] to-[#a800ff] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                    <MessengerIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 group-hover:text-blue-700 transition-colors">
                        Facebook Messenger
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">
                        Official Page
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate">
                      Chat directly with @laptoppointbd
                    </p>
                    <p className="text-[10px] font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                      <span>facebook.com/laptoppointbd</span>
                      <ExternalLink className="w-2.5 h-2.5 inline" />
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Quick Inquiry Chips */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#dc0303]" />
                  <span>Quick Inquiries (1-Tap WhatsApp)</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => handleWhatsAppClick(q.query)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200/70 text-xs font-medium text-neutral-700 hover:text-[#002b60] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{q.label}</span>
                      <span className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                        Send →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Hotline & Outlet Option */}
              <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-xs px-1">
                <a
                  href={`tel:${hotlinePhone}`}
                  className="inline-flex items-center gap-1.5 font-bold text-[#002b60] hover:text-[#dc0303] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#dc0303]" />
                  <span>Call: 01612-182408</span>
                </a>
                <a
                  href="https://maps.google.com/?q=Laptop+Point+Mirpur+10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-[#002b60] transition-colors"
                >
                  <MapPin className="w-3 h-3 text-[#002b60]" />
                  <span>Mirpur 10 Outlet</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING LAUNCHER DOCK ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Proactive Greeting Bubble (Dismissible / Click to open assistant) */}
        <AnimatePresence>
          {showPrompt && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="hidden sm:flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-[0_8px_25px_rgba(0,43,96,0.14)] border border-neutral-200 text-xs font-semibold text-neutral-800 cursor-pointer hover:border-[#002b60]/40 transition-all group"
              onClick={() => setIsOpen(true)}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Need help? Chat with us!</span>
              <span className="text-base group-hover:rotate-12 transition-transform">
                👋
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPrompt(false);
                }}
                className="ml-1 rounded-full p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Dismiss greeting"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Buttons Group */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-full shadow-[0_12px_36px_rgba(0,43,96,0.18)] border border-neutral-200/80">
          {/* Messenger Button (1-Click Direct Chat) */}
          <motion.a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                trackPixelEvent("Contact", { contact_type: "messenger" });
              } catch {
                // ignore
              }
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#00c6ff] via-[#0078FF] to-[#a800ff] text-white shadow-md shadow-blue-500/30 transition-transform group"
            title="Chat on Facebook Messenger (@laptoppointbd)"
            aria-label="Chat on Facebook Messenger with Laptop Point BD"
          >
            <MessengerIcon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" />
            <span className="sr-only">Chat on Messenger</span>

            {/* Desktop Tooltip */}
            <span className="absolute bottom-full mb-3 right-0 rounded-xl bg-neutral-900/90 text-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block shadow-lg">
              Messenger Chat (@laptoppointbd)
            </span>
          </motion.a>

          {/* WhatsApp Button (1-Click Direct Chat) */}
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try {
                trackPixelEvent("Contact", { contact_type: "whatsapp" });
              } catch {
                // ignore
              }
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white shadow-md shadow-emerald-500/30 transition-transform group"
            title="Chat on WhatsApp (+880 1612-182408)"
            aria-label="Chat on WhatsApp with Laptop Point BD"
          >
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300 border-2 border-white" />
            </span>
            <WhatsAppIcon className="h-5.5 w-5.5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" />
            <span className="sr-only">Chat on WhatsApp</span>

            {/* Desktop Tooltip */}
            <span className="absolute bottom-full mb-3 right-0 rounded-xl bg-neutral-900/90 text-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block shadow-lg">
              WhatsApp Support (01612-182408)
            </span>
          </motion.a>

          {/* Toggle All Support Options Button */}
          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white transition-all shadow-md cursor-pointer ${
              isOpen
                ? "bg-neutral-800 rotate-90"
                : "bg-gradient-to-r from-[#002b60] to-[#0a3875] hover:from-[#002047] hover:to-[#002b60]"
            }`}
            title={isOpen ? "Close Support Menu" : "Open Live Support Hub"}
            aria-label="Toggle Live Chat Support Options"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </aside>
  );
}

