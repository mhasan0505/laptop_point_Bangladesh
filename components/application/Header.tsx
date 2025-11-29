"use client";
import MobileMenu from "@/components/application/MobileMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  Twitter,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop", hasDropdown: true },
    { name: "Categories", href: "/categories", hasDropdown: true },
    { name: "Deals", href: "/deals", badge: "HOT" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
      searchInputRef.current?.focus();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isSearchExpanded]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white text-xs">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Mon-Sat: 10:00 AM - 8:30 PM</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <a
                  href="tel:+8801717171717"
                  className="hover:text-primary transition-colors"
                >
                  +880 1717-171717
                </a>
              </div>
              <div className="hidden md:flex items-center space-x-3 border-l border-gray-700 pl-4 ml-2">
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="hover:text-primary transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="mailto:info@laptoppointbd.com"
                  className="hover:text-primary transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white container mx-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <div className="relative w-40 h-12">
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point Bangladesh"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <Link
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors flex items-center"
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                    {link.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                  {link.hasDropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Submenu Item
                      </a>
                      {/* Add more dropdown items */}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2 md:space-x-4 relative">
              {/* Search Container */}
              <div
                ref={searchContainerRef}
                className={`transition-all duration-300 ease-in-out ${
                  isSearchExpanded
                    ? "fixed inset-0 bg-white/95 backdrop-blur-sm z-50 p-4 flex items-start justify-center"
                    : "relative w-10"
                }`}
              >
                {isSearchExpanded ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full max-w-2xl relative"
                  >
                    <div className="relative">
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-12 pr-10 py-3.5 text-base rounded-xl border border-gray-200 focus:border-primary/70 focus:ring-1 focus:ring-primary/20 focus:outline-none shadow-sm bg-white/90"
                        autoFocus
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsSearchExpanded(false);
                          if (searchInputRef.current) {
                            searchInputRef.current.value = "";
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close search"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                    {/* Search Suggestions */}
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 max-h-[60vh] overflow-y-auto"
                    >
                      <p className="text-sm font-medium text-gray-500 mb-2 px-2">
                        Recent searches
                      </p>
                      <div className="space-y-1">
                        {[
                          "Laptop",
                          "Gaming PC",
                          "Wireless Mouse",
                          "Mechanical Keyboard",
                        ].map((item) => (
                          <button
                            key={item}
                            className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors flex items-center group"
                          >
                            <Search className="h-3.5 w-3.5 text-gray-400 mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 hover:bg-gray-50"
                      onClick={() => setIsSearchExpanded(true)}
                      aria-label="Open search"
                    >
                      <Search className="h-[18px] w-[18px] text-gray-500" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Cart Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={isSearchExpanded ? "hidden md:block" : ""}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative h-10 w-10 hover:bg-gray-50"
                  aria-label="Shopping cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    3
                  </span>
                </Button>
              </motion.div>

              {/* User Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={isSearchExpanded ? "hidden md:block" : ""}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-50"
                  aria-label="User account"
                >
                  <User className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Header;
