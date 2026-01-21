"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
                    Icon: FaFacebook,
                    href: "https://www.facebook.com/laptoppointbd",
                    color: "hover:text-blue-600",
                  },
                  { Icon: FaTiktok, href: "#", color: "hover:text-sky-500" },
                  {
                    Icon: FaInstagram,
                    href: "https://www.tiktok.com/@laptop.point.bd",
                    color: "hover:text-pink-600",
                  },
                  {
                    Icon: FaLinkedin,
                    href: "https://www.linkedin.com/company/laptop-point-bangladesh/",
                    color: "hover:text-blue-700",
                  },
                  {
                    Icon: FaYoutube,
                    href: "https://www.youtube.com/@LaptopPointBD",
                    color: "hover:text-red-600",
                  },
                ].map(({ Icon, href, color }, index) => (
                  <motion.a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-full bg-white shadow-sm text-gray-600 transition-colors ${color}`}
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Newsletter (Optional Placeholder) */}
            <div className="w-full md:w-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-md">
              <h4 className="font-semibold text-gray-900 mb-2">
                Subscribe to our Newsletter
              </h4>
              <p className="text-gray-500 text-sm mb-4">
                Get the latest updates dealing with new products and trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
                <button className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Section - Dark Background */}
      <div className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-yellow-400 after:rounded-full">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/products"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/laptops"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Laptops
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accessories"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/deals"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Hot Deals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-yellow-400 after:rounded-full">
                Support
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/account"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Order Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-yellow-400 after:rounded-full">
                Policies
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-gray-400 hover:text-yellow-400 hover:pl-1 transition-all"
                  >
                    Returns & Refund
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-white relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-yellow-400 after:rounded-full">
                Contact Us
              </h4>
              <address className="not-italic space-y-4 text-gray-400">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 bg-yellow-400 rounded text-primary">
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
                    <p className="text-sm">
                      Madbar Mansion, Shop-08,
                      <br />
                      Mirpur-10, Dhaka-1216
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-yellow-400 rounded text-primary">
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
                    href="mailto:info@laptoppointbd.com"
                    className="text-sm hover:text-yellow-400 transition-colors"
                  >
                    info@laptoppointbd.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-yellow-400 rounded text-primary">
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
                    href="tel:+8801717171717"
                    className="text-sm hover:text-yellow-400 transition-colors"
                  >
                    +880 1612-182408
                  </a>
                </div>
              </address>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © {currentYear} Laptop Point BD. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {/* Payment Methods (Placeholder) */}
                <div className="h-6 w-10 bg-gray-800 rounded"></div>
                <div className="h-6 w-10 bg-gray-800 rounded"></div>
                <div className="h-6 w-10 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
