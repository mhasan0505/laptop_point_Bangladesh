"use client";

import { useCart } from "@/contexts/CartContext";
import { Grid, Home, Phone, ShoppingCart, Truck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const StickyMobileBar = () => {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Grid },
    {
      name: "Call",
      href: "tel:+8801612182408",
      icon: Phone,
      isAction: true,
      ariaLabel: "Call Laptop Point Hotline",
    },
    { name: "Cart", href: "/cart", icon: ShoppingCart, count: cartCount },
    { name: "Track", href: "/track-order", icon: Truck },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,43,96,0.06)] lg:hidden pb-safe select-none"
    >
      <div className="flex justify-around items-center h-15 px-1">
        {navItems.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <a
                key={item.name}
                href={item.href}
                aria-label={item.ariaLabel || item.name}
                className="flex flex-col items-center justify-center w-14 h-14 -mt-5 group"
              >
                <div className="w-12 h-12 bg-gradient-to-tr from-[#002b60] to-[#0a3f85] text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,43,96,0.35)] ring-4 ring-white active:scale-90 transition-transform">
                  <Icon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-0.5 tracking-tight">
                  {item.name}
                </span>
              </a>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full py-1 transition-colors relative ${
                isActive
                  ? "text-[#002b60] font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform active:scale-95 ${
                    isActive ? "stroke-[2.3px]" : "stroke-[1.8px]"
                  }`}
                />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#dc0303] text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-xs">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight mt-1">{item.name}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#002b60]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default StickyMobileBar;
