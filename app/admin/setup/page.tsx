"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ShieldAlert, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { useSetup } from "./setup-context";
import { SETUP_NAV_GROUPS, getSectionStatus, type SetupNavItem } from "./setup-nav";

const TAB_REDIRECT_MAP: Record<string, string> = {
  profile: "/admin/setup/profile",
  homepage: "/admin/setup/homepage",
  navigation: "/admin/setup/menus",
  catalog: "/admin/setup/catalog",
  commerce: "/admin/setup/delivery-payments",
  seo: "/admin/setup/seo",
  tracking: "/admin/setup/integrations",
  users: "/admin/users",
};

function MasterSetupOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams ? searchParams.get("tab") : null;
  const { userRole, canRead, warnings, settingsData, navigateWithConfirm } = useSetup();

  // Backward-compatibility: redirect old ?tab=... query parameters to clean section URLs
  useEffect(() => {
    if (rawTab && TAB_REDIRECT_MAP[rawTab]) {
      router.replace(TAB_REDIRECT_MAP[rawTab]);
    }
  }, [rawTab, router]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Master Setup"
        description="Overview of your store identity, homepage layout, navigation, catalog standards, and third-party integrations."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings", href: "/admin/setup" },
          { label: "Overview" },
        ]}
      />

      {/* Support Role Read-Only Notice */}
      {userRole === "support" && (
        <div className="p-3 rounded-lg bg-muted border border-border text-xs flex items-center gap-2 text-muted-foreground">
          <ShieldAlert className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span>You are logged in with the Support role. Master setup settings are read-only.</span>
        </div>
      )}

      {/* Schema Recovery Notice */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-xl border border-warning/30 bg-warning-soft text-foreground text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Some settings were reset to defaults</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            The following fields contained unexpected values and were safely recovered to default settings:
          </p>
          <ul className="text-[11px] list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
            {warnings.map((w, idx) => (
              <li key={idx}>
                <span className="font-semibold text-foreground">{w.group}</span>: field <code>{w.field}</code>
                {w.message ? ` (${w.message})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Grouped Section Cards */}
      <div className="space-y-6">
        {SETUP_NAV_GROUPS.map((group) => {
          const readableItems = group.items.filter((item: SetupNavItem) =>
            canRead(item.target)
          );
          if (readableItems.length === 0) return null;

          return (
            <div key={group.id} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                {group.title}
              </h2>

              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden shadow-2xs">
                {readableItems.map((item: SetupNavItem) => {
                  const Icon = item.icon;
                  const status = getSectionStatus(item.id, settingsData);

                  return (
                    <div
                      key={item.id}
                      onClick={() => navigateWithConfirm(item.href)}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item.summary}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge
                          status={status === "configured" ? "success" : "pending"}
                          label={status === "configured" ? "Configured" : "Needs attention"}
                        />
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MasterSetupOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-muted-foreground text-sm">
          Loading setup overview...
        </div>
      }
    >
      <MasterSetupOverviewContent />
    </Suspense>
  );
}
