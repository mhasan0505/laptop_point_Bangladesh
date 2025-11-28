"use client";
import {
  Facebook,
  Instagram,
  Menu,
  SearchIcon,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
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
    <header className="bg-white">
      {/* Top Header */}
      <div className="w-full h-11 bg-black">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-white sm:text-[10px] p-2">
            <span className="text-muted-foreground sm:text-[10px]">
              Mon-Sat:
            </span>{" "}
            10:00 AM - 8:30 PM
          </p>
          <p className="text-muted-foreground p-2 hidden md:block">
            Madbar Mansion, Ground Floor,Shop No-08, Mirpur-10 Roundabout,
            Dhaka-1216
            <button className="text-white underline px-2">Contact Us</button>
          </p>
          <div className="flex items-center gap-2 p-2">
            <p className="text-white">Call Us:</p>
            <p className="text-white">+8801717171717</p>
            <Facebook className="w-4 h-4 hidden md:block text-white cursor-pointer hover:text-blue-500" />
            <Instagram className="w-4 h-4 hidden md:block text-white cursor-pointer hover:text-pink-500" />
          </div>
        </div>
      </div>
      {/* Mobile Header */}
      <div className="md:hidden container mx-auto">
        {/* Top Row - Icons */}
        <div className="flex items-center justify-between px-4 py-2">
          <Menu
            className="cursor-pointer w-6 h-6"
            onClick={() => setIsMobileMenuOpen(true)}
          />
          <Image
            src="/Logo.webp"
            alt="logo"
            width={100}
            height={40}
            className="object-contain"
          />
          <div className="flex items-center gap-4">
            <ShoppingCart className="w-5 h-5" />
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Bottom Row - Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..ESC to close"
              ref={searchInputRef}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block container mx-auto" ref={searchRef}>
        <div className="flex items-center justify-between gap-4 p-2 relative">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/Logo.webp"
              alt="logo"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>

          {/* Menu Items - Hidden when search is expanded */}
          <div
            className={`flex items-center gap-6 transition-all duration-500 ease-out ${
              isSearchExpanded
                ? "opacity-0 invisible w-0 overflow-hidden"
                : "opacity-100 visible"
            }`}
          >
            <button className="text-primary font-semibold whitespace-nowrap">
              Laptops
            </button>
            <button className="text-primary font-semibold whitespace-nowrap">
              Desktops PCs
            </button>
            <button className="text-primary font-semibold whitespace-nowrap">
              Networking
            </button>
            <button className="text-primary font-semibold whitespace-nowrap">
              Printers
            </button>
            <button className="text-primary font-semibold whitespace-nowrap">
              PC Accessories
            </button>
            <Button
              variant="outline"
              className="text-red-500 font-semibold border-2 border-red-500 rounded-3xl hover:text-red-400 hover:border-red-400 whitespace-nowrap"
            >
              Our Deals
            </Button>
          </div>

          {/* Expandable Search Bar */}
          <div
            className={`transition-all duration-500 ease-out ${
              isSearchExpanded ? "flex-1 mx-4" : "w-auto"
            }`}
          >
            {isSearchExpanded ? (
              <div className="relative transition-all duration-500 ease-out">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-all duration-300" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-12 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {!isSearchExpanded && (
              <SearchIcon
                className="w-5 h-5 cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsSearchExpanded(true)}
              />
            )}
            <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
            <User className="w-5 h-5 cursor-pointer hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Header;
