"use client";

import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Music,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "100% Genuine",
    desc: "Every product is authentic — no compromises.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Dhaka same-day, nationwide within 48 hrs.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "7-day hassle-free return on all orders.",
  },
];

const quickLinks = [
  { label: "All Products", href: "/shop" },
  { label: "Laptops", href: "/shop?category=laptop" },
  { label: "Accessories", href: "/shop?category=accessories" },
  { label: "Hot Deals", href: "/deals" },
  { label: "Compare Products", href: "/compare" },
];

const supportLinks = [
  { label: "My Account", href: "/account" },
  { label: "Track My Order", href: "/track" },
  { label: "Help & FAQs", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Custom PC Build", href: "/custom-build" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns & Refund", href: "/returns" },
];

const socialLinks = [
  {
    Icon: Facebook,
    href: "https://www.facebook.com/laptoppointbd",
    hoverColor: "hover:bg-blue-600",
    label: "Follow us on Facebook",
  },
  {
    Icon: Music,
    href: "https://www.tiktok.com/@laptop.point.bd",
    hoverColor: "hover:bg-gray-700",
    label: "Follow us on TikTok",
  },
  {
    Icon: Instagram,
    href: "https://www.instagram.com/laptoppointbd",
    hoverColor: "hover:bg-pink-600",
    label: "Follow us on Instagram",
  },
  {
    Icon: Linkedin,
    href: "https://www.linkedin.com/company/laptop-point-bangladesh/",
    hoverColor: "hover:bg-blue-700",
    label: "Connect on LinkedIn",
  },
  {
    Icon: Youtube,
    href: "https://www.youtube.com/@LaptopPointBD",
    hoverColor: "hover:bg-red-600",
    label: "Watch on YouTube",
  },
];

const paymentMethods = ["VISA", "Mastercard", "AMEX", "bKash", "Nagad"];

/* Slightly varied underline widths give a hand-crafted feel */
const headingUnderlineWidths: Record<string, string> = {
  "Quick Links": "w-10",
  Support: "w-8",
  Policies: "w-11",
  "Find Us": "w-9",
};

function FooterHeading({ title }: { title: string }) {
  const width = headingUnderlineWidths[title] ?? "w-10";
  return (
    <h4 className="text-base font-bold mb-6 text-white">
      {title}
      <span
        className={`block mt-2 h-0.75 ${width} rounded-full bg-yellow-400`}
      />
    </h4>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const linksRef = useRef(null);
  const isInView = useInView(linksRef, { once: true, margin: "-60px" });

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  }

  return (
    <footer className="w-full">
      {/* ── Zone 1: Brand + Newsletter ─────────────────────────── */}
      <div className="bg-white border-t border-gray-100 pt-16 pb-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            {/* Brand block */}
            <div className="flex flex-col items-start space-y-5 max-w-xs">
              <Link
                href="/"
                className="relative w-44 h-12 block"
                aria-label="Laptop Point BD home"
              >
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point BD"
                  fill
                  className="object-contain object-left"
                />
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                Bangladesh&apos;s trusted home for premium laptops, genuine
                accessories, and custom PC builds — backed by real people who
                know tech.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {socialLinks.map(({ Icon, href, hoverColor, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.18 }}
                    className={`p-2 rounded-lg bg-gray-100 text-gray-500 transition-colors duration-200 ${hoverColor} hover:text-white`}
                    aria-label={label}
                  >
                    <Icon size={17} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Newsletter block */}
            <div className="w-full md:max-w-md">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500 mb-2">
                  Stay in the loop
                </p>
                <h4 className="text-gray-900 font-bold text-lg mb-1 leading-snug">
                  New arrivals. Exclusive deals.
                  <br />
                  Straight to your inbox.
                </h4>
                <p className="text-gray-400 text-sm mb-5">
                  No spam, ever. Unsubscribe any time.
                </p>

                {subscribed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
                  >
                    <CheckCircle2 size={18} className="shrink-0" />
                    <span className="text-sm font-medium">
                      You&apos;re subscribed — welcome aboard!
                    </span>
                  </motion.div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 transition-all placeholder:text-gray-300"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap group"
                    >
                      Subscribe
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Zone 2: Trust Band ─────────────────────────────────── */}
      <div className="bg-yellow-400">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-yellow-300/60">
            {trustFeatures.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-center gap-4 py-5 px-4 sm:px-6"
              >
                <div className="shrink-0 p-2 bg-yellow-300/40 rounded-lg">
                  <Icon
                    size={20}
                    className="text-white"
                    strokeWidth={1.8}
                  />
                </div>
                <div>
                  <p className="text-yellow-950 font-bold text-sm">{title}</p>
                  <p className="text-yellow-800 text-xs leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Zone 3: Links + Contact ────────────────────────────── */}
      <div className="bg-[#0f1117] text-white pt-16 pb-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            ref={linksRef}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 mb-14"
          >
            {/* Quick Links */}
            <motion.div variants={columnVariants}>
              <FooterHeading title="Quick Links" />
              <ul className="space-y-3">
                {quickLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 text-sm hover:text-yellow-400 hover:pl-1.5 transition-all duration-200 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div variants={columnVariants}>
              <FooterHeading title="Support" />
              <ul className="space-y-3">
                {supportLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 text-sm hover:text-yellow-400 hover:pl-1.5 transition-all duration-200 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Policies */}
            <motion.div variants={columnVariants}>
              <FooterHeading title="Policies" />
              <ul className="space-y-3">
                {policyLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 text-sm hover:text-yellow-400 hover:pl-1.5 transition-all duration-200 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Find Us */}
            <motion.div variants={columnVariants}>
              <FooterHeading title="Find Us" />
              <address className="not-italic space-y-5 text-gray-400 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 p-1.5 bg-yellow-400/10 rounded-lg">
                    <MapPin size={15} className="text-yellow-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-white font-semibold text-sm">
                      Our Store
                    </span>
                    <p className="leading-relaxed">
                      Madbar Mansion, Shop-08,
                      <br />
                      Mirpur-10, Dhaka-1216
                    </p>
                    <p className="text-gray-500 text-xs">
                      Mon – Sat &nbsp;·&nbsp; 10:30 AM – 9:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 p-1.5 bg-yellow-400/10 rounded-lg">
                    <Mail size={15} className="text-yellow-400" />
                  </div>
                  <a
                    href="mailto:info@laptoppointbd.com"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    info@laptoppointbd.com
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="shrink-0 p-1.5 bg-yellow-400/10 rounded-lg">
                    <Phone size={15} className="text-yellow-400" />
                  </div>
                  <a
                    href="tel:+8801612182408"
                    className="hover:text-yellow-400 transition-colors duration-200"
                  >
                    +880 1612-182408
                  </a>
                </div>
              </address>
            </motion.div>
          </motion.div>

          {/* ── Bottom Bar ─────────────────────────────────────── */}
          <div className="border-t border-white/[0.07] pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-500 text-sm text-center md:text-left">
                © {currentYear} Laptop Point BD. All rights reserved.{" "}
                <span className="text-gray-600">·</span> Built with care by{" "}
                <span className="text-yellow-400 font-medium">
                  Creative Artix
                </span>
              </p>

              <div className="flex flex-col items-center md:items-end gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-yellow-400/80">
                  SSLCommerz · EMI Available
                </p>
                <div className="flex flex-wrap justify-center md:justify-end gap-1.5">
                  {paymentMethods.map((method) => (
                    <span
                      key={method}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-gray-300 tracking-wide"
                    >
                      {method}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-[11px]">
                  3, 6, 9 &amp; 12-month EMI on eligible cards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
