"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SetupProvider, useSetup } from "./setup-context";
import { SETUP_NAV_GROUPS, type SetupNavItem } from "./setup-nav";

function SetupLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canRead, navigateWithConfirm } = useSetup();
  const isOverview = pathname === "/admin/setup";

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-6rem)] pb-16">
      {/* Left Navigation Sidebar (Hidden on screens under 768px) */}
      <aside className="hidden md:block w-56 lg:w-64 shrink-0 border-r border-border pr-6">
        <div className="sticky top-6 space-y-6">
          {/* Overview Root Link */}
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigateWithConfirm("/admin/setup")}
              className={cn(
                "w-full justify-start gap-2.5 px-3 py-2 h-auto text-xs font-semibold text-left",
                isOverview
                  ? "bg-primary/10 text-primary font-bold dark:bg-primary/15 hover:bg-primary/15"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </Button>
          </div>

          {/* Grouped Navigation */}
          {SETUP_NAV_GROUPS.map((group) => {
            const readableItems = group.items.filter((item: SetupNavItem) =>
              canRead(item.target)
            );
            if (readableItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.title}
                </p>
                <div className="space-y-0.5 pt-1">
                  {readableItems.map((item: SetupNavItem) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant="ghost"
                        onClick={() => navigateWithConfirm(item.href)}
                        className={cn(
                          "w-full justify-start gap-2.5 px-3 py-2 h-auto text-xs font-medium text-left",
                          isActive
                            ? "bg-primary/10 text-primary font-bold dark:bg-primary/15 hover:bg-primary/15"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Mobile-Only Header with Back Arrow on Sub-routes */}
        {!isOverview && (
          <div className="md:hidden mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateWithConfirm("/admin/setup")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground p-1 -ml-1 h-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </Button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export default function SetupRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SetupProvider>
      <SetupLayoutContent>{children}</SetupLayoutContent>
    </SetupProvider>
  );
}
