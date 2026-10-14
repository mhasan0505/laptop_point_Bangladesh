import { getLiveBanners, type LiveBannerItem } from "@/lib/banners/service";
import Image from "next/image";
import Link from "next/link";

interface PromoBannerProps {
  /** Banner placement id managed under Admin → Banner Manager. */
  placement: string;
  /** Tailwind aspect classes for the banner frame. */
  aspectClassName?: string;
  className?: string;
}

const isRemote = (src: string) => /^https?:\/\//i.test(src);

function BannerImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1280px) 1200px, 100vw"
      className={className}
      // Remote hosts are not all whitelisted in next.config; serve as-is.
      unoptimized={isRemote(src)}
    />
  );
}

function BannerCard({
  banner,
  aspectClassName,
}: {
  banner: LiveBannerItem;
  aspectClassName: string;
}) {
  const desktop = banner.desktopImageUrl;
  if (!desktop) return null;
  const mobile = banner.mobileImageUrl;
  const hasMobile = Boolean(mobile && mobile !== desktop);
  const alt = banner.alt || banner.title;

  const body = (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-muted ${aspectClassName}`}
    >
      {hasMobile && mobile && (
        <BannerImage src={mobile} alt={alt} className="object-cover sm:hidden" />
      )}
      <BannerImage
        src={desktop}
        alt={alt}
        className={`object-cover ${hasMobile ? "hidden sm:block" : ""}`}
      />
      {(banner.headline || banner.subtext || banner.ctaLabel) && (
        <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-linear-to-r from-black/55 via-black/20 to-transparent p-6 text-white md:p-12">
          {banner.headline && (
            <h3 className="max-w-xl text-2xl font-extrabold leading-tight md:text-4xl">
              {banner.headline}
            </h3>
          )}
          {banner.subtext && (
            <p className="max-w-lg text-sm text-white/90 md:text-base">
              {banner.subtext}
            </p>
          )}
          {banner.ctaLabel && (
            <span className="mt-2 inline-flex w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900">
              {banner.ctaLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return banner.linkHref ? (
    <Link
      href={banner.linkHref}
      className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {body}
    </Link>
  ) : (
    body
  );
}

/**
 * Renders the live banners of a placement. Renders nothing when the placement
 * has no live banner, so unconfigured sections never leave an empty gap.
 */
export default async function PromoBanner({
  placement,
  aspectClassName = "aspect-[16/6] sm:aspect-[16/3.75]",
  className = "",
}: PromoBannerProps) {
  const banners = await getLiveBanners(placement);
  const visible = banners
    .filter((b) => b.desktopImageUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (visible.length === 0) return null;

  return (
    <section
      aria-label={visible[0].title}
      className={`mx-auto w-full max-w-[95%] py-6 md:py-10 ${className}`}
    >
      <div className={visible.length > 1 ? "grid gap-4 md:grid-cols-2" : ""}>
        {visible.map((b) => (
          <BannerCard key={b.id} banner={b} aspectClassName={aspectClassName} />
        ))}
      </div>
    </section>
  );
}
