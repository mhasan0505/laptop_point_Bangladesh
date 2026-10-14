"use client";

import Link from "next/link";
import { Plus, ShoppingBag, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GreetingBarProps {
  userName?: string;
  currentTimeDhaka?: string;
  pendingOrdersCount: number;
  onNewOrder: () => void;
}

export function GreetingBar({
  userName = "Administrator",
  currentTimeDhaka,
  pendingOrdersCount,
  onNewOrder,
}: GreetingBarProps) {
  // Determine time of day in Asia/Dhaka
  const now = new Date();
  const dhakaHourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "numeric",
    hour12: false,
  }).format(now);
  const hour = parseInt(dhakaHourStr, 10) || 12;

  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17 || hour < 5) {
    greeting = "Good evening";
  }

  // Format date in Asia/Dhaka
  const dateFormatted = currentTimeDhaka || new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const summary = pendingOrdersCount > 0
    ? `${pendingOrdersCount} ${pendingOrdersCount === 1 ? "order is" : "orders are"} waiting for you`
    : "All orders are fulfilled — no orders waiting for processing";

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {dateFormatted}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {userName}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {summary}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/products/new">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold rounded-lg border-border hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Add product
          </Button>
        </Link>

        <Button
          size="sm"
          onClick={onNewOrder}
          className="h-9 gap-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          New order
        </Button>

        <Link href="/admin/banners">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs font-semibold rounded-lg border-border hover:bg-muted"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Upload banner
          </Button>
        </Link>
      </div>
    </div>
  );
}
