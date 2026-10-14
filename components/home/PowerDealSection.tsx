import { formatBDT } from "@/lib/format";
import { getPublicPowerDeals } from "@/lib/public-content";
import { ArrowRight, Zap } from "lucide-react";
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

  return (
    <>
      <PromoBanner placement="home.power-deal" />
      <section
        aria-labelledby="power-deal-heading"
        className="mx-auto w-full max-w-[95%] py-8 md:py-12"
      >
        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-red-600 via-rose-600 to-orange-500 p-5 text-white shadow-lg md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-yellow-200">
                <Zap size={14} /> {config.savingsHighlight}
              </span>
              <h2
                id="power-deal-heading"
                className="text-3xl font-extrabold tracking-tight md:text-5xl"
              >
                {heading || config.title}
              </h2>
              <p className="text-sm text-white/90 md:text-base">
                {subheading || config.subtitle}
              </p>
            </div>
            <PowerDealCountdown targetDate={config.targetDate} />
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((deal) => {
              const savings =
                deal.savings ?? Math.max(0, deal.originalPrice - deal.salePrice);
              const href = deal.slug ? `/product/${deal.slug}` : "/deals";
              const outOfStock = (deal.stockStatus || "").toLowerCase().includes("out");
              return (
                <li key={deal.id}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col rounded-2xl bg-white p-4 text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <div className="relative mb-3 aspect-4/3 overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={deal.image || "/placeholder.png"}
                        alt={deal.name}
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                        className="object-contain p-3 transition group-hover:scale-105"
                        unoptimized={/^https?:\/\//i.test(deal.image || "")}
                      />
                      {savings > 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                          Save {formatBDT(savings)}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug">
                      {deal.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {[deal.cpu, deal.ram, deal.storage].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-auto flex items-baseline gap-2 pt-3">
                      <span className="text-lg font-extrabold text-red-600">
                        {formatBDT(deal.salePrice)}
                      </span>
                      {deal.originalPrice > deal.salePrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatBDT(deal.originalPrice)}
                        </span>
                      )}
                    </div>
                    {deal.stockStatus && (
                      <p
                        className={`mt-1 text-xs font-medium ${
                          outOfStock ? "text-gray-400" : "text-emerald-600"
                        }`}
                      >
                        {deal.stockStatus}
                        {typeof deal.stockQty === "number" &&
                        deal.stockQty > 0 &&
                        deal.stockQty <= 5
                          ? ` · only ${deal.stockQty} left`
                          : ""}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 text-right">
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              See all deals <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
