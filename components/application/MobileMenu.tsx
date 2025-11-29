import { ChevronDown, ChevronUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: "Laptops",
    href: "#",
    subItems: [
      { label: "Gaming Laptops", href: "#" },
      { label: "Ultrabooks", href: "#" },
      { label: "Business Laptops", href: "#" },
      { label: "MacBooks", href: "#" },
      { label: "Laptop Accessories", href: "#" },
    ],
  },
  {
    label: "Desktop PCs",
    href: "#",
    subItems: [
      { label: "Gaming PCs", href: "#" },
      { label: "Workstations", href: "#" },
      { label: "All-in-One", href: "#" },
      { label: "Desktop Accessories", href: "#" },
    ],
  },
  {
    label: "Networking Devices",
    href: "#",
    subItems: [
      { label: "Routers", href: "#" },
      { label: "Switches", href: "#" },
      { label: "Access Points", href: "#" },
      { label: "Network Accessories", href: "#" },
    ],
  },
  {
    label: "Printers & Scanners",
    href: "#",
    subItems: [
      { label: "Laser Printers", href: "#" },
      { label: "Inkjet Printers", href: "#" },
      { label: "Scanners", href: "#" },
      { label: "Printer Accessories", href: "#" },
    ],
  },
  {
    label: "PC Parts",
    href: "#",
    subItems: [
      { label: "Processors", href: "#" },
      { label: "Motherboards", href: "#" },
      { label: "Graphics Cards", href: "#" },
      { label: "RAM", href: "#" },
      { label: "Storage", href: "#" },
      { label: "PC Accessories", href: "#" },
    ],
  },
  {
    label: "All Other Products",
    href: "#",
    subItems: [
      { label: "Monitors", href: "#" },
      { label: "Keyboards", href: "#" },
      { label: "Mice", href: "#" },
      { label: "Headphones", href: "#" },
    ],
  },
  {
    label: "Repairs",
    href: "#",
    subItems: [],
  },
];

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-400 ease-out ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-50 transform transition-all duration-400 ease-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Image
              src="/Logo.webp"
              alt="logo"
              width={120}
              height={40}
              className="object-contain"
            />
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className="border-b border-gray-100 last:border-0"
              >
                <div
                  className="flex items-center justify-between py-3 cursor-pointer"
                  onClick={() =>
                    item.subItems.length > 0 ? toggleSubmenu(item.label) : null
                  }
                >
                  <Link
                    href={item.href}
                    className="text-lg font-medium text-gray-800 hover:text-primary flex-1"
                    onClick={(e) => {
                      if (item.subItems.length > 0) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                  {item.subItems.length > 0 && (
                    <button className="p-1 text-gray-500">
                      {openSubmenu === item.label ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-400 ease-out ${
                    openSubmenu === item.label
                      ? "max-h-[500px] opacity-100 mb-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-2 pl-4 bg-gray-50 rounded-md py-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="text-sm text-gray-600 hover:text-primary py-1"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Footer / CTA */}
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="outline"
              className="w-full text-blue-600 font-semibold border-2 border-blue-600 rounded-3xl hover:bg-blue-50"
            >
              Our Deals
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
