import {
  Store,
  LayoutTemplate,
  Compass,
  Layers,
  Sliders,
  CreditCard,
  FileText,
  Search,
  KeyRound,
  Users,
} from "lucide-react";
import type { SetupPermissionTarget } from "@/lib/settings-base";

export interface SetupNavItem {
  id: string;
  href: string;
  label: string;
  summary: string;
  target: SetupPermissionTarget;
  icon: typeof Store;
}

export interface SetupNavGroup {
  id: string;
  title: string;
  items: SetupNavItem[];
}

export const SETUP_NAV_GROUPS: SetupNavGroup[] = [
  {
    id: "store",
    title: "Store",
    items: [
      {
        id: "profile",
        href: "/admin/setup/profile",
        label: "Profile",
        summary: "Store name, contact channels, and physical showroom branches.",
        target: "store_profile",
        icon: Store,
      },
      {
        id: "homepage",
        href: "/admin/setup/homepage",
        label: "Homepage",
        summary: "Section visibility and storefront display order.",
        target: "homepage_layout",
        icon: LayoutTemplate,
      },
      {
        id: "menus",
        href: "/admin/setup/menus",
        label: "Menus",
        summary: "Header navigation links and shop category mega drawer.",
        target: "navigation",
        icon: Compass,
      },
    ],
  },
  {
    id: "catalog",
    title: "Catalog",
    items: [
      {
        id: "catalog",
        href: "/admin/setup/catalog",
        label: "Brands & categories",
        summary: "Official brand registry and category taxonomy for products.",
        target: "catalog_masters",
        icon: Layers,
      },
      {
        id: "product-standards",
        href: "/admin/setup/product-standards",
        label: "Product standards",
        summary: "Predefined conditions, grades, and warranty types.",
        target: "catalog_masters",
        icon: Sliders,
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    items: [
      {
        id: "delivery-payments",
        href: "/admin/setup/delivery-payments",
        label: "Delivery & payments",
        summary: "Shipping zones, delivery fees, and payment methods.",
        target: "commerce",
        icon: CreditCard,
      },
      {
        id: "policies",
        href: "/admin/setup/policies",
        label: "Policy pages",
        summary: "EMI plans, warranty terms, and customer assurances.",
        target: "commerce",
        icon: FileText,
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    items: [
      {
        id: "seo",
        href: "/admin/setup/seo",
        label: "SEO",
        summary: "Search engine titles, descriptions, and site verification.",
        target: "seo",
        icon: Search,
      },
      {
        id: "integrations",
        href: "/admin/setup/integrations",
        label: "Tracking & integrations",
        summary: "Analytics measurement IDs and connected service accounts.",
        target: "tracking",
        icon: KeyRound,
      },
    ],
  },
  {
    id: "team",
    title: "Team",
    items: [
      {
        id: "users",
        href: "/admin/users",
        label: "Users",
        summary: "Administrative accounts, staff roles, and access permissions.",
        target: "users",
        icon: Users,
      },
    ],
  },
];

export function getSectionStatus(
  itemId: string,
  settings?: Record<string, unknown> | null
): "configured" | "needs-attention" {
  if (!settings) return "configured";

  switch (itemId) {
    case "profile": {
      const p = settings.store_profile as { name?: string; hotline?: string } | undefined;
      if (!p?.name || !p?.hotline) return "needs-attention";
      return "configured";
    }
    case "integrations": {
      const t = settings.tracking as { ga4MeasurementId?: string; metaPixelId?: string } | undefined;
      // If neither GA4 nor Meta Pixel is configured, mark as needs attention
      if (!t?.ga4MeasurementId && !t?.metaPixelId) return "needs-attention";
      return "configured";
    }
    case "seo": {
      const s = settings.seo as { defaultTitle?: string; defaultDescription?: string } | undefined;
      if (!s?.defaultTitle || !s?.defaultDescription) return "needs-attention";
      return "configured";
    }
    default:
      return "configured";
  }
}
