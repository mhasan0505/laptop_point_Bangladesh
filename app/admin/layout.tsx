"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Trigger */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <div className="p-6 border-b border-gray-100">
                    <Link
                      href="/admin"
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="relative w-8 h-8">
                        <Image
                          src="/Logo.webp"
                          alt="Laptop Point Admin"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-lg font-bold text-black">
                        Laptop Point
                      </span>
                    </Link>
                  </div>
                  <div className="p-4">
                    <AdminSidebar onNavigate={() => setIsOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Logo */}
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="relative w-8 h-8 hidden md:block">
                  <Image
                    src="/Logo.webp"
                    alt="Laptop Point Admin"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg md:text-xl font-bold text-black hidden md:block">
                  Laptop Point Admin
                </span>
                <span className="text-lg font-bold text-black md:hidden">
                  Admin
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  View Website
                </Button>
                <Button variant="outline" size="sm" className="md:hidden">
                  Site
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white shadow-sm hidden md:block border-r min-h-[calc(100vh-64px)]">
          <div className="p-4 sticky top-16">
            <div className="flex items-center space-x-2 mb-6 px-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/Logo.webp"
                  alt="Laptop Point Admin"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-black">Laptop Point</span>
            </div>
            <AdminSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
