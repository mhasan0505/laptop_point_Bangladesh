"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

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
      className={className ?? "flex items-center"}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Logo.webp"
        alt="Laptop Point Admin"
        width={200}
        height={48}
        className="object-contain w-auto h-12"
      />
    </Link>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Login page renders without the shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Still checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    router.replace("/admin/login");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

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
                    <AdminBrandLink onClick={() => setIsOpen(false)} />
                  </div>
                  <div className="p-4">
                    <AdminSidebar onNavigate={() => setIsOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mobile logo shown in header; desktop logo stays in sidebar */}
              <AdminBrandLink className="flex items-center md:hidden" />
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
            <div className="flex items-center mb-6 px-3">
              <AdminBrandLink />
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
