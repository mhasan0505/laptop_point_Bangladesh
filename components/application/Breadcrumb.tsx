"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

const Breadcrumb = () => {
  const pathname = usePathname();

  // Don't show on home page
  if (pathname === "/") return null;

  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Map of path segments to readable names (optional)
  const segmentNameMap: Record<string, string> = {
    shop: "Shop",
    categories: "Categories",
    cart: "Shopping Cart",
    checkout: "Checkout",
    "track-order": "Track Order",
    about: "About Us",
    contact: "Contact",
    accessories: "Accessories",
  };

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    // Decodes URL encoded strings (e.g. "Gaming%20Mouse" -> "Gaming Mouse")
    // And capitalizes first letter or uses map
    const decodedSegment = decodeURIComponent(segment);
    const name =
      segmentNameMap[segment] ||
      decodedSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    return { name, href };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="py-3 bg-gray-50/50 border-b border-gray-100"
    >
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link
              href="/"
              className="flex items-center hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>

          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <Fragment key={crumb.href}>
                <li>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </li>
                <li>
                  {isLast ? (
                    <span
                      className="font-medium text-gray-900 capitalize"
                      aria-current="page"
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hover:text-primary transition-colors capitalize"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
