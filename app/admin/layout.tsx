import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminLayoutClient from "./AdminLayoutClient";

/**
 * Server layout wrapper for /admin/*.
 * Exports noindex metadata (admin is also blocked in robots.txt).
 * Delegates all rendering to the client-side AdminLayoutClient.
 */
export const metadata: Metadata = {
  title: {
    template: "%s | Admin",
    default: "Admin Panel",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
