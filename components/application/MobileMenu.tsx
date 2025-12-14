"use client";

import { navigationLinks } from "@/app/data/navigation";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  ChevronDown,
  Facebook,
  Flame,
  Instagram,
  Mail,
  Twitter,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const sidebarVariants: Variants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
              <div className="relative w-28 h-8">
                <Image
                  src="/Logo.webp"
                  alt="logo"
                  fill
                  className="object-contain"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200/50 text-gray-500 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-4 scrollbar-hide">
              <div className="flex flex-col gap-1">
                {navigationLinks.map((item) => (
                  <motion.div key={item.name} variants={itemVariants}>
                    <motion.div
                      whileHover={{
                        x: 4,
                        backgroundColor: "rgba(249, 250, 251, 1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className={`group rounded-xl transition-all ${
                        openSubmenu === item.name ? "bg-gray-50" : ""
                      }`}
                    >
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer select-none"
                        onClick={() =>
                          item.submenu && item.submenu.length > 0
                            ? toggleSubmenu(item.name)
                            : onClose()
                        }
                      >
                        <Link
                          href={item.href}
                          className={`text-base font-medium flex-1 transition-colors flex items-center gap-2 ${
                            openSubmenu === item.name
                              ? "text-primary"
                              : "text-gray-700 group-hover:text-primary"
                          }`}
                          onClick={(e) => {
                            if (item.submenu && item.submenu.length > 0)
                              e.preventDefault();
                          }}
                        >
                          {item.name}
                          {item.badge && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">
                              <Flame className="w-3 h-3 fill-current" />
                              {item.badge}
                            </span>
                          )}
                        </Link>
                        {item.submenu && item.submenu.length > 0 && (
                          <motion.div
                            animate={{
                              rotate: openSubmenu === item.name ? 180 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                            className={`${
                              openSubmenu === item.name
                                ? "text-primary"
                                : "text-gray-400"
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        )}
                      </div>

                      {/* Submenu */}
                      <AnimatePresence>
                        {openSubmenu === item.name && item.submenu && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 pb-3 px-3 ml-2 border-l-2 border-primary/10">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  className="text-sm text-gray-500 hover:text-primary hover:bg-white py-2 px-3 rounded-lg transition-colors"
                                  onClick={onClose}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </nav>

            {/* Footer / CTA */}
            <motion.div
              variants={itemVariants}
              className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4"
            >
              <Button
                variant="outline"
                className="w-full text-primary font-semibold border-primary/20 bg-white hover:bg-primary hover:text-white transition-all rounded-xl h-11 shadow-sm"
              >
                Our Deals
              </Button>

              <div className="flex items-center justify-center gap-4 text-gray-400">
                <a href="#" className="hover:text-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-pink-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-sky-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="mailto:info@example.com"
                  className="hover:text-red-500 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
