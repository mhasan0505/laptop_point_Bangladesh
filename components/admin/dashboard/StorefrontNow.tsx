"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Image as ImageIcon, Flame, ExternalLink, Edit3, Clock } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import type { StorefrontNowData } from "@/lib/admin-dashboard";

interface StorefrontNowProps {
  data: StorefrontNowData;
}

function PowerDealCountdown({ targetDate }: { targetDate: string | null }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return <span className="text-muted-foreground font-mono">Ongoing</span>;
  }

  if (timeLeft.expired) {
    return <span className="text-danger font-semibold font-mono">Campaign Ended</span>;
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold text-foreground">
      <span className="rounded bg-muted px-1.5 py-0.5">{String(timeLeft.days).padStart(2, "0")}d</span>
      <span>:</span>
      <span className="rounded bg-muted px-1.5 py-0.5">{String(timeLeft.hours).padStart(2, "0")}h</span>
      <span>:</span>
      <span className="rounded bg-muted px-1.5 py-0.5">{String(timeLeft.minutes).padStart(2, "0")}m</span>
      <span>:</span>
      <span className="rounded bg-muted px-1.5 py-0.5 text-primary">{String(timeLeft.seconds).padStart(2, "0")}s</span>
    </div>
  );
}

export function StorefrontNow({ data }: StorefrontNowProps) {
  const { heroBanner, powerDeal } = data;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Storefront Now
        </h2>
        <span className="text-xs text-muted-foreground">
          Live customer-facing promotional assets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Hero Banner Tile */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hero Banner · home.hero
                </span>
              </div>
              <StatusBadge status={heroBanner ? "active" : "inactive"} size="sm">
                {heroBanner ? "Live" : "No Banner"}
              </StatusBadge>
            </div>

            {heroBanner ? (
              <div className="flex gap-3.5 items-center">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={heroBanner.imageUrl}
                    alt={heroBanner.title}
                    fill
                    sizes="128px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-xs font-bold text-foreground truncate" title={heroBanner.title}>
                    {heroBanner.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Target: <span className="font-mono">{heroBanner.linkHref}</span>
                  </p>
                  <p className="text-[10px] text-success font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Currently active on storefront
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <p>No active banner in the home.hero placement.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px]"
            >
              View live site <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/banners"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1 text-xs"
            >
              <Edit3 className="h-3 w-3" />
              Edit banners
            </Link>
          </div>
        </div>

        {/* Active Power Deal Tile */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-warning-soft text-warning">
                  <Flame className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  The Power Deal
                </span>
              </div>
              <StatusBadge status={powerDeal ? "active" : "inactive"} size="sm">
                {powerDeal ? "Campaign Active" : "No Deal"}
              </StatusBadge>
            </div>

            {powerDeal ? (
              <div className="flex gap-3.5 items-center">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={powerDeal.image}
                    alt={powerDeal.name}
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <h3 className="text-xs font-bold text-foreground truncate" title={powerDeal.name}>
                    {powerDeal.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground font-mono">
                      ৳{powerDeal.salePrice.toLocaleString()}
                    </span>
                    {powerDeal.originalPrice > powerDeal.salePrice && (
                      <span className="text-[11px] text-muted-foreground line-through font-mono">
                        ৳{powerDeal.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <PowerDealCountdown targetDate={powerDeal.targetDate} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <p>No active featured deal configured.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
            <Link
              href="/power-deal"
              target="_blank"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px]"
            >
              View campaign <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/admin/power-deal"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1 text-xs"
            >
              <Edit3 className="h-3 w-3" />
              Edit power deal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
