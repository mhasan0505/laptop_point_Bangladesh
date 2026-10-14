"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  canAccessSetup,
  type SetupPermissionTarget,
} from "@/lib/settings-base";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

export interface FieldRecoveryWarningItem {
  group: string;
  field: string;
  message: string;
  recoveredTo: unknown;
}

interface SetupContextType {
  userRole: string;
  canRead: (target: SetupPermissionTarget) => boolean;
  canWrite: (target: SetupPermissionTarget) => boolean;
  warnings: FieldRecoveryWarningItem[];
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  navigateWithConfirm: (href: string) => void;
  refreshSettings: () => Promise<void>;
  settingsData: Record<string, unknown> | null;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("owner");
  const [warnings, setWarnings] = useState<FieldRecoveryWarningItem[]>([]);
  const [settingsData, setSettingsData] = useState<Record<string, unknown> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/setup");
      if (res.ok) {
        const data = await res.json();
        if (data.userRole) setUserRole(data.userRole);
        if (data.settings) setSettingsData(data.settings);

        if (Array.isArray(data.warnings)) {
          setWarnings(data.warnings);
        } else if (data.warnings && typeof data.warnings === "object") {
          setWarnings(
            Object.values(data.warnings).flat() as FieldRecoveryWarningItem[]
          );
        } else {
          setWarnings([]);
        }
      }
    } catch (err) {
      console.error("Error fetching setup permissions/data:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/setup");
        if (res.ok && !ignore) {
          const data = await res.json();
          if (data.userRole) setUserRole(data.userRole);
          if (data.settings) setSettingsData(data.settings);

          if (Array.isArray(data.warnings)) {
            setWarnings(data.warnings);
          } else if (data.warnings && typeof data.warnings === "object") {
            setWarnings(
              Object.values(data.warnings).flat() as FieldRecoveryWarningItem[]
            );
          } else {
            setWarnings([]);
          }
        }
      } catch (err) {
        console.error("Error fetching setup permissions/data:", err);
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  // Intercept browser window unload when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const canRead = useCallback(
    (target: SetupPermissionTarget) => canAccessSetup(userRole, target, "read"),
    [userRole]
  );

  const canWrite = useCallback(
    (target: SetupPermissionTarget) => canAccessSetup(userRole, target, "write"),
    [userRole]
  );

  const navigateWithConfirm = useCallback(
    (href: string) => {
      if (isDirty) {
        setPendingHref(href);
        setShowDiscardDialog(true);
      } else {
        router.push(href);
      }
    },
    [isDirty, router]
  );

  return (
    <SetupContext.Provider
      value={{
        userRole,
        canRead,
        canWrite,
        warnings,
        isDirty,
        setIsDirty,
        navigateWithConfirm,
        refreshSettings,
        settingsData,
      }}
    >
      {children}

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title="Unsaved Changes"
        description="You have unsaved changes in this section. If you leave without saving, these changes will be lost."
        confirmText="Discard & Leave"
        cancelText="Stay Here"
        variant="danger"
        onConfirm={() => {
          setShowDiscardDialog(false);
          setIsDirty(false);
          if (pendingHref) {
            router.push(pendingHref);
            setPendingHref(null);
          }
        }}
      />
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
}
