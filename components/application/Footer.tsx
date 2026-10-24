"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Linkedin,
  Music,
  ShieldCheck,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface FooterContact {
  hotline: string;
  email: string;
  address: string;
  hours: string;
  social: { facebook: string; instagram: string; tiktok: string; youtube: string };
}

const digitsOnly = (v: string) => v.replace(/[^\d+]/g, "");

export default function Footer({
  contact,
  footerLinks,
}: {
  contact?: FooterContact;
  footerLinks?: Array<{
    columnTitle: string;
    links: Array<{ label: string; href: string }>;
  }>;
}) {
  const currentYear = new Date().getFullYear();

  const [mountedAt] = useState(() => Date.now());
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setMsg("");
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
      setStatus("success");
      setMsg("Thank you for subscribing!");
      setEmail("");
      setHoneypot("");
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Subscription failed");
    }
  };

  const paymentMethods = [
    { src: "/payment_logo/bkash.png", alt: "bKash", name: "bKash" },
    { src: "/payment_logo/nagad.png", alt: "Nagad", name: "Nagad" },
    {
      src: "/payment_logo/mastercard.png",
      alt: "Mastercard",
      name: "Mastercard",
    },
    { src: "/payment_logo/visa.png", alt: "Visa", name: "Visa" },
    {
      src: "/payment_logo/amex.png",
      alt: "American Express",
      name: "American Express",
    },
    { src: "/payment_logo/dgepay.png", alt: "DGE Pay", name: "DGE Pay" },
  ];

  return (
    <footer className="w-full">
      {/* Brand & Newsletter Section - Light Background for Contrast */}
      <div className="bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start space-y-4 max-w-sm text-center md:text-left">
              <Link href="/" className="relative w-48 h-14">
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point BD"
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your trusted destination for premium laptops, custom PC builds,
                and genuine tech accessories in Bangladesh. Experience
                excellence in every purchase.
              </p>
              <div className="flex space-x-3 pt-2">
                {[
                  {
                    Icon: Facebook,
                    href: contact?.social.facebook ?? "https://www.facebook.com/laptoppointbd",
                    color: "hover:text-blue-600",
                    label: "Visit us on Facebook",
                  },
                  {
                    Icon: Instagram,
                    href: contact?.social.instagram ?? "https://www.instagram.com/laptop_point.bd/",
                    color: "hover:text-pink-600",
                    label: "Visit us on Instagram",
                  },
                  {
                    Icon: Music,
                    href: contact?.social.tiktok ?? "https://www.tiktok.com/@laptop.point.bd",
                    color: "hover:text-sky-500",
                    label: "Visit us on TikTok",
                  },
                  {
                    Icon: Linkedin,
                    href: "https://www.linkedin.com/company/laptop-point-bangladesh/",
                    color: "hover:text-blue-700",
                    label: "Visit us on LinkedIn",
                  },
                  {
                    Icon: Youtube,
                    href: contact?.social.youtube ?? "https://www.youtube.com/@LaptopPointBD",
                    color: "hover:text-red-600",
                    label: "Visit us on YouTube",
                  },
                ].map(({ Icon, href, color, label }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-full bg-white shadow-sm text-gray-600 transition-colors ${color}`}
                    aria-label={label}
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="w-full md:w-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md">
              <h4 className="font-semibold text-gray-900 mb-2">
                Subscribe to our Newsletter
              </h4>
              <p className="text-gray-500 text-sm mb-4">
                Get the latest updates dealing with new products and trends.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto disabled:opacity-60 cursor-pointer"
                  >
                    {status === "submitting" ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
                {msg && (
                  <p className={`text-xs ${status === "success" ? "text-emerald-600 font-medium" : "text-rose-500"}`}>
                    {msg}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Section - Dark Background */}
      <div className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Dynamic / Fallback Columns */}
            {(footerLinks && footerLinks.length > 0
              ? footerLinks
              : [
                  {
                    columnTitle: "Quick Links",
                    links: [
                      { label: "All Products", href: "/shop" },
                      { label: "Laptops", href: "/shop?category=laptop" },
                      { label: "Accessories", href: "/accessories" },
                      { label: "Hot Deals", href: "/deals" },
                    ],
                  },
                  {
                    columnTitle: "Support",
                    links: [
                      { label: "My Account", href: "/contact" },
                      { label: "Order Tracking", href: "/track-order" },
                      { label: "FAQs", href: "/contact" },
                      { label: "Contact Us", href: "/contact" },
                    ],
                  },
                  {
                    columnTitle: "Policies",
                    links: [
                      { label: "Privacy Policy", href: "/privacy" },
                      { label: "Terms of Service", href: "/terms" },
                      { label: "Shipping Info", href: "/shipping" },
                      { label: "Returns & Refund", href: "/returns" },
                    ],
                  },
                ]
            ).map((column) => (
              <div key={column.columnTitle}>
                <h4 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-[#dc0303] after:rounded-full">
                  {column.columnTitle}
                </h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.columnTitle}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-[#dc0303] hover:pl-1 transition-all"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-[#dc0303] after:rounded-full">
                Contact Us
              </h4>
              <address className="not-italic space-y-4 text-gray-400">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-[#dc0303] rounded text-white">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-white font-medium mb-1">
                      Our Store
                    </span>
                    <p className="text-sm whitespace-pre-line">
                      {contact?.address ?? "Madbar Mansion, Shop-08,\nMirpur-10, Dhaka-1216"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Open: {contact?.hours ?? "Mon - Sat, 10:30 AM - 9:00 PM"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-[#dc0303] rounded text-white">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <a
                    href={`mailto:${contact?.email ?? "info@laptoppointbd.com"}`}
                    className="text-sm hover:text-[#dc0303] transition-colors break-all"
                  >
                    {contact?.email ?? "info@laptoppointbd.com"}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-[#dc0303] rounded text-white">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <a
                    href={`tel:${digitsOnly(contact?.hotline ?? "+8801612182408")}`}
                    className="text-sm hover:text-[#dc0303] transition-colors"
                  >
                    {contact?.hotline ?? "+880 1612-182408"}
                  </a>
                </div>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <p className="text-gray-300 text-sm text-center lg:text-left">
                © {currentYear} Laptop Point BD. All rights reserved. Powered by{" "}
                <a
                  href="https://artyx.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  <span>Artyx Digital</span>
                </a>
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Secure Payments
                </span>
                <span
                  className="hidden sm:block w-px h-5 bg-gray-700"
                  aria-hidden="true"
                />
                <div
                  className="flex items-center gap-2 flex-wrap justify-center"
                  aria-label="We accept the following payment methods"
                >
                  <span className="sr-only">We accept:</span>
                  {paymentMethods.map(({ src, alt, name }) => (
                    <div
                      key={name}
                      title={`We accept ${name}`}
                      className="flex h-9 items-center justify-center rounded-md bg-white px-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <Image
                        src={src}
                        alt={alt}
                        width={48}
                        height={20}
                        unoptimized
                        className="h-auto w-auto max-h-5 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
