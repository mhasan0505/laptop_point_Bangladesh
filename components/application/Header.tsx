"use client";
import MobileMenu from "@/components/application/MobileMenu";

import { laptopData } from "@/app/data/data";
import { navigationLinks } from "@/app/data/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import MegaMenu from "../navigation/MegaMenu";

const Header = () => {
  const router = useRouter();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = laptopData.laptops
        .filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.brand &&
              product.brand.toLowerCase().includes(query.toLowerCase())) ||
            (product.category &&
              product.category.toLowerCase().includes(query.toLowerCase())),
        )
        .slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearchExpanded(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const navLinks = navigationLinks;

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

  // Timer ref for closing delay
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMegaMenuOpen = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuClose = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white text-xs">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span>Mon-Sat: 10:30 AM - 9:00 PM</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                <span>Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-yellow-400" />
                <a
                  href="tel:+8801612182408"
                  className="hover:text-yellow-400 transition-colors"
                >
                  +880 1612-182408
                </a>
              </div>
              <div className="hidden md:flex items-center space-x-3 border-l border-gray-700 pl-4 ml-2">
                <Link
                  href="https://www.facebook.com/laptoppointbd"
                  target="_blank"
                  className="hover:text-yellow-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </Link>
                <Link
                  href="https://www.instagram.com/laptop_point.bd"
                  target="_blank"
                  className="hover:text-yellow-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </Link>
                <Link
                  href="https://www.youtube.com/@LaptopPointBD"
                  target="_blank"
                  className="hover:text-yellow-400 transition-colors"
                  aria-label="Youtube"
                >
                  <Youtube size={16} />
                </Link>
                <a
                  href="mailto:info@laptoppointbd.com"
                  target="_blank"
                  className="hover:text-yellow-400 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white container mx-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24">
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
            <nav className="hidden lg:flex items-center gap-0">
              {navLinks.map((link) => (
                <NavItem
                  key={link.name}
                  link={link}
                  onMegaMenuOpen={handleMegaMenuOpen}
                  onMegaMenuClose={handleMegaMenuClose}
                />
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
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsSearchExpanded(false);
                          setSearchQuery("");
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
                      {searchQuery ? (
                        <>
                          <p className="text-sm font-medium text-gray-500 mb-2 px-2">
                            Search Results
                          </p>
                          {searchResults.length > 0 ? (
                            <div className="space-y-1">
                              {searchResults.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/product/${product.slug}`}
                                  onClick={() => setIsSearchExpanded(false)}
                                  className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors flex items-center group gap-3"
                                >
                                  <div className="relative w-10 h-10 shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 line-clamp-1">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ৳{product.price.toLocaleString()}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                              <Link
                                href={`/shop?search=${searchQuery}`}
                                onClick={() => setIsSearchExpanded(false)}
                                className="block w-full text-center py-2 text-sm text-primary hover:text-primary/80 font-medium border-t border-gray-100 mt-2"
                              >
                                View all results
                              </Link>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No products found for &quot;{searchQuery}&quot;
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-500 mb-2 px-2">
                            Recent searches
                          </p>
                          <div className="space-y-1">
                            {[
                              "HP Elitebook",
                              "Dell Latitude",
                              "ThinkPad",
                              "Surface Laptop",
                            ].map((item) => (
                              <button
                                key={item}
                                onClick={() => handleSearch(item)}
                                className="w-full text-left p-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors flex items-center group"
                              >
                                <Search className="h-3.5 w-3.5 text-gray-400 mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span>{item}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
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
                      className="rounded-full h-10 w-10 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsSearchExpanded(true)}
                      aria-label="Open search"
                    >
                      <Search className="h-[18px] w-[18px] text-gray-700" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Wishlist Button */}
              <Link href="/wishlist">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={isSearchExpanded ? "hidden md:block" : ""}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative h-10 w-10 hover:bg-gray-100 transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart className="h-5 w-5 text-gray-700" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>

              {/* Cart Button */}
              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={isSearchExpanded ? "hidden md:block" : ""}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative h-10 w-10 hover:bg-gray-100 transition-colors"
                    aria-label="Shopping cart"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-700" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>

              {/* User Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={isSearchExpanded ? "hidden md:block" : ""}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="User account"
                >
                  <User className="h-5 w-5 text-gray-700" />
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
                  className="h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 text-gray-700" />
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

      {/* MegaMenu for Categories */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        onMouseEnter={handleMegaMenuOpen}
        onMouseLeave={handleMegaMenuClose}
      />
    </header>
  );
};

interface NavLink {
  name: string;
  href: string;
  hasDropdown?: boolean;
  submenu?: { name: string; href: string }[];
  badge?: string;
}

const NavItem = ({
  link,
  onMegaMenuOpen,
  onMegaMenuClose,
}: {
  link: NavLink;
  onMegaMenuOpen?: () => void;
  onMegaMenuClose?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Open MegaMenu for Categories link
    if (link.name === "Categories" && onMegaMenuOpen) {
      onMegaMenuOpen();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    // For Categories, set a timer to close
    if (link.name === "Categories" && onMegaMenuClose) {
      onMegaMenuClose();
    }
  };

  return (
    <div
      className="relative group px-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={link.href}
        className={`px-4 py-2 text-sm font-medium transition-colors flex items-center rounded-full hover:bg-gray-50 ${
          isHovered ? "text-yellow-600" : "text-gray-700"
        }`}
      >
        {link.name}
        {link.hasDropdown && (
          <ChevronDown
            className={`ml-1 w-4 h-4 transition-transform duration-200 ${
              isHovered ? "rotate-180 text-yellow-500" : ""
            }`}
          />
        )}
        {link.badge && (
          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white leading-none">
            {link.badge}
          </span>
        )}
      </Link>

      {/* Submenu - only show for non-Categories links */}
      {link.hasDropdown && link.submenu && link.name !== "Categories" && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={
            isHovered
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 10, scale: 0.95 }
          }
          transition={{ duration: 0.2 }}
          className={`absolute left-0 top-full mt-1 w-56 p-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 origin-top-left ${
            isHovered ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="flex flex-col gap-1">
            {link.submenu.map((subItem) => (
              <Link
                key={subItem.name}
                href={subItem.href}
                className="block px-4 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-yellow-50 hover:text-yellow-700 transition-colors font-medium"
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Header;
