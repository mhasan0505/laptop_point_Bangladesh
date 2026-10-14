import { getLiveBanners } from "@/lib/banners/service";
import Link from "next/link";

/** Global top strip fed by the `global.announcement` banner placement. */
export default async function AnnouncementBar() {
  const banners = await getLiveBanners("global.announcement");
  const first = banners
    .filter((b) => b.headline || b.title)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];
  if (!first) return null;

  const content = (
    <span className="flex items-center justify-center gap-2">
      <span>{first.headline || first.title}</span>
      {first.ctaLabel && (
        <span className="font-semibold underline underline-offset-2">
          {first.ctaLabel}
        </span>
      )}
    </span>
  );

  return (
    <div className="bg-gray-900 px-4 py-2 text-center text-xs text-white sm:text-sm">
      {first.linkHref ? (
        <Link href={first.linkHref} className="hover:text-red-300 transition-colors">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
