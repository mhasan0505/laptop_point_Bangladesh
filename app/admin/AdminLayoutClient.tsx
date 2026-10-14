"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAdvancedSearchBar } from "@/components/admin/AdminAdvancedSearchBar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  ExternalLink,
  LogOut,
  Menu,
  Plus,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, Suspense, useEffect, useState } from "react";

function AdminBrandLink({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/admin"
      className={className ?? "flex items-center gap-2.5"}
      onClick={onClick}
    >
      <div className="relative h-9 w-36">
        <Image
          src="/Logo.webp"
          alt="Laptop Point Bangladesh Admin"
          fill
          priority
          sizes="144px"
          className="object-contain object-left"
        />
      </div>
      <span className="rounded-xs bg-zinc-900 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white dark:bg-zinc-100 dark:text-zinc-950">
        Admin
      </span>
    </Link>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isLoginPage, isLoading, isAuthenticated, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary" />
          <p className="text-xs text-muted-foreground font-medium">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left: Mobile Drawer Trigger + Brand */}
            <div className="flex items-center gap-3">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden h-9 w-9 rounded-sm">
                    <Menu className="w-4 h-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-card border-border">
                  <div className="p-5 border-b border-border">
                    <AdminBrandLink onClick={() => setIsOpen(false)} />
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-clean">
                    <Suspense fallback={null}>
                      <AdminSidebar onNavigate={() => setIsOpen(false)} />
                    </Suspense>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mobile logo */}
              <div className="flex items-center md:hidden">
                <AdminBrandLink />
              </div>

              {/* Desktop breadcrumb tag */}
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <Shield size={14} className="text-blue-600" />
                <span className="font-semibold text-foreground">Console</span>
                <span>/</span>
                <span className="font-medium text-foreground">
                  {pathname === "/admin"
                    ? "Dashboard"
                    : pathname.startsWith("/admin/products/new")
                    ? "Products / Add New"
                    : pathname.startsWith("/admin/products/edit")
                    ? "Products / Edit"
                    : pathname.startsWith("/admin/products")
                    ? "Products & Catalog"
                    : pathname.startsWith("/admin/orders")
                    ? "Orders & Fulfillment"
                    : pathname.startsWith("/admin/inventory")
                    ? "Inventory Center"
                    : pathname.startsWith("/admin/analytics")
                    ? "Sales Analytics"
                    : pathname.startsWith("/admin/power-deal")
                    ? "Power Deals CMS"
                    : pathname.startsWith("/admin/hero-banners")
                    ? "Hero Banners"
                    : pathname.startsWith("/admin/hot-deal")
                    ? "Flash Deals"
                    : pathname.startsWith("/admin/special-offers")
                    ? "Special Offers"
                    : pathname.replace("/admin/", "").replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Center: Global Advanced Search Bar */}
            <div className="flex-1 max-w-sm lg:max-w-md mx-2 sm:mx-4 flex items-center justify-end sm:justify-center">
              <AdminAdvancedSearchBar />
            </div>

            {/* Right: Quick actions & user menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Add Product */}
              <Link href="/admin/products/new">
                <Button
                  size="sm"
                  className="h-8 sm:h-9 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-sm gap-1.5 shadow-2xs"
                >
                  <Plus size={14} />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>

              {/* View Website */}
              <Link href="/" target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 sm:h-9 text-xs font-semibold rounded-sm gap-1.5 border-border hidden sm:flex"
                >
                  <ExternalLink size={13} className="text-muted-foreground" />
                  View Store
                </Button>
              </Link>

              {/* User / Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-bold text-foreground line-clamp-1">
                    Administrator
                  </span>
                  <span className="text-[10px] text-muted-foreground">Super Admin</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 sm:h-9 text-xs font-semibold text-muted-foreground hover:text-red-500 gap-1.5 px-2"
                  title="Sign out of admin"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout (Sidebar + Content) ── */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Desktop Sidebar */}
        <aside className="w-60 bg-card border-r border-border hidden md:block shrink-0 min-h-[calc(100vh-64px)]">
          <div className="p-4 sticky top-16 space-y-6">
            <div className="px-2 pt-1">
              <AdminBrandLink />
            </div>
            <Suspense fallback={null}>
              <AdminSidebar />
            </Suspense>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
