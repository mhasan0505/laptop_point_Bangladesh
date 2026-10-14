import { formatBDT } from "@/lib/format";
import { getPublicPowerDeals } from "@/lib/public-content";
import { ArrowRight, Clock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PowerDealCountdown from "./PowerDealCountdown";
import PromoBanner from "./PromoBanner";

interface PowerDealSectionProps {
  heading?: string;
  subheading?: string;
}

/** Homepage "Power Deal" block, driven by Admin → Power Deals CMS. */
export default async function PowerDealSection({
  heading,
  subheading,
}: PowerDealSectionProps) {
  const data = await getPublicPowerDeals();
  if (!data || data.deals.length === 0) return null;
  const { config, deals } = data;
  const displayDeals = deals.slice(0, 4); // Max 4 cards per §4.4

  return (
    <>
      <PromoBanner placement="home.power-deal" />
      <section
        aria-labelledby="power-deal-heading"
        className="py-8 sm:py-12 lg:py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Calm Navy Panel */}
          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-brand-navy p-6 sm:p-8 lg:p-10 text-white shadow-soft border border-brand-navy/30">
            {/* Header row with Countdown */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-8 border-b border-white/10">
              <div className="max-w-2xl space-y-2.5">
                {config.savingsHighlight && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-caption font-semibold uppercase tracking-wider text-white border border-white/10">
                    <Zap className="w-3.5 h-3.5 text-brand-red" aria-hidden="true" />
                    {config.savingsHighlight}
                  </span>
                )}
                <h2
                  id="power-deal-heading"
                  className="text-h2 font-bold tracking-tight text-white"
                >
                  {heading || config.title}
                </h2>
                <p className="text-body text-white/80 max-w-[65ch]">
                  {subheading || config.subtitle}
                </p>
              </div>

              {/* Countdown timer */}
              <div className="shrink-0">
                <div className="flex items-center gap-2 mb-2 text-caption font-medium text-white/80">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Offer ends in:</span>
                </div>
                <PowerDealCountdown targetDate={config.targetDate} />
              </div>
            </div>

            {/* Product Cards Grid (Max 4 cards) */}
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayDeals.map((deal) => {
                const savings =
                  deal.savings ?? Math.max(0, deal.originalPrice - deal.salePrice);
                const href = deal.slug ? `/product/${deal.slug}` : "/deals";
                const outOfStock = (deal.stockStatus || "").toLowerCase().includes("out");

                return (
                  <li key={deal.id}>
                    <Link
                      href={href}
                      className="group flex h-full flex-col rounded-[var(--radius-md)] bg-surface p-4 text-ink shadow-soft transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-navy"
                    >
                      {/* Image Frame */}
                      <div className="relative mb-3 aspect-4/3 w-full overflow-hidden rounded-[var(--radius-sm)] bg-surface-2 p-3 flex items-center justify-center">
                        <Image
                          src={deal.image || "/Hero_Image.png"}
                          alt={deal.name}
                          fill
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                          className="object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                          unoptimized={/^https?:\/\//i.test(deal.image || "")}
                        />
                        {savings > 0 && (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-red px-2 py-0.5 text-caption font-bold text-white shadow-xs">
                            Save {formatBDT(savings)}
                          </span>
                        )}
                      </div>

                      {/* Specs snippet */}
                      <p className="line-clamp-1 text-caption text-muted-text mb-1">
                        {[deal.cpu, deal.ram, deal.storage].filter(Boolean).join(" · ")}
                      </p>

                      {/* Title */}
                      <h3 className="line-clamp-2 text-small font-semibold text-ink group-hover:text-brand-navy transition-colors min-h-[2.5rem] leading-snug">
                        {deal.name}
                      </h3>

                      {/* Stock indication */}
                      {deal.stockStatus && (
                        <div className="mt-auto pt-2 flex items-center gap-1.5 text-caption">
                          {outOfStock ? (
                            <span className="text-muted-text font-medium">Out of stock</span>
                          ) : (
                            <span className="text-success font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-success" />
                              {deal.stockStatus}
                              {typeof deal.stockQty === "number" &&
                              deal.stockQty > 0 &&
                              deal.stockQty <= 5
                                ? ` · Only ${deal.stockQty} left`
                                : ""}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price Row */}
                      <div className="flex items-baseline gap-2 pt-2 mt-1 border-t border-line/60">
                        <span className="text-h3 font-bold text-brand-red tabular-nums leading-none">
                          {formatBDT(deal.salePrice)}
                        </span>
                        {deal.originalPrice > deal.salePrice && (
                          <span className="text-small text-muted-text line-through tabular-nums">
                            {formatBDT(deal.originalPrice)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Bottom link */}
            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <Link
                href="/deals"
                className="inline-flex items-center gap-1.5 text-small font-semibold text-white/90 hover:text-white transition-colors group"
              >
                <span>View all power deals</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
